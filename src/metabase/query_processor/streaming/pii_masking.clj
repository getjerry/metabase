(ns metabase.query-processor.streaming.pii-masking
    "Dynamic Masking"
    (:require
      [cheshire.core :as json]
      [clj-http.client :as http]
      [metabase.config :as config]
      [metabase.util.log :as log]
      [metabase.util.i18n :refer [trs]]))

(defn send-results-to-pii-marking [metadata rows current-user]
  (let [data {:data (assoc metadata :rows rows) :user_info current-user}
        json-str (json/generate-string data)
        api-url (or (config/config-str :jerry-pii-masking-api) "http://127.0.0.1:5500/api/mask")
        api-timeout-ms (or (config/config-int :jerry-pii-masking-api-timeout) 10000)
        start-time (System/currentTimeMillis)
        response (try
                   (http/post api-url {:form-params data, :content-type :json, :timeout api-timeout-ms})
                   (catch Exception e
                     {:status 400, :body (.getMessage e)}))]
    (try
      (let [status (:status response)
            body (:body response)
            end-time (System/currentTimeMillis)
            response-time (- end-time start-time)]
        (if (= status 200)
          (let [body-json (json/parse-string body true)
                body-cols (:cols body-json)
                body-rows (:rows body-json)]
            (log/info (trs "Jerry Pii Masking {0} Successful. Response Time: {1}" api-url response-time)) ;; Add response time parameter to the log
            {:data metadata :rows body-rows})
          (do
            (log/error (trs "Jerry Pii Masking {0} returned non-2xx status: {1}" api-url status))
            {:data metadata :rows rows})))
      (catch Exception e
        (log/error e (trs "Error while calling Jerry Pii Masking API"))
        {:data metadata :rows rows}))))
