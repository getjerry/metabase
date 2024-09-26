import { useEffect, useMemo, useState } from "react";
import { GET } from "metabase/lib/api";
import {
  QueryHistory,
  Query,
} from "metabase/query_builder/components/view/QueryHistoryButton/@types/types";

const query = GET("/api/query-history/current");

export interface ParsedQueryHistory extends Omit<QueryHistory, "query"> {
  query: Query;
}

export const useQueryHistory = (): {
  isLoading: boolean;
  queryHistory: ParsedQueryHistory[];
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<ParsedQueryHistory[]>([]);
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = (await query()) as QueryHistory[];
        setQueryHistory(
          data.map(item => {
            return {
              ...item,
              query: JSON.parse(item.query) as Query,
            };
          }),
        );
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return useMemo(() => {
    return {
      isLoading,
      queryHistory,
    };
  }, [isLoading, queryHistory]);
};
