import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import Cookies from "js-cookie";
import Button from "metabase/core/components/Button/Button";
import Tooltip from "metabase/core/components/Tooltip";

OpenChatAi.propTypes = {};

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

// eslint-disable-next-line react/prop-types
export function OpenChatAi({ question, user }) {
  // eslint-disable-next-line react/prop-types
  const questionName = question._card.name;
  // 监听键盘事件
  useEffect(() => {
    const handleKeyPress = event => {
      const isCommandKey = event.metaKey || event.ctrlKey;
      const isKKey = event.key === "k" || event.keyCode === 75;
      if (isCommandKey && isKKey) {
        showModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      // 在组件卸载时取消事件监听
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const showModal = () => {
    setLoadIframe(prevState => ({
      open: true,
      isLoading: true,
      iframeKey: prevState.iframeKey + 1,
    }));
  };

  const [loadIframe, setLoadIframe] = useState({
    open: false,
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
  };

  function chatDataEnv() {
    try {
      return Cookies.get("chatdata.dev") || false;
    } catch (e) {
      console.error("get chatdata dev error:", e);
      return false;
    }
  }

  function getChatUrl(iframeKey) {
    console.log(user);
    if (loadIframe.open) {
      // eslint-disable-next-line react/prop-types
      const questionId = question.id();
      // eslint-disable-next-line react/prop-types
      const userId = user.id;
      // eslint-disable-next-line react/prop-types
      const email = user.email;
      // eslint-disable-next-line react/prop-types
      const common_name = user.common_name;
      const crypto = require("crypto");
      const md5Hash = crypto.createHash("md5");
      const token =
        questionId.toString() +
        common_name +
        email +
        userId.toString() +
        "jerry_data_team";
      md5Hash.update(token, "utf8");
      const md5Digest = md5Hash.digest("hex");
      const isDev = chatDataEnv();
      let baseUrl = "https://chatdata-prod.ing.getjerry.com/";
      if (isDev === true || isDev === "true") {
        baseUrl = "https://chatdata.ing.getjerry.com/chat";
      }
      // console.log("open chat ai", openUrl, iframeKey);
      return encodeURI(
        baseUrl +
          "?context_id=report_" +
          questionId +
          "&user_id=" +
          userId +
          "&email=" +
          email +
          "&common_name=" +
          common_name +
          "&report_name=" +
          questionName +
          "&token=" +
          md5Digest +
          "&from_metabase=true",
      );
    } else {
      return "";
    }
  }

  return (
    <Tooltip tooltip="AI Data Monkey">
      <Button
        onClick={() => showModal()}
        icon="bot"
        onlyIcon
        iconSize={20}
      ></Button>
      <Modal
        title={"ChatData - AI Data Monkey Just for You:  " + questionName}
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
            src={getChatUrl(loadIframe.iframeKey)}
            frameBorder="0"
            allow="clipboard-read; clipboard-write"
          ></iframe>
        </div>
      </Modal>
    </Tooltip>
  );
}
