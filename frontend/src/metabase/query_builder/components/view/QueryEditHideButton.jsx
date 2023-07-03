import React, { useState } from "react";
import Button from "metabase/core/components/Button/Button";
import Tooltip from "metabase/components/Tooltip";
import { t } from "ttag";

QueryEditHideButton.propTypes = {};

function HideOrShow(setIsStar, isStar) {
  setIsStar(!isStar);
  const filterElement = document.querySelector(".query_filters");
  if (filterElement !== null) {
    const elementDisplay = filterElement.style.display;
    if (elementDisplay === "block") {
      filterElement.style.display = "none";
    } else {
      filterElement.style.display = "block";
    }
  }
}

export default function QueryEditHideButton() {
  const [isStar, setIsStar] = useState(true);
  return (
    <Tooltip tooltip={isStar ? t`Hide Filters` : t`Display Filters`}>
      <Button
        onClick={event => HideOrShow(setIsStar, isStar)}
        icon={isStar ? "eye" : "eye_crossed_out"}
        onlyIcon
        iconSize={20}
      ></Button>
    </Tooltip>
  );
}
