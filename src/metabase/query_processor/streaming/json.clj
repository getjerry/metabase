(ns metabase.query-processor.streaming.json
  "Impls for JSON-based QP streaming response types. `:json` streams a simple array of maps as opposed to the full
  response with all the metadata for `:api`."
  (:require
   [cheshire.core :as json]
   [java-time :as t]
   [metabase.query-processor.streaming.common :as common]
   [metabase.query-processor.streaming.pii-masking :as masking]
   [metabase.query-processor.streaming.interface :as qp.si]
   [metabase.util.date-2 :as u.date])
  (:import
   (java.io BufferedWriter OutputStream OutputStreamWriter)
   (java.nio.charset StandardCharsets)))

(set! *warn-on-reflection* true)

(defmethod qp.si/stream-options :json
  ([_]
   (qp.si/stream-options :json "query_result"))
  ([_ filename-prefix]
   {:content-type "application/json; charset=utf-8"
    :status       200
    :headers      {"Content-Disposition" (format "attachment; filename=\"%s_%s.json\""
                                                 (or filename-prefix "query_result")
                                                 (u.date/format (t/zoned-date-time)))}}))

(defmethod qp.si/streaming-results-writer :json
  [_ ^OutputStream os current-user]
  (let [writer    (BufferedWriter. (OutputStreamWriter. os StandardCharsets/UTF_8))
        col-names (volatile! nil)
        val-output-order (volatile! nil)
        rows (volatile! [])]
    (reify qp.si/StreamingResultsWriter
      (begin! [_ {{:keys [ordered-cols]} :data} _]
        ;; TODO -- wouldn't it make more sense if the JSON downloads used `:name` preferentially? Seeing how JSON is
        ;; probably going to be parsed programatically
        (vreset! col-names (mapv (some-fn :display_name :name) ordered-cols))
        (.write writer "[\n"))

      (write-row! [_ row row-num _ {:keys [output-order]}]
                  (vreset! val-output-order output-order)
                  (vswap! rows conj row))

      (finish! [_ {:keys [data]}]
         (let [new-rows (deref rows)
               output-order (deref val-output-order)
               pii-masked-data (masking/send-results-to-pii-marking data new-rows current-user)]
           (let [new-rows (:rows pii-masked-data)]
             (doseq [row new-rows]
               (let [ordered-row (if output-order
                                   (let [row-v (into [] row)]
                                     (for [i output-order] (row-v i)))
                                   row)]
                 (json/generate-stream (zipmap @col-names (map common/format-value ordered-row))
                                       writer)
                 (when-not (= row (last new-rows))
                           (.write writer ",\n")))))
           (.write writer "\n]")
           (.flush writer)
           (.flush os)
           (.close writer))))))

(defmethod qp.si/stream-options :api
  ([_]   (qp.si/stream-options :api nil))
  ([_ _] {:content-type "application/json; charset=utf-8"}))

(defn- map->serialized-json-kvs
  "{:a 100, :b 200} ; -> \"a\":100,\"b\":200"
  ^String [m]
  (when (seq m)
    (let [s (json/generate-string m)]
      (.substring s 1 (dec (count s))))))

(defmethod qp.si/streaming-results-writer :api
   [_ ^OutputStream os current-user]
   (let [writer (BufferedWriter. (OutputStreamWriter. os StandardCharsets/UTF_8))
         rows (volatile! [])]
     (reify qp.si/StreamingResultsWriter
        (begin! [_ _ _]
                (.write writer "{\"data\":{\"rows\":[\n"))

        (write-row! [_ row row-num cols _]
                    (vswap! rows conj row))

        (finish! [_ {:keys [data], :as metadata}]
           (let [deref-rows (deref rows)
                 pii-masked-data (masking/send-results-to-pii-marking data deref-rows current-user)]
             (let [new-data (:data pii-masked-data)
                   new-rows (:rows pii-masked-data)]
               ;; write rows
               (doseq [row new-rows]
                 (json/generate-stream row writer)
                 (when-not (= row (last new-rows))
                           (.write writer ",\n")))
               (.write writer "\n]")
               (let [data-kvs-str           (map->serialized-json-kvs new-data)
                     other-metadata-kvs-str (map->serialized-json-kvs (dissoc metadata :data))]
                 ;; write any remaining keys in data
                 (when (seq data-kvs-str)
                       (.write writer ",\n")
                       (.write writer data-kvs-str))
                 ;; close data
                 (.write writer "}")
                 ;; write any remaining top-level keys
                 (when (seq other-metadata-kvs-str)
                       (.write writer ",\n")
                       (.write writer other-metadata-kvs-str))
                 ;; close top-level map
                 (.write writer "}")))
             (.flush writer)
             (.flush os)
             (.close writer))))))
