import { t } from "ttag";
import React from "react";
import { User } from "metabase-types/api";
import {
  CardIcon,
  CardRoot,
  CardTitle,
} from "metabase/home/homepage/components/HomeHelpCard/HomeHelpCard.styled";
import MetabaseSettings from "metabase/lib/settings";

export interface HomeShowMoreProps {
  showType: string;
  user: User;
}

const HomeShowMore = ({ showType, user }: HomeShowMoreProps): JSX.Element => {
  return (
    <CardRoot href={MetabaseSettings.showUrl(user, showType)}>
      <CardIcon name="reference" />
      <CardTitle>{t`See more`}</CardTitle>
    </CardRoot>
  );
};

export default HomeShowMore;
