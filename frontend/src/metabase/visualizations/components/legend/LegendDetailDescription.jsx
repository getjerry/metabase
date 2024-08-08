import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Tabs,
  Table,
  Descriptions,
  Collapse,
  Spin,
  Tag,
  Tooltip,
  message,
  Button as AntButton,
} from "antd";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { getDataFromId, insertOrUpdateData } from "metabase/lib/indexedDBUtils";
import Button from "metabase/core/components/Button/Button";
import { trackEvent } from "metabase/event/jerry-utils";
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

const StyledMessage = styled.p`
  font-size: 18px;
`;

LegendDetailDescription.propTypes = {
  user: PropTypes.object,
  question: Question,
  metadataInfo: PropTypes.object,
  isVisible: PropTypes.bool.isRequired,
  isLoad: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export function LegendDetailDescription({
  user,
  question,
  isVisible,
  metadataInfo,
  isLoad,
  onClose,
}) {
  const metadataInit = {
    filter: [],
    field: [],
    description: "",
    index: {},
  };
  const [metadata, setMetadata] = useState(metadataInfo || metadataInit);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoad) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const report_id = `report_id_${question.id()}`;
          const data = await getDataFromId(report_id);
          const parameterNames = question
            .parameters()
            .map(o => [o.name.toLowerCase(), o.slug.toLowerCase()])
            .flat();
          if (JSON.stringify(data.metadata) !== "{}") {
            data.metadata.filter = data.metadata.filter.filter(o =>
              parameterNames.includes(o.Name.toLowerCase()),
            );

            const resultMetadata = question.getResultMetadata();
            const resultMetadataNames = resultMetadata.map(o => o.name);

            data.metadata.field = data.metadata.field
              .filter(o => resultMetadataNames.includes(o.Name))
              .sort(
                (a, b) =>
                  resultMetadataNames.indexOf(a.Name) -
                  resultMetadataNames.indexOf(b.Name),
              );
            setMetadata(data.metadata);
          }
        } catch (error) {
          console.error("Error fetching data from IndexedDB");
        }
        setLoading(false);
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isVisible, isLoad, question]);

  const renderNameWithTag = name => <Tag color="blue">{name}</Tag>;

  const filterDictionaryColumns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: renderNameWithTag,
    },
    {
      title: "Implementation",
      dataIndex: "Implementation",
      key: "Implementation",
    },
    // {
    //   title: "Possible Values",
    //   dataIndex: "Possible Values",
    //   key: "Possible Values",
    // },
    // { title: "Maintainer", dataIndex: "maintainer", key: "maintainer" },
  ];

  // const metadataSort = metadata.field
  //   .map(item => item.Name)
  //   .sort((a, b) => b.length - a.length);

  const dataDictionaryColumns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: renderNameWithTag,
    },
    { title: "Definition", dataIndex: "Definition", key: "Definition" },
  ];

  const routePageClick = () => {
    try {
      window.open(
        "https://www.notion.so/jerrydesign/" +
          metadata.index.id.replaceAll("-", ""),
        "_blank",
      );
      trackEvent(
        {
          eventCategory: "Metabase",
          eventAction: "Frontend",
          eventLabel: "Click_Metabase_Route_PAGE",
        },
        {
          user_info: user,
          href: "https://www.notion.so/jerrydesign/" + metadata.index.id,
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const cancelTokenSourceRef = useRef(null);

  const aiGenereteClick = async () => {
    setTooltipVisible(false);
    setCount(0);
    cancelTokenSourceRef.current = axios.CancelToken.source();
    const timer = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 1000);
    try {
      setGenerating(true);
      const res = await axios.post(
        "/api/jerry/extend",
        {
          call: "post",
          service_name: "ai_gen_metadata",
          body: {
            report_id: question.id(),
            report_type: "question",
            report_name: question.displayName(),
            dataset_query: question.datasetQuery(),
            result_metadata: question.getResultMetadata(),
          },
          timeout: 300000,
        },
        { cancelToken: cancelTokenSourceRef.current.token },
      );
      const pageId = res.data?.page_id;
      if (res.status !== 200 || pageId === "") {
        messageApi.error("Failed to generate metadata");
      } else if (pageId !== "" && pageId !== undefined) {
        await insertOrUpdateData(`report_id_${question.id()}`, {
          metadata: res.data?.metadata || metadataInit,
        });
        setMetadata(res.data?.metadata || metadataInit);
        window.open(
          "https://www.notion.so/jerrydesign/" + pageId.replaceAll("-", ""),
          "_blank",
          "noopener,noreferrer",
        );
        messageApi.info("Generate successful");
      } else if (pageId === "" || pageId === undefined) {
        messageApi.error("Generate failed");
      }
      trackEvent(
        {
          eventCategory: "Metabase",
          eventAction: "Frontend",
          eventLabel: "Click_Metabase_Metadata_AI_Generate",
        },
        {
          user_info: user,
          status: pageId === "" ? "failed" : "success",
          href: "https://www.notion.so/jerrydesign/" + pageId,
        },
      );
    } catch (e) {
      if (!axios.isCancel(e)) {
        message.error(e);
      }
    } finally {
      clearInterval(timer);
      setGenerating(false);
    }
  };

  const stopGenerate = () => {
    setGenerating(false);
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel("Generation stopped by user");
    }
    messageApi.warning("Generation stopped");
  };

  const handleAfterClose = () => {
    const modalElement = document.querySelector(".ant-modal");
    if (modalElement) {
      modalElement.setAttribute("aria-hidden", "true");
    }
  };

  const description = question.description() || metadata.description;
  return (
    <Modal
      centered
      onCancel={onClose}
      width="80%"
      footer={[]}
      open={isVisible}
      bodyStyle={{ overflowY: "auto", maxHeight: "80vh", marginTop: "20px" }}
      afterClose={handleAfterClose}
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <StyledCollapse defaultActiveKey={["1"]}>
            <Collapse.Panel header="Report Description" key="1">
              <StyledDescriptions bordered column={1}>
                <Descriptions.Item label="Description">
                  <div style={{ maxHeight: "40vh", maxWidth: "100%" }}>
                    <ReactMarkdown>{description}</ReactMarkdown>
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
            <Tabs.TabPane
              tab={
                <Button
                  primary
                  onClick={routePageClick}
                  className="metadata-document"
                  data-testid="metadata-route-page-link"
                  disabled={!metadata.index?.id}
                >
                  Notion Document
                </Button>
              }
              key="3"
              disabled
            />
            <Tabs.TabPane
              tab={
                <Tooltip
                  placement="top"
                  title="AI generates or updates metadata"
                  open={tooltipVisible}
                >
                  {contextHolder}
                  <Button
                    primary
                    onClick={aiGenereteClick}
                    data-testid="metadata-route-page-link"
                    onMouseEnter={() => setTooltipVisible(true)}
                    onMouseLeave={() => setTooltipVisible(false)}
                  >
                    AI Definition Generation
                  </Button>
                  <Modal
                    open={generating}
                    footer={null}
                    closable={false}
                    afterClose={handleAfterClose}
                  >
                    <Spin size="large" />
                    <StyledMessage>
                      AI generating. Please wait 1-2 minutes...
                    </StyledMessage>
                    <StyledMessage>Time elapsed: {count}s</StyledMessage>
                    <AntButton danger onClick={stopGenerate}>
                      Stop Generate
                    </AntButton>
                  </Modal>
                </Tooltip>
              }
              key="4"
              disabled
            />
          </StyledTabs>
        </>
      )}
    </Modal>
  );
}
