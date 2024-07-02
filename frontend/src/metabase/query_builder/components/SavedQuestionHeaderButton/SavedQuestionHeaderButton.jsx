import React, { useState } from "react";
import { t } from "ttag";
import { Tag } from "antd";
import PropTypes from "prop-types";
import { PLUGIN_MODERATION } from "metabase/plugins";
import Tooltip from "metabase/core/components/Tooltip";
import { LegendDescriptionIcon } from "metabase/visualizations/components/legend/LegendCaption.styled";
import { LegendDetailDescription } from "metabase/visualizations/components/legend/LegendDetailDescription";
import { trackEvent } from "metabase/event/jerry-utils";
import { getDataFromId } from "metabase/lib/indexedDBUtils";
import { HeaderRoot, HeaderTitle } from "./SavedQuestionHeaderButton.styled";

SavedQuestionHeaderButton.propTypes = {
  user: PropTypes.object,
  className: PropTypes.string,
  question: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

function SavedQuestionHeaderButton({ question, user, onSave }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const showModal = () => {
    setModalVisible(true);
    try {
      trackEvent(
        {
          eventCategory: "Metabase",
          eventAction: "Frontend",
          eventLabel: "open definition",
        },
        {
          user_info: user,
          open: "definition icon",
          question: question._card.id,
        },
      );
    } catch (e) {}
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const [metadataVerify, setMetadataVerify] = useState(false);

  const fetchData = async () => {
    try {
      const report_id = `report_id_${question.id()}`;
      const data = await getDataFromId(report_id);
      if (
        data?.metadata?.index?.verify !== undefined &&
        (data.metadata.index.verify === true ||
          data.metadata.index.verify === "True")
      ) {
        setMetadataVerify(true);
      }
    } catch (error) {
      console.error("Error fetching data from IndexedDB:", error);
    }
  };
  fetchData();

  return (
    <HeaderRoot>
      <HeaderTitle
        isDisabled={!question.canWrite()}
        initialValue={question.displayName()}
        placeholder={t`Add title`}
        onChange={onSave}
        data-testid="saved-question-header-title"
      />
      <PLUGIN_MODERATION.QuestionModerationIcon question={question} />
      {question.description() && (
        <Tooltip tooltip={question.description()} maxWidth="40em">
          <LegendDescriptionIcon
            className="hover-child hover-child--smooth cursor-pointer"
            style={{ marginTop: "6px" }}
            onClick={() => showModal()}
          />
          <LegendDetailDescription
            isVisible={isModalVisible}
            onClose={closeModal}
            question={question}
          />
        </Tooltip>
      )}
      {question.description() && (
        <>
          {metadataVerify ? (
            <Tag bordered={false} color="success" style={{ marginTop: "2px" }}>
              verified
            </Tag>
          ) : (
            <Tag bordered={false} color="default" style={{ marginTop: "2px" }}>
              not verified
            </Tag>
          )}
        </>
      )}
    </HeaderRoot>
  );
}

export default Object.assign(SavedQuestionHeaderButton, {
  Root: HeaderRoot,
});
