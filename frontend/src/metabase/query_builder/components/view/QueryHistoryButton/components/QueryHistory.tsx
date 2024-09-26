import React from "react";
import { Table } from "antd";
import { useQueryHistory } from "metabase/query_builder/components/view/QueryHistoryButton/hooks/useQueryHistory";

export const QueryHistory = (): JSX.Element => {
  const { isLoading, queryHistory } = useQueryHistory();

  if (!isLoading && !queryHistory.length) {
    return <>No query history</>;
  }

  return <Table />;
};
