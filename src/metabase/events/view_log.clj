(ns metabase.events.view-log
    (:require
      [clojure.core.async :as a]
      [clojure.string :as str]
      [java-time :as t]
      [metabase.api.common :as api]
      [metabase.config :as config]
      [metabase.db.connection :as mdb.connection]
      [metabase.db.query :as mdb.query]
      [metabase.events :as events]
      [metabase.models.setting
       :as    setting
       :refer [defsetting]]
      [metabase.models.view-log :refer [ViewLog]]
      [metabase.server.middleware.session :as mw.session]
      [metabase.util.honey-sql-2 :as h2x]
      [metabase.util.i18n :as i18n
       :refer                 [deferred-tru]]
      [metabase.util.log :as log]
      [toucan.db :as db]))

(def ^:private view-log-topics
  "The `Set` of event topics which we subscribe to for view counting."
  #{:card-create
    :card-read
    :card-query
    :dashboard-read
    :table-read})

(defonce
  ^:private ^{:doc "Channel for receiving event notifications we want to subscribe to for view counting."}
  view-log-channel
  (a/chan))


;;; ## ---------------------------------------- PER-USER VIEWS ----------------------------------------

(defn- bookmarks-query
  [user-id]
  (let [as-null (when (= (mdb.connection/db-type) :postgres) (h2x/->integer nil))]
    {:select [[:type :model] [:item_id :model_id]]
     :from   [[{:union-all [{:select [:card_id
                                      [as-null :dashboard_id]
                                      [as-null :collection_id]
                                      [:card_id :item_id]
                                      [(h2x/literal "card") :type]
                                      :created_at]
                             :from   [:card_bookmark]
                             :where  [:= :user_id [:inline user-id]]}
                            {:select [[as-null :card_id]
                                      :dashboard_id
                                      [as-null :collection_id]
                                      [:dashboard_id :item_id]
                                      [(h2x/literal "dashboard") :type]
                                      :created_at]
                             :from   [:dashboard_bookmark]
                             :where  [:= :user_id [:inline user-id]]}]}
               :bookmarks]]}))

(defn- recent-views-from-view-log
  [user-id]
  (let [bookmarks (bookmarks-query user-id)
        qe        {:select [[(h2x/literal "qe") :source]
                            [:executor_id :user_id]
                            :context
                            [:started_at :timestamp]
                            [(h2x/literal "card") :model]
                            [:card_id :model_id]
                            [false :dataset]]
                   :from   :query_execution}
        vl        {:select    [[(h2x/literal "vl") :source]
                               :user_id
                                [(h2x/literal "question") :context]
                               :timestamp
                                :model
                               :model_id
                                [:report_card.dataset :dataset]]
                   :from      [:view_log]
                   :left-join [:report_card
                               [:and
                                [:= :view_log.model (h2x/literal "card")]
                                [:= :view_log.model_id :report_card.id]]]}
        views     {:union-all [qe vl]}]
    (mdb.query/query
     {:select   [[[:max :timestamp] :timestamp]
                 :model
                 :model_id]
      :from     [[views :views]]
      :where    [[:and
                  [:= :user_id [:inline user-id]]
                  [:>= :timestamp (t/minus (t/offset-date-time) (t/days 30))]
                  [:not= :context (h2x/literal "pulse")]
                  [:not= :context (h2x/literal "collection")]
                  [:not= :context (h2x/literal "ad-hoc")]
                  [:not=
                   [:composite :context :model]
                   [:composite (h2x/literal "dashboard") (h2x/literal "card")]]
                  [:not=
                   [:composite :source :model :dataset]
                   [:composite (h2x/literal "vl") (h2x/literal "card") [:inline false]]]
                  [:not-in [:composite :model :model_id] bookmarks]]]
      :group-by [:model :model_id]
      :order-by [[:timestamp :desc]]
      :limit    [:inline 8]})))

