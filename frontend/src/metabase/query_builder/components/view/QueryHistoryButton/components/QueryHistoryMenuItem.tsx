import React, { useMemo } from "react";
import moment from "moment/moment";
import styled from "@emotion/styled";
import { Space } from "antd";
import { ClockCircleOutlined, DatabaseOutlined } from "@ant-design/icons";
import { ParsedQueryHistory } from "metabase/query_builder/components/view/QueryHistoryButton/hooks/useQueryHistory";
import { formatSql } from "metabase/query_builder/components/view/QueryHistoryButton/utils/format";

const StyledQueryHistoryMenuItem = styled.div`
  border-bottom: 1px solid #f0f0f0;
  min-width: 500px;
  padding: 5px 0;

  .timestamp {
    font-size: 12px;
    color: #999;
  }

  .sql {
    margin-top: 5px;
    font-family: monospace;
  }
`;

export const QueryHistoryMenuItem = ({
  record,
}: {
  record: ParsedQueryHistory;
}) => {
  const query = useMemo(() => {
    return formatSql(record.query.native?.query);
  }, [record.query.native?.query]);

  return (
    <StyledQueryHistoryMenuItem>
      <div className="timestamp">
        <Space>
          <Space size={2}>
            <ClockCircleOutlined rev />
            {moment(record.started_at).format("MM/DD HH:mm")}
          </Space>
          <Space size={2}>
            <DatabaseOutlined rev />
            {record.name}
          </Space>
        </Space>
      </div>
      <div className="sql">{query}</div>
    </StyledQueryHistoryMenuItem>
  );
};
