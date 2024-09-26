import React, { useMemo } from "react";
import { Table, Button } from "antd";
import moment from "moment";
import styled from "@emotion/styled";
import {
  ParsedQueryHistory,
  useQueryHistory,
} from "metabase/query_builder/components/view/QueryHistoryButton/hooks/useQueryHistory";
import { formatSql } from "metabase/query_builder/components/view/QueryHistoryButton/utils/format";

const StyledQueryHistory = styled.div`
  overflow: auto;
  width: 100%;
  .query-history-table {
    min-width: 800px;
  }
`;

const columns = [
  {
    title: "Database",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Result Rows",
    dataIndex: "result_rows",
    key: "result_rows",
  },
  {
    title: "Started At",
    dataIndex: "started_at",
    key: "started_at",
    render: (text: string) => moment(text).format("MM/DD HH:mm:ss"),
  },
  {
    title: "Running Time",
    dataIndex: "running_time",
    key: "running_time",
    render: (time: number) => time + "ms",
  },
  {
    title: "Sql",
    dataIndex: "query.native.query",
    key: "sql",
    width: 200,
    render: function render(_: undefined, record: ParsedQueryHistory) {
      return (
        <div style={{ fontFamily: "monospace" }}>
          {formatSql(record.query.native?.query, 50)}
        </div>
      );
    },
  },
];

interface QueryHistoryProps {
  dataSource: ParsedQueryHistory[];
  onSelectQuery: (query: ParsedQueryHistory) => void;
}

export const QueryHistory = ({
  dataSource,
  onSelectQuery,
}: QueryHistoryProps): JSX.Element => {
  const { isLoading, queryHistory } = useQueryHistory();

  const columnsWithAction = useMemo(() => {
    return [
      ...columns,
      {
        title: "Action",
        key: "action",
        render: function render(_: undefined, record: ParsedQueryHistory) {
          return (
            <Button type="link" onClick={() => onSelectQuery(record)}>
              Apply
            </Button>
          );
        },
      },
    ];
  }, [onSelectQuery]);

  if (!isLoading && !queryHistory.length) {
    return <>No query history</>;
  }

  return (
    <StyledQueryHistory>
      <Table<ParsedQueryHistory>
        className="query-history-table"
        columns={columnsWithAction}
        dataSource={dataSource}
        pagination={{ pageSize: 50 }}
      />
    </StyledQueryHistory>
  );
};
