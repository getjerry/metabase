import React from "react";
import styled from "@emotion/styled";
import DimensionInfo from "metabase/components/MetadataInfo/DimensionInfo";
import { Card, User } from "metabase-types/api";
import Dimension from "metabase-lib/Dimension";

type DimensionInfoProps = {
  dimension: Dimension;
  card: Card | undefined;
  user: User | undefined;
  metadata: object | undefined;
};

// this makes TypeScript happy until `DimensionInfo` is typed
function _DimensionInfo(props: DimensionInfoProps) {
  return <DimensionInfo {...props} />;
}

export const WidthBoundDimensionInfo = styled(_DimensionInfo)`
  width: 300px;
  font-size: 14px;
`;
