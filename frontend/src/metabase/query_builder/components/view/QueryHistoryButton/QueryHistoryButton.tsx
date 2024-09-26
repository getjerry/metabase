import React, { useCallback, useMemo, useState } from "react";
import { Dropdown, Space, Modal as AntdModal } from "antd";
import { MenuProps } from "antd/lib";
import { DownOutlined } from "@ant-design/icons";
import compact from "lodash/compact";
import noop from "lodash/noop";
import { StyledLinkButton } from "metabase/query_builder/components/view/QueryHistoryButton/StyledLinkButton";
import { QueryHistory } from "metabase/query_builder/components/view/QueryHistoryButton/components/QueryHistory";
import Modal from "metabase/components/Modal";
import ModalContent from "metabase/components/ModalContent";
import {
  ParsedQueryHistory,
  useQueryHistory,
} from "metabase/query_builder/components/view/QueryHistoryButton/hooks/useQueryHistory";
import { QueryHistoryMenuItem } from "metabase/query_builder/components/view/QueryHistoryButton/components/QueryHistoryMenuItem";

interface QueryHistoryButtonProps {
  onSelectQuery: (query: ParsedQueryHistory) => void;
}

/**
 * Button to show query history
 */
export const QueryHistoryButton = ({
  onSelectQuery,
}: QueryHistoryButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, queryHistory } = useQueryHistory();

  const onClickQuery = useCallback(
    (query: ParsedQueryHistory) => {
      AntdModal.confirm({
        title: "Warning",
        closable: true,
        okText: "Apply",
        cancelText: "Cancel",
        content:
          "This will replace your current query with the selected query. Are you sure you want to continue?",
        onOk: () => {
          onSelectQuery(query);
          setIsOpen(false);
        },
        onCancel: noop,
      });
    },
    [onSelectQuery],
  );

  const records = useMemo<MenuProps["items"]>(() => {
    const queries = queryHistory.slice(0, 10).map(record => {
      if (!record.query.native?.query) {
        return;
      }

      return {
        key: record.hash + record.started_at,
        label: <QueryHistoryMenuItem record={record} />,
        onClick: () => onClickQuery(record),
      };
    });

    return compact([
      ...queries,
      {
        key: "more",
        label: <div>View more</div>,
        onClick: () => setIsOpen(true),
      },
    ]);
  }, [queryHistory, onClickQuery]);

  if (isLoading || queryHistory.length === 0) {
    return null;
  }

  return (
    <>
      <Dropdown menu={{ items: records }}>
        <StyledLinkButton to="/" onClick={e => e.preventDefault()}>
          <Space size={2}>
            History
            <DownOutlined rev />
          </Space>
        </StyledLinkButton>
      </Dropdown>
      <Modal isOpen={isOpen} wide>
        <ModalContent title="Query History" onClose={() => setIsOpen(false)}>
          <QueryHistory
            dataSource={queryHistory}
            onSelectQuery={onClickQuery}
          />
        </ModalContent>
      </Modal>
    </>
  );
};
