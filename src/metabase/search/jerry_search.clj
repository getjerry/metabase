(ns metabase.search.jerry-search
    "Jerry searching api"
    (:require
      [cheshire.core :as json]
      [clj-http.client :as http]
      [metabase.config :as config]
      [metabase.util.log :as log]
      [metabase.util.i18n :refer [trs]]))

(defn build-api-url
  "Build API URL based on search context"
  [api-host q archived table_db_id models limit offset]
  (let [params    (->>
                   [{:key "q" :val q}
                    {:key "archived" :val archived}
                    {:key "table_db_id" :val table_db_id}
                    {:key "models" :val models}
                    {:key "limit" :val limit}
                    {:key "offset" :val offset}]
                   (filter #(some? (:val %)))
                   (map #(str (:key %) "=" (:val %))))
        query-str (clojure.string/join "&" params)]
    (str api-host "?" query-str)))

(defn jerry-search-func
  [q archived table_db_id models limit offset]
  (let [start-time     (System/currentTimeMillis)
        api-host       (or (config/config-str :jerry-search-api) "http://127.0.0.1:5500/api/search")
        api-url        (build-api-url api-host q archived table_db_id models limit offset)
        api-token      (or (config/config-str :jerry-search-token) "")
        headers        {"accept" "application/json"
                        "token" api-token}
        api-timeout-ms 8000
        response       (try
                         (http/get api-url {:headers headers})
                         (catch Exception e
                           {:status 400, :body (.getMessage e)}))]
    (try
      (let [status        (:status response)
            body          (:body response)
            end-time      (System/currentTimeMillis)
            response-time (- end-time start-time)]
        (if (= status 200)
          (let [body-json (json/parse-string body true)]
            (log/info (trs "Jerry search Successful. Response Time: {0}" response-time))
            body-json)
          (do
            (log/error
             (trs "Jerry search returned non-2xx status: {0}, body: {1}, Response Time: {2}" status body response-time))
            {})))
      (catch Exception e
        (log/error e (trs "Error while calling Jerry searching API"))
        {}))))
