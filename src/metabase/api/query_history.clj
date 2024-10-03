(ns metabase.api.query-history
  (:require
   [compojure.core :refer [GET]]
   [metabase.api.common :as api]
   [metabase.util :as u]
   [honey.sql.helpers :as sql.helpers]
   [toucan.db :as db]))

(defn query-history
  "Return the last 100 queries executed by a user."
  [user-or-id]
  (let [user-id (u/the-id user-or-id)
        honeysql-form (-> (sql.helpers/select :hash :database_id :result_rows :started_at :native :running_time :query :name)
                          (sql.helpers/from :query_execution)
                          (sql.helpers/join :query [:= :query.query_hash :query_execution.hash] )
                          (sql.helpers/join :metabase_database [:= :metabase_database.id :query_execution.database_id] )
                          (sql.helpers/where [:= :executor_id user-id])
                          (sql.helpers/where [:is :dashboard_id nil])
                          (sql.helpers/where [:is :card_id nil])
                          (sql.helpers/order-by [:started_at :desc])
                          (sql.helpers/limit 100)
                          )
        ]

    (db/query honeysql-form)))

#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint-schema GET "/current"
  "Fetch recent logins for the current user."
  []
  (query-history api/*current-user-id*))

(api/define-routes)
