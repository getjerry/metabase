import React, { useState } from "react";
import { Modal } from "antd";
import { trackEvent } from "metabase/event/jerry-utils";

OpenPlaysmart.propTypes = {};

const loadingOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(255, 255, 255, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const loadingSpinnerStyle = {
  border: "4px solid rgba(0, 0, 0, 0.3)",
  borderTop: "4px solid #007bff",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  animation: "spin 1s linear infinite",
};

function get_report_id(report, type) {
  if (type === "question") {
    if (report._card.id !== undefined) {
      return report._card.id;
    } else {
      return report._card.original_card_id;
    }
  } else {
    return report.id;
  }
}

function get_report_name(report, type) {
  if (type === "question") {
    if (report._card.name !== undefined) {
      return report._card.name;
    } else {
      return report._card.original_card_name;
    }
  } else {
    return report.name;
  }
}

// eslint-disable-next-line react/prop-types
export function OpenPlaysmart({ report, type, user, uuid }) {
  const reportId = get_report_id(report, type);
  const reportName = get_report_name(report, type);

  const [loadIframe, setLoadIframe] = useState({
    open: true,
    isLoading: false,
    iframeKey: 0,
  });

  const close = () => {
    setLoadIframe(prevState => ({
      open: false,
      isLoading: false,
      iframeKey: prevState.iframeKey,
    }));
  };

  const handleIframeLoad = () => {
    setLoadIframe(prevState => ({
      open: true,
      isLoading: false,
      iframeKey: prevState.iframeKey,
    }));

    trackEvent(
      {
        eventCategory: "System/Monitoring/Playsmart",
        eventAction: "pop_up",
        eventLabel: "playsmart",
      },
      {
        user_info: user,
        report_info: report,
      },
    );
  };

  function getUrl() {
    const token = encodeURIComponent(btoa(JSON.stringify(user)));
    return `https://playsmart.ing.getjerry.com?token=${token}&sidebar=collapsed`;
  }

  if (
    reportId > 0 &&
    reportName.toLowerCase().includes("ab") &&
    reportName.toLowerCase().includes("test") &&
    reportId !== 17465 &&
    reportId !== 17024
  ) {
    return (
      <Modal
        title={"ABTest Analysis Platform - Playsmart"}
        centered
        open={loadIframe.open}
        onCancel={() => close()}
        width="80%"
        footer={[]}
        bodyStyle={{ height: "80vh", overflowY: "auto" }}
      >
        {loadIframe.isLoading && (
          <div style={loadingOverlayStyle}>
            <div style={loadingSpinnerStyle}></div>
          </div>
        )}
        <div style={{ height: "100%" }}>
          <iframe
            key={loadIframe.iframeKey}
            width="98%"
            style={{ height: "98.5%" }}
            scrolling="true"
            onLoad={() => handleIframeLoad()}
            src={getUrl()}
            frameBorder="0"
            allow="clipboard-read; clipboard-write"
          ></iframe>
        </div>
      </Modal>
    );
  } else {
    return null;
  }
}
