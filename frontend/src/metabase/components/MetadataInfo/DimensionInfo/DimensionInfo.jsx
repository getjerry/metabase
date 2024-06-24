import React from "react";
import PropTypes from "prop-types";
import { t } from "ttag";
import Dimension from "metabase-lib/Dimension";
import { Description, EmptyDescription } from "../MetadataInfo.styled";
import {
  InfoContainer,
  DimensionSemanticTypeLabel,
  FieldFingerprintInfo,
} from "./DimensionInfo.styled";

DimensionInfo.propTypes = {
  className: PropTypes.string,
  dimension: PropTypes.instanceOf(Dimension).isRequired,
  showAllFieldValues: PropTypes.bool,
  card: PropTypes.object,
  user: PropTypes.object,
  metadata: PropTypes.object,
};

export function DimensionInfo({
  className,
  dimension,
  showAllFieldValues,
  card,
  user,
  metadata,
}) {
  const field = dimension.field();
  let description = field?.description;

  try {
    if (card !== undefined && metadata !== undefined) {
      // eslint-disable-next-line react/prop-types
      const fields = metadata.field;
      // eslint-disable-next-line react/prop-types
      const matchField = fields.find(item => item.Name === field.name);
      if (matchField !== undefined) {
        description = matchField.Definition;
      }
    }
  } catch (e) {
    // console.log(e);
  }
  return (
    <InfoContainer className={className}>
      {description ? (
        <Description>{description}</Description>
      ) : (
        <EmptyDescription>{t`No description`}</EmptyDescription>
      )}
      <DimensionSemanticTypeLabel dimension={dimension} />
      <FieldFingerprintInfo
        field={field}
        showAllFieldValues={showAllFieldValues}
      />
    </InfoContainer>
  );
}

export default DimensionInfo;
