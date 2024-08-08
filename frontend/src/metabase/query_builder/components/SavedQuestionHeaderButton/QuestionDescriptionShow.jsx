import React, { useState } from "react";
import { t } from "ttag";
import PropTypes from "prop-types";
import { LegendDetailDescription } from "metabase/visualizations/components/legend/LegendDetailDescription";
import Button from "metabase/core/components/Button/Button";
import Tooltip from "metabase/core/components/Tooltip";
import { trackEvent } from "metabase/event/jerry-utils";

QuestionDescriptionShow.propTypes = {
  user: PropTypes.object,
  question: PropTypes.object,
};

export function QuestionDescriptionShow({ user, question }) {
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
          open: "definition button",
          question: question._card.id,
        },
      );
    } catch (e) {}
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <Tooltip tooltip="Open Report Definition">
      <Button grey small onClick={() => showModal()}>{t`Definition`}</Button>
      <LegendDetailDescription
        isVisible={isModalVisible}
        isLoad={true}
        onClose={closeModal}
        question={question}
      />
    </Tooltip>
  );
}
