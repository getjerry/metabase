import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Tabs, Table, Descriptions, Collapse } from "antd";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { getDataFromId } from "metabase/lib/indexedDBUtils";
import Question from "metabase-lib/Question";

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-weight: bold;
  }
`;

const StyledDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    width: 100px;
  }
  .ant-descriptions-item-content {
    overflow: auto;
    max-width: 200px;
    width: auto;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-tab-btn {
    font-weight: bold;
    margin-top: 16px;
  }
`;

LegendDetailDescription.propTypes = {
  user: PropTypes.object,
  question: Question,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export function LegendDetailDescription({
  user,
  question,
  isVisible,
  onClose,
}) {
  const report_id = `report_id_${question.id()}`;

  const [metadata, setMetadata] = useState({
    filter: [],
    field: [],
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromId(report_id);
        const parameterNames = question
          .parameters()
          .map(o => [o.name.toLowerCase(), o.slug.toLowerCase()])
          .flat();
        data.metadata.filter = data.metadata.filter.filter(o =>
          parameterNames.includes(o.Name.toLowerCase()),
        );
        setMetadata(data.metadata);
      } catch (error) {
        console.error("Error fetching data from IndexedDB:", error);
      }
    };

    fetchData();
  }, [report_id, question]);

  const filterDictionaryColumns = [
    { title: "Name", dataIndex: "Name", key: "Name" },
    {
      title: "Implementation",
      dataIndex: "Implementation",
      key: "Implementation",
    },
    {
      title: "Possible Values",
      dataIndex: "Possible Values",
      key: "Possible Values",
    },
    { title: "Maintainer", dataIndex: "maintainer", key: "maintainer" },
  ];

  const dataDictionaryColumns = [
    { title: "Name", dataIndex: "Name", key: "Name" },
    // {title: 'Category', dataIndex: 'category', key: 'category'},
    { title: "Definition", dataIndex: "Definition", key: "Definition" },
    {
      title: "Implementation",
      dataIndex: "Implementation",
      key: "Implementation",
    },
    { title: "Maintainer", dataIndex: "maintainer", key: "maintainer" },
  ];

  return (
    <Modal
      centered
      onCancel={onClose}
      width="80%"
      footer={[]}
      open={isVisible}
      bodyStyle={{ overflowY: "auto", maxHeight: "80vh", marginTop: "20px" }}
    >
      <StyledCollapse defaultActiveKey={["1"]}>
        <Collapse.Panel header="Report Description" key="1">
          <StyledDescriptions bordered column={1}>
            <Descriptions.Item label="Description">
              <div style={{ maxHeight: "40vh", maxWidth: "100%" }}>
                <ReactMarkdown>{question.description()}</ReactMarkdown>
              </div>
            </Descriptions.Item>
          </StyledDescriptions>
        </Collapse.Panel>
      </StyledCollapse>
      <StyledTabs defaultActiveKey="2">
        <Tabs.TabPane tab="Filter Dictionary" key="1">
          <Table
            columns={filterDictionaryColumns}
            dataSource={metadata.filter}
            pagination={false}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Data Dictionary" key="2">
          <Table
            columns={dataDictionaryColumns}
            dataSource={metadata.field}
            pagination={false}
          />
        </Tabs.TabPane>
      </StyledTabs>
    </Modal>
  );
}
