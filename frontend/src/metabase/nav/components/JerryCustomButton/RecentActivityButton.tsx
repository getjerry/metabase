import React from "react";
import { Link } from "react-router";
import { Tooltip } from "antd";
import { t } from "ttag";
import Button from "metabase/core/components/Button/Button";
import { color } from "metabase/lib/colors";

const RecentActivityButton = () => {
  const iconSize = 18;
  const iconColor = color("text-medium");

  return (
    <Tooltip title={t`Recent activities`}>
      <Button
        as={Link}
        to="/recent_activity"
        className="recent_activity_button"
        icon="history"
        onlyIcon
        iconSize={iconSize}
        color={iconColor}
        data-testid="recent-activity-link"
      />
    </Tooltip>
  );
};

export default RecentActivityButton;
