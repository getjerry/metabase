import { t } from "ttag";
import React, { useState } from "react";
import { Modal, Input, Switch, message, Tooltip } from "antd";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import axios from "axios";
import Button from "metabase/core/components/Button/Button";

ChatAiDev.propTypes = {
  user: PropTypes.object,
};

export function ChatAiDev({ user }) {
  const showModal = () => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: prevState.openDev,
      chatDataDomain: prevState.chatDataDomain,
      metadataDocumentUrl: prevState.metadataDocumentUrl,
    }));
  };

  const close = () => {
    setDev(prevState => ({
      openChatdataDebug: false,
      openDev: prevState.openDev,
      chatDataDomain: prevState.chatDataDomain,
      metadataDocumentUrl: prevState.metadataDocumentUrl,
    }));
  };
  const [dev, setDev] = useState({
    openChatdataDebug: false,
    openDev: Cookies.get("chatdata.dev") === "true",
    chatDataDomain: "https://chatdata-dev.ing.getjerry.com",
    metadataDocumentUrl: user.config,
  });

  const onOpenDev = checked => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: checked,
      chatDataDomain: prevState.chatDataDomain,
      metadataDocumentUrl: prevState.metadataDocumentUrl,
    }));
    try {
      Cookies.set("chatdata.dev", checked);
    } catch (e) {
      console.error("set chatdata.dev:", e);
    }
  };

  const domainChange = (value, type) => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: prevState.openDev,
      chatDataDomain: type === "chatdata" ? value : prevState.chatDataDomain,
      metadataDocumentUrl:
        type === "metadata" ? value : prevState.metadataDocumentUrl,
    }));
  };

  const clickChatDataDomain = () => {
    try {
      Cookies.set("chatdata.dev.domain", dev.chatDataDomain);
      message.info("Changed chatdata dev domain");
    } catch (e) {
      console.error("set chatdata.dev.domain:", e);
    }
  };

  const clickMetadataDocumentUrl = () => {
    user.config = dev.metadataDocumentUrl;
    message.info("Changed metadata document url");
  };

  const deployMetadataDocumentUrl = () => {
    // user.config = dev.metadataDocumentUrl;
    axios
      .put("api/config/type/notion_document", {
        config: dev.metadataDocumentUrl,
      })
      .then(res => {
        user.config = dev.metadataDocumentUrl;
        message.success("Deployed metadata document url successful");
      })
      .catch(err => {
        message.error("Deployed metadata document url failed");
      });
  };

  return (
    <Tooltip tooltip="Open Metabase dev">
      <Button
        white
        small
        onClick={() => showModal()}
      >{t`Metabase debug`}</Button>
      <Modal
        centered
        onCancel={() => close()}
        width="40%"
        footer={[]}
        open={dev.openChatdataDebug}
        bodyStyle={{ overflowY: "auto" }}
      >
        <div>
          <div>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              Chatdata Debug
            </span>
            <div style={{ display: "flex", marginTop: "20px" }}>
              <div style={{ marginRight: "12px" }}>open dev:</div>
              <div>
                <Switch checked={dev.openDev} onChange={onOpenDev} />
              </div>
            </div>
            <div style={{ display: "flex", marginTop: "20px" }}>
              <div style={{ marginRight: "12px", marginTop: "12px" }}>
                dev domain:
              </div>
              <Input
                style={{ maxWidth: "300px" }}
                value={dev.chatDataDomain}
                onChange={e => domainChange(e.target.value, "chatdata")}
              />
              <Button
                type="primary"
                onClick={() => clickChatDataDomain()}
                style={{ marginLeft: "10px" }}
              >
                Submit
              </Button>
            </div>
          </div>
          <hr />
          <div>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              Metabase Debug
            </span>
            <div style={{ display: "flex", marginTop: "20px" }}>
              <div style={{ marginRight: "12px", marginTop: "12px" }}>
                Metadata Document Url:
              </div>
              <Input
                style={{ maxWidth: "300px" }}
                value={dev.metadataDocumentUrl}
                onChange={e => domainChange(e.target.value, "metadata")}
              />
              <Tooltip title="Testing - Modify the link of the notion document button">
                <Button
                  type="primary"
                  onClick={() => clickMetadataDocumentUrl()}
                  style={{ marginLeft: "10px" }}
                >
                  Test
                </Button>
              </Tooltip>
              <Tooltip title="Save this URL to the database and switch all users to this link">
                <Button
                  type="primary"
                  onClick={() => deployMetadataDocumentUrl()}
                  style={{ marginLeft: "10px" }}
                >
                  Deploy
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Modal>
    </Tooltip>
  );
}
