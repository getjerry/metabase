import { connect } from "react-redux";
import _ from "underscore";
import RecentItems from "metabase/entities/recent-items";
import ActivityItems from "metabase/entities/activity-items";
import FrequentItems from "metabase/entities/frequent-items";
import { getUser } from "metabase/selectors/user";
import { State } from "metabase-types/store";
import HomeRecentSection from "../../components/HomeRecentSection";

const mapStateToProps = (state: State) => ({
  user: getUser(state),
});

export default _.compose(
  RecentItems.loadList(),
  ActivityItems.loadList(),
  FrequentItems.loadList(),
  connect(mapStateToProps),
)(HomeRecentSection);
