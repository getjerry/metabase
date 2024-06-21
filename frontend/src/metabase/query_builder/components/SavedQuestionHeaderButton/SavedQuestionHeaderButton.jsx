import React, { useState } from "react";
import { t } from "ttag";
import PropTypes from "prop-types";
import { PLUGIN_MODERATION } from "metabase/plugins";
import Tooltip from "metabase/core/components/Tooltip";
import { LegendDescriptionIcon } from "metabase/visualizations/components/legend/LegendCaption.styled";
import { LegendDetailDescription } from "metabase/visualizations/components/legend/LegendDetailDescription";
import { HeaderRoot, HeaderTitle } from "./SavedQuestionHeaderButton.styled";

SavedQuestionHeaderButton.propTypes = {
  className: PropTypes.string,
  question: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

function SavedQuestionHeaderButton({ question, onSave }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const showModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

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
            style={{ marginTop: "4px" }}
            onClick={() => showModal()}
          />
          <LegendDetailDescription
            isVisible={isModalVisible}
            onClose={closeModal}
            question={question}
          />
        </Tooltip>
      )}
    </HeaderRoot>
  );
}

export default Object.assign(SavedQuestionHeaderButton, {
  Root: HeaderRoot,
});
