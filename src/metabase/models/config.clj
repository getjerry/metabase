(ns metabase.models.config
    (:require
      [honey.sql.helpers :as sql.helpers]
      [metabase.db.connection :as mdb.connection]
      [metabase.db.query :as mdb.query]
      [metabase.models.interface :as mi]
      [metabase.models.setting :as setting]
      [metabase.plugins.classloader :as classloader]
      [metabase.public-settings.premium-features :as premium-features]
      [metabase.util :as u]
      [metabase.util.i18n :refer [tru]]
      [toucan.db :as db]
      [toucan.models :as models]))

(models/defmodel Config :metabase_config)
