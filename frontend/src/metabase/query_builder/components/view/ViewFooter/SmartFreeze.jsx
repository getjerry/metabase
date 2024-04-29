import React, { useState } from "react";
import { Switch } from "antd";
import Cookies from "js-cookie";
import Tooltip from "metabase/core/components/Tooltip";

export function SmartFreeze() {
  const smartFreezeStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "10px",
    // border: "1px solid #000"
  };
  const smartFreezeText = {
    fontWeight: "normal",
    // fontSize: "14px",
    color: "black",
  };

  const [freeze, setFreeze] = useState({
    open:
      Cookies.get("metabase.smart.freeze") === "true" ||
      Cookies.get("metabase.smart.freeze") === undefined,
  });

  const changeFreeze = opened => {
    setFreeze(prevState => ({
      open: opened,
    }));
    try {
      Cookies.set("metabase.smart.freeze", opened, {
        expires: new Date().setFullYear(new Date().getFullYear() + 10),
      });
    } catch (e) {
      console.error("set smart freeze:", e);
    }
  };

  return (
    <Tooltip tooltip="The type of the first frozen column is date/datetime by default.">
      <div style={smartFreezeStyle}>
        <span style={smartFreezeText}>Smart Freeze:</span>
        <Switch
          style={{ marginLeft: "5px" }}
          checked={freeze.open}
          onChange={changeFreeze}
        />
      </div>
    </Tooltip>
  );
}
