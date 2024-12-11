import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import { t } from "ttag";
import Button from "metabase/core/components/Button/Button";
import { color } from "metabase/lib/colors";
import { trackEvent } from "metabase/event/jerry-utils";
import { User, Card } from "metabase-types/api";

export interface PlaysmartButtonProps {
  user?: User;
  card?: Card;
}

const PlaysmartButton = ({ user, card }: PlaysmartButtonProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const iconSize = 25;
  const iconColor = color("text-medium");

  useEffect(() => {
    if (
      card?.name?.toLowerCase().includes("ab ") &&
      card?.name?.toLowerCase().includes("test")
    ) {
      setTooltipVisible(true);
      setTimeout(() => {
        setTooltipVisible(false);
      }, 5000);
    }
  }, [card]);

  function ClickPlaysmartButton(event: { preventDefault: () => void }) {
    event.preventDefault();

    const token = encodeURIComponent(btoa(JSON.stringify(user)));
    const newHref = `https://playsmart.ing.getjerry.com?token=${token}`;
    // const newHref = `http://localhost:8501?token=${token}`;

    if (newHref) {
      window.open(newHref, "_blank");
    }
    trackEvent(
      {
        eventCategory: "Metabase",
        eventAction: "Frontend",
        eventLabel: "Click Playsmart Button",
      },
      {
        user_info: user,
        href: newHref,
      },
    );
  }

  return (
    <Tooltip title={t`Go to ABTest Analysis Platform`} visible={tooltipVisible}>
      <Button
        onClick={ClickPlaysmartButton}
        className="playsmart_button"
        icon="abtest"
        onlyIcon
        iconSize={iconSize}
        color={iconColor}
        data-testid="recent-activity-link"
        style={{
          padding: "-4px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </Tooltip>
  );
};

export default PlaysmartButton;
