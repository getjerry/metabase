import React from "react";
import { Row, Col } from "antd";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import PropTypes from "prop-types";

export default function CodeDiff({ diffType, oldValue, newValue, diffConf }) {
  const newStyles = {
    variables: {
      light: {
        codeFoldGutterBackground: "#6F767E",
        codeFoldBackground: "#E2E4E5",
      },
    },
    line: {
      // '&:hover': {
      //   background: '#a26ea1',
      // },
      wordBreak: "break-all",
      fontSize: "14px",
    },
    // contentText: {
    //   width: '390px',
    // },
  };

  const titleStyle = {
    margin: "4px",
    fontWeight: "bold",
    fontSize: "16px",
    display: "inline-block",
  };

  const isReport =
    diffType === "report" || diffType === "report_history_version";
  const reportName1 = diffConf?.report_name1 || "";
  const reportName2 = diffConf?.report_name2 || "";
  const reportId1 = diffConf?.report_id1;
  const reportId2 = diffConf?.report_id2;

  const jumpToReportUrl = id => `/question/${id}`;
  return (
    <Row>
      <Col span={12}>
        {isReport ? (
          <a
            href={jumpToReportUrl(reportId1)}
            target="_blank"
            rel="noopener noreferrer"
            style={titleStyle}
          >
            {reportName1}
          </a>
        ) : (
          <p></p>
        )}
      </Col>
      <Col span={12}>
        {isReport ? (
          <a
            href={jumpToReportUrl(reportId2)}
            target="_blank"
            rel="noopener noreferrer"
            style={titleStyle}
          >
            {reportName2}
          </a>
        ) : (
          <p></p>
        )}
      </Col>
      <Col span={24}>
        <ReactDiffViewer
          oldValue={oldValue}
          newValue={newValue}
          styles={newStyles}
          splitView
          compareMethod={DiffMethod.WORDS}
          showDiffOnly={false}
          codeFoldMessageRenderer={num => <>Expand {num} of lines ...</>}
        />
      </Col>
    </Row>
  );
}

CodeDiff.propTypes = {
  diffType: PropTypes.string,
  oldValue: PropTypes.string,
  newValue: PropTypes.string,
  diffConf: PropTypes.object,
};
