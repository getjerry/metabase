import React, { useState, useEffect, useRef } from "react";
import { t } from "ttag";
import { Tag } from "antd";
import PropTypes from "prop-types";
import { PLUGIN_MODERATION } from "metabase/plugins";
import Tooltip from "metabase/core/components/Tooltip";
import { LegendDescriptionIcon } from "metabase/visualizations/components/legend/LegendCaption.styled";
import { LegendDetailDescription } from "metabase/visualizations/components/legend/LegendDetailDescription";
import { LegendMetadataTag } from "metabase/visualizations/components/legend/LegendMetadataTag";
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
  const isLatestRequest = useRef(true);
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
  const [questionInfo, setQuestionInfo] = useState({
    description: question.description(),
    metadata: {},
  });

  useEffect(() => {
    const maxAttempts = 10;
    let attempts = 0;
    const fetchData = async () => {
      isLatestRequest.current = true;
      setQuestionInfo({
        description: question.description(),
        metadata: {},
      });
      const report_id = `report_id_${question.id()}`;
      let data;
      try {
        do {
          try {
            data = await getDataFromId(report_id);
          } catch (e) {}
          attempts += 1;
          if (data && data?.metadata && data?.metadata?.index) {
            if (
              data.metadata.index.verify === true ||
              data.metadata.index.verify === "True"
            ) {
              setMetadataVerify(true);
            }
            setQuestionInfo({
              description:
                question.description() || data?.metadata?.description,
              metadata: data,
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        } while (attempts < maxAttempts);
      } catch (error) {
        console.error("Error fetching data from IndexedDB:", error);
      }
    };
    fetchData();
    return () => {
      return () => {
        isLatestRequest.current = false;
      };
    };
  }, [question]);

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
      {questionInfo.description && (
        <Tooltip tooltip={questionInfo.description} maxWidth="40em">
          <LegendDescriptionIcon
            className="hover-child hover-child--smooth cursor-pointer"
            style={{ marginTop: "6px" }}
            onClick={() => showModal()}
          />
          <LegendDetailDescription
            isVisible={isModalVisible}
            isLoad={true}
            onClose={closeModal}
            question={question}
            metadataInfo={questionInfo.metadata.metadata}
          />
        </Tooltip>
      )}
      {
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
      }
      <LegendMetadataTag metadata={questionInfo?.metadata} />
    </HeaderRoot>
  );
}

export default Object.assign(SavedQuestionHeaderButton, {
  Root: HeaderRoot,
});
