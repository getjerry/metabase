import React from "react";
import { Tooltip } from "antd";
import { t } from "ttag";
import Button from "metabase/core/components/Button/Button";
import { color } from "metabase/lib/colors";
import { trackEvent } from "metabase/event/jerry-utils";
import { User } from "metabase-types/api";

export interface MetaDataDocumentButtonProps {
  user?: User;
}

const MetaDataDocumentButton = ({ user }: MetaDataDocumentButtonProps) => {
  const iconSize = 18;
  const iconColor = color("text-medium");

  function ClickMetadataButton(event: { preventDefault: () => void }) {
    event.preventDefault();
    const newHref = user?.config || "";

    if (newHref) {
      window.open(newHref, "_blank");
    }
    trackEvent(
      {
        eventCategory: "Metabase",
        eventAction: "Frontend",
        eventLabel: "Click Notion Document",
      },
      {
        user_info: user,
        href: user?.config || "",
      },
    );
  }

  return (
    <Tooltip title={t`Metadata Document`}>
      <Button
        onClick={ClickMetadataButton}
        className="metadata-document"
        icon="reference"
        onlyIcon
        iconSize={iconSize}
        color={iconColor}
        data-testid="metadata-document-link"
      />
    </Tooltip>
  );
};

export default MetaDataDocumentButton;
