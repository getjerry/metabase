(ns metabase.api.jerry
    (:require
      [clojure.string :as str]
      [compojure.core :refer [GET]]
      [medley.core :as m]
      [metabase.api.common :as api]
      [metabase.api.common.validation :as validation]
      [metabase.jerry.event :as jerry.e]
      [metabase.jerry.extend-call :as jerry.extend]
      [metabase.util.honey-sql-2 :as h2x]
      [toucan.db :as db]
      [toucan.hydrate :refer [hydrate]]))


#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint POST "/event"
  "Add track event to jerry data platform"
  [:as {{:keys [event meta]} :body}]
  {event    [:maybe map?]
   meta [:maybe map?]}
  (jerry.e/track-event event meta))


#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint POST "/extend"
  "Post call jerry metabase extend api"
  [:as {params :body}]
  (jerry.extend/post-call params api/*current-user-id*)
  )


(api/define-routes)
