(ns metabase.jerry.event
    (:require
      [cheshire.core :as json]
      [clj-http.client :as http]
      [clojure.core.async :as a]
      [metabase.config :as config]
      [metabase.util.log :as log]
      [metabase.util.i18n :refer [trs]])
    (:import
      (java.util UUID)))

(defn build-event-body
  "Build HTTP track event body"
  [event meta]
  (let [release-env (if config/is-prod? "prod" "test")]
    (merge
     {:clientType    "Clojure"
      :releaseEnv    release-env
      :url           ""
      :title         ""
      :referrer      ""
      :userAgent     ""
      :language      "en-US"
      :sessionID     ""
      :eventCategory (:eventCategory event)
      :eventAction   (:eventAction event)
      :eventLabel    (:eventLabel event)
      :userID        ""
      :uuid          (str (UUID/randomUUID))
      :eventMetadata meta})))


(defn track-event
  "Add track event"
  [event meta]
  (let [start-time      (System/currentTimeMillis)
        api-url         (or (config/config-str :jerry-track-event-api) "http://127.0.0.1:5500/track")
        headers         {"Content-Type" "text/plain"}
        api-timeout-ms  8000
        data            (build-event-body event meta)
        data-str        (json/generate-string data)
        response        (try
                          (http/post api-url
                                     {:body              data-str
                                      :headers           headers
                                      :socket-timeout     api-timeout-ms
                                      :connection-timeout api-timeout-ms})
                          (catch Exception e
                            {:status 400, :body (.getMessage e)}))]
    (try
      (let [status        (:status response)
            body          (:body response)
            end-time      (System/currentTimeMillis)
            response-time (- end-time start-time)]
        (if (= status 200)
          (let [body-json (json/parse-string body true)]
            (log/info (trs "Jerry track event Successful. Response Time: {0}" response-time))
            body-json)
          (do
            (log/error
             (trs "Jerry track event returned non-2xx status: {0}, body: {1}, Response Time: {2}" status body response-time))
            nil)))
      (catch Exception e
        (log/error e (trs "Error while calling Jerry event API"))
        nil))))


(defn track-event-async
  "Add track event async"
  [event meta]
   (a/go (track-event event meta)))