(defsetting user-recent-views
  (deferred-tru "List of the 50 most recently viewed items for the user.")
  :user-local :only
  :type :json
  :getter
  (fn []
    (let [value (setting/get-value-of-type :json :user-recent-views)]
      (if value
        (vec value)
        (let [views (mapv #(select-keys % [:model :model_id])
                          (recent-views-from-view-log api/*current-user-id*))]
          (setting/set-value-of-type! :json :user-recent-views views)
          views)))))

;; TODO: remove this setting as part of Audit V2 project.
(defsetting most-recently-viewed-dashboard
  (deferred-tru "The Dashboard that the user has most recently viewed within the last 24 hours.")
  :user-local :only
  :type :json
  :getter
  (fn []
    (let [{:keys [id timestamp] :as value} (setting/get-value-of-type :json :most-recently-viewed-dashboard)
          yesterday                        (t/minus (t/zoned-date-time) (t/hours 24))]
      ;; If the latest view is older than 24 hours, return 'nil'
      (when (and value (t/after? (t/zoned-date-time timestamp) yesterday))
            id)))
  :setter
  (fn [id]
    (when id
          ;; given a dashboard's ID, save it with a timestamp of 'now', for comparing later in the getter
          (setting/set-value-of-type! :json :most-recently-viewed-dashboard {:id id :timestamp (t/zoned-date-time)}))))

;;; ## ---------------------------------------- EVENT PROCESSING ----------------------------------------

(defn- record-view!
  "Simple base function for recording a view of a given `model` and `model-id` by a certain `user`."
  [model model-id user-id metadata]
  ;; TODO - we probably want a little code that prunes old entries so that this doesn't get too big
  (db/insert! ViewLog
              :user_id  user-id
              :model    model
              :model_id model-id
              :metadata metadata))

(defn- update-users-recent-views!
  [user-id model model-id]
  (when user-id
        (mw.session/with-current-user user-id
                                      (let [view        {:model    (name model)
                                                         :model_id model-id}
                                            prior-views (remove #{view} (user-recent-views))]
                                        (when (= model "dashboard") (most-recently-viewed-dashboard! model-id))
                                        (when-not ((set prior-views) view)
                                                  (let [new-views (vec (take 50 (conj prior-views view)))]
                                                    (user-recent-views! new-views)))))))

(defn handle-view-event!
  "Handle processing for a single event notification received on the view-log-channel"
  [event]
  ;; try/catch here to prevent individual topic processing exceptions from bubbling up.  better to handle them here.
  (try
    (when-let [{topic :topic object :item} event]
      (let [model                          (events/topic->model topic)
            model-id                       (events/object->model-id topic object)
            user-id                        (events/object->user-id object)
            {:keys [context] :as metadata} (events/object->metadata object)]
        (when
         (and (#{:card-query :dashboard-read :table-read} topic)
              ((complement #{:collection :dashboard}) context))
         ;; we don't want to count pinned card views
         (update-users-recent-views! user-id model model-id))
        (record-view! model model-id user-id metadata)))
    (catch Throwable e
      (log/warn (format "Failed to process activity event. %s" (:topic event)) e))))

;;; ## ---------------------------------------- LIFECYLE ----------------------------------------

(defmethod events/init! ::ViewLog
           [_]
           (events/start-event-listener! view-log-topics view-log-channel handle-view-event!))


(defmethod events/init! ::ViewLog
           [_]
           (events/start-event-listener! view-log-topics view-log-channel handle-view-event!))

(defn recent-view-sql
  [user-id]
  (let [time-condition    (if config/is-prod? "AND timestamp >= NOW() - INTERVAL '30 days'" "")
        context-condition (if config/is-prod?
                            "and ((metadata::json->>'context')  = 'question' or (metadata::json->>'context') is null)"
                            "")]
    (str/replace
     (str "SELECT
            view_log.model as model,
            view_log.model_id as model_id,
            coalesce(report_dashboard.name, report_card.name, metabase_table.name) as name,
            coalesce(report_dashboard.description, report_card.description, metabase_table.description) as description
          FROM (
            SELECT *
            FROM (
              SELECT model, model_id, timestamp,
                     ROW_NUMBER() OVER (PARTITION BY model, model_id ORDER BY timestamp DESC) AS row_num
              FROM view_log
              WHERE user_id = ? "
          context-condition "
                    and model in ('card', 'dashboard') "
          time-condition "
            ) AS recent_logs
            WHERE row_num = 1
            ORDER BY timestamp desc
            LIMIT 10
          ) view_log
          LEFT JOIN report_card
          ON report_card.id = view_log.model_id AND view_log.model = 'card'
          LEFT JOIN report_dashboard
          ON report_dashboard.id = view_log.model_id AND view_log.model = 'dashboard'
          LEFT JOIN metabase_table
          ON metabase_table.id = view_log.model_id AND view_log.model = 'table'
          ORDER BY view_log.timestamp desc")
     #"\?"
     (str user-id))))

(defn recent-activity-sql
  [user-id]
  (str/replace
   (str "SELECT
            activity_log.model as model,
            activity_log.model_id as model_id,
            coalesce(report_dashboard.name, report_card.name) as name,
            coalesce(report_dashboard.description, report_card.description) as description
          FROM (
            SELECT *
            FROM (
              SELECT model,
                     model_id,
                     timestamp,
                     ROW_NUMBER() OVER (PARTITION BY model, model_id ORDER BY timestamp DESC) AS row_num
              from activity
              where user_id = ?
                  and topic in ('dashboard-add-cards', 'dashboard-create', 'card-create', 'card-update')
            ) AS activity_log
            WHERE row_num = 1
            ORDER BY timestamp desc
            LIMIT 10
          ) activity_log
          LEFT JOIN report_card
          ON report_card.id = activity_log.model_id AND activity_log.model = 'card'
          LEFT JOIN report_dashboard
          ON report_dashboard.id = activity_log.model_id AND activity_log.model = 'dashboard'
          ORDER BY activity_log.timestamp desc")
   #"\?"
   (str user-id)))

(defn frequent-view-sql
  []
  (if config/is-prod?
    "with views as (
        select
            model,
            model_id,
            max(timestamp) as last_requested_at,
            count(distinct user_id) as view_count
        from view_log
        where model in ('card', 'dashboard')
            and  timestamp >= current_timestamp - (interval '30 days')
            and ((metadata::json->>'context')  = 'question' or (metadata::json->>'context') is null)
        group by model, model_id
        order by view_count desc
        limit 10
    )
    select
        views.model,
        views.model_id,
        case when views.model = 'card' then report_card.name
             when views.model = 'dashboard' then report_dashboard.name
        end as name,
        case when views.model = 'card' then 'https://metabase.ing.getjerry.com/question/' || report_card.id
             when views.model = 'dashboard' then 'https://metabase.ing.getjerry.com/dashboard/' || report_dashboard.id
        end as link,
        views.view_count,
        core_user.first_name || ' ' ||core_user.last_name as creator,
        case when views.model = 'card' then report_card.created_at
             when views.model = 'dashboard' then report_dashboard.created_at
        end as created_at,
        views.last_requested_at,
        case when views.model = 'card' then report_card.description
             when views.model = 'dashboard' then report_dashboard.description
        end as description
    from  views
    left join report_card on report_card.id = views.model_id and views.model = 'card'
    left join report_dashboard on report_dashboard.id = views.model_id and views.model = 'dashboard'
    left join core_user on (core_user.id = report_card.creator_id or core_user.id = report_dashboard.creator_id)
    where (
            (views.model='card' and report_card.archived = false and (report_card.query_type = 'native' or report_card.query_type is null))
            or (views.model='dashboard' and report_dashboard.archived = false )
          )
    order by view_count
    desc"

    "select
        views.model,
        views.model_id,
        case when views.model = 'card' then report_card.name
             when views.model = 'dashboard' then report_dashboard.name
        end as name,
        case when views.model = 'card' then 'https://metabase.ing.getjerry.com/question/' || report_card.id
             when views.model = 'dashboard' then 'https://metabase.ing.getjerry.com/dashboard/' || report_dashboard.id
        end as link,
        views.view_count,
        core_user.first_name || ' ' ||core_user.last_name as creator,
        case when views.model = 'card' then report_card.created_at
             when views.model = 'dashboard' then report_dashboard.created_at
        end as created_at,
        views.last_requested_at,
        case when views.model = 'card' then report_card.description
             when views.model = 'dashboard' then report_dashboard.description
        end as description
    from  (
        select
            model,
            model_id,
            max(timestamp) as last_requested_at,
            count(distinct user_id) as view_count
        from view_log
        where model in ('card', 'dashboard')
        group by model, model_id
        order by view_count desc
        limit 10
    ) as views
    left join report_card on report_card.id = views.model_id and views.model = 'card'
    left join report_dashboard on report_dashboard.id = views.model_id and views.model = 'dashboard'
    left join core_user on (core_user.id = report_card.creator_id or core_user.id = report_dashboard.creator_id)
    where (
            (views.model='card' and report_card.archived = false and (report_card.query_type = 'native' or report_card.query_type is null))
            or (views.model='dashboard' and report_dashboard.archived = false )
          )
    order by view_count
    desc"))

(defn add-model-object [query-results]
  (map
   #(assoc % :model_object
     {:authority_level    nil
      :description        (:description %)
      :archived           false
      :name               (:name %)
      :moderation_reviews []
      :moderated_status   nil
      :id                 (:model_id %)
      :display            (:model %)})
   query-results))

(defn execute-query-recent-views!
  [user_id]
  (let [sql    (recent-view-sql user_id)
        result (db/query sql)]
    (add-model-object result)))

(defn execute-query-recent-activity!
  [user_id]
  (let [sql    (recent-activity-sql user_id)
        result (db/query sql)]
    result))

(defn execute-query-frequent_view!
  []
  (let [sql    (frequent-view-sql)
        result (db/query sql)]
    result))
