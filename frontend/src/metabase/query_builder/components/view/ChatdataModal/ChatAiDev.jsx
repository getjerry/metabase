import { t } from "ttag";
import React, { useState } from "react";
import { Modal, Input, Switch, message } from "antd";
import Cookies from "js-cookie";
import Button from "metabase/core/components/Button/Button";
import Tooltip from "metabase/core/components/Tooltip";

export function ChatAiDev() {
  const showModal = () => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: prevState.openDev,
      chatDataDomain: prevState.chatDataDomain,
    }));
  };

  const close = () => {
    setDev(prevState => ({
      openChatdataDebug: false,
      openDev: prevState.openDev,
      chatDataDomain: prevState.chatDataDomain,
    }));
  };
  const [dev, setDev] = useState({
    openChatdataDebug: false,
    openDev: Cookies.get("chatdata.dev") === "true",
    chatDataDomain: "https://chatdata-dev.ing.getjerry.com",
  });

  const onOpenDev = checked => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: checked,
      chatDataDomain: prevState.chatDataDomain,
    }));
    try {
      Cookies.set("chatdata.dev", checked);
    } catch (e) {
      console.error("set chatdata.dev:", e);
    }
  };

  const domainChange = value => {
    setDev(prevState => ({
      openChatdataDebug: true,
      openDev: prevState.openDev,
      chatDataDomain: value,
    }));
  };

  const clickChatDataDomain = () => {
    try {
      Cookies.set("chatdata.dev.domain", dev.chatDataDomain);
      message.info("Change chatdata dev domain");
    } catch (e) {
      console.error("set chatdata.dev.domain:", e);
    }
  };

  return (
    <Tooltip tooltip="Open Chatdata dev">
      <Button
        white
        small
        onClick={() => showModal()}
      >{t`Chatdata debug`}</Button>
      <Modal
        centered
        onCancel={() => close()}
        width="30%"
        footer={[]}
        open={dev.openChatdataDebug}
        bodyStyle={{ overflowY: "auto" }}
      >
        <div style={{ display: "flex" }}>
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
            style={{ width: "250px" }}
            value={dev.chatDataDomain}
            onChange={e => domainChange(e.target.value)}
          />
          <Button type="primary" onClick={() => clickChatDataDomain()}>
            Submit
          </Button>
        </div>
      </Modal>
    </Tooltip>
  );
}
