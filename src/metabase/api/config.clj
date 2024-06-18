(ns metabase.api.config
    "/api/config endpoints"
    (:require
      [metabase.api.common :as api]
      [metabase.models.config
       :as config
       :refer [Config]]
      [metabase.util :as u]
      [metabase.util.i18n :refer [tru]]
      [metabase.util.schema :as su]
      [schema.core :as s]
      [toucan.db :as db]
      [toucan.hydrate :refer [hydrate]]))

(api/defendpoint-schema GET "/type/:config-type"
  "get config type from metabase-config table"
  [config-type]
  (db/select-one Config :config-type config-type))


#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint-schema PUT "/type/:config-type"
  "Update the config of 'metabase-config'"
  [config-type :as {{:keys [config]} :body}]
  (db/update-where! Config {:config_type config-type}
                    :config config)
  (db/select-one Config :config_type config-type))

(api/define-routes)
