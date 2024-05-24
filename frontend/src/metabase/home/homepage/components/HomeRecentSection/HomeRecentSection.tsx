import React from "react";
import { t } from "ttag";
import * as Urls from "metabase/lib/urls";
import { getIcon, getName } from "metabase/entities/recent-items";
import {
  getActivityIcon,
  getActivitytName,
} from "metabase/entities/activity-items";
import {
  getFrequentIcon,
  getFrequentName,
} from "metabase/entities/frequent-items";
import {
  RecentItem,
  ActivityItem,
  FrequentItem,
  User,
} from "metabase-types/api";
import HomeCaption from "../HomeCaption";
import HomeHelpCard from "../HomeHelpCard";
import HomeModelCard from "../HomeModelCard";
import { isWithinWeeks } from "../../utils";
import HomeShowMore from "./HomeShowMore";
import { SectionBody } from "./HomeRecentSection.styled";

export interface HomeRecentSectionProps {
  user: User;
  recentItems: RecentItem[];
  activityItems: ActivityItem[];
  frequentItems: FrequentItem[];
}

const HomeRecentSection = ({
  user,
  recentItems,
  activityItems,
  frequentItems,
}: HomeRecentSectionProps): JSX.Element => {
  const hasHelpCard = user.is_installer && isWithinWeeks(user.first_login, 2);

  return (
    <div>
      <div>
        <HomeCaption>{t`Pick up where you left off`}</HomeCaption>
        <SectionBody>
          {recentItems.map((item, index) => (
            <HomeModelCard
              key={index}
              title={getName(item)}
              icon={getIcon(item)}
              url={Urls.modelToUrl(item) ?? ""}
            />
          ))}
          <HomeShowMore showType={"recent_view"} user={user} />
          {hasHelpCard && <HomeHelpCard />}
        </SectionBody>
      </div>
      <div style={{ marginTop: "40px" }}>
        <HomeCaption>{t`Here are some updates items`}</HomeCaption>
        <SectionBody>
          {activityItems.map((item, index) => (
            <HomeModelCard
              key={index}
              title={getActivitytName(item)}
              icon={getActivityIcon(item)}
              url={Urls.modelToUrl(item) ?? ""}
            />
          ))}
          <HomeShowMore showType={"recent_activity"} user={user} />
          {hasHelpCard && <HomeHelpCard />}
        </SectionBody>
      </div>
      <div style={{ marginTop: "40px" }}>
        <HomeCaption>{t`Here are some frequent Dashboard/Question`}</HomeCaption>
        <SectionBody>
          {frequentItems.map((item, index) => (
            <HomeModelCard
              key={index}
              title={getFrequentName(item)}
              icon={getFrequentIcon(item)}
              url={Urls.modelToUrl(item) ?? ""}
            />
          ))}
          <HomeShowMore showType={"frequent_report"} user={user} />
          {hasHelpCard && <HomeHelpCard />}
        </SectionBody>
      </div>
    </div>
  );
};

export default HomeRecentSection;
