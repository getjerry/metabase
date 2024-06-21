(ns metabase.jerry.extend-call
    (:require
      [cheshire.core :as json]
      [clj-http.client :as http]
      [clojure.core.async :as a]
      [metabase.config :as config]
      [metabase.util.log :as log]
      [metabase.util.i18n :refer [trs]])
    (:import
      (java.util UUID)))

(defn post-call
  "call jerry metabase extend post api"
  [params user_id]
  (println "params" params)
  (let [start-time     (System/currentTimeMillis)
        api-url-base   (or (config/config-str :jerry-metabase-extend-api) "http://127.0.0.1:8000/api/metabase")
        api-token      (or (config/config-str :jerry-search-token) "")
        call           (get params :call "post")
        service-name   (get params :service_name "")
        api-url        (str api-url-base "/" service-name)
        query-params   (get params :params "")
        body-params    (get params :body {})

        headers        {"accept"  "application/json"
                        "token"   api-token
                        "user_id" user_id}
        api-timeout-ms 8000
        response       (try
                         (if (= call "get")
                           (http/get api-url
                                     {:headers            headers
                                      :query-params       query-params
                                      :socket-timeout     api-timeout-ms
                                      :connection-timeout api-timeout-ms})
                           (http/post api-url
                                      {:body               (json/generate-string body-params)
                                       :headers            headers
                                       :socket-timeout     api-timeout-ms
                                       :connection-timeout api-timeout-ms}))
                         (catch Exception e
                           {:status 400, :body (.getMessage e)}))]
    (try
      (let [status        (:status response)
            body          (:body response)
            end-time      (System/currentTimeMillis)
            response-time (- end-time start-time)]
        (if (= status 200)
          (let [body-json (json/parse-string body true)]
            (log/info
             (trs "Jerry metabase extend Successful. Response Time: {0}" response-time))
            body-json)
          (do
            (log/error
             (trs "Jerry metabase extend returned non-2xx status: {0}, body: {1}, Response Time: {2}"
                  status body response-time))
            {})))
      (catch Exception e
        (log/error e (trs "Error while calling Jerry metabase extend API"))
        {}))))
