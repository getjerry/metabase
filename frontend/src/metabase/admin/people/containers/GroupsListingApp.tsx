import _ from "underscore";

import Group from "metabase/entities/groups";
import { connect } from "metabase/lib/redux";
import { PLUGIN_GROUP_MANAGERS } from "metabase/plugins";
import { getUserIsAdmin } from "metabase/selectors/user";
import type { State } from "metabase-types/store";

import { GroupsListing } from "../components/GroupsListing";

const mapStateToProps = (state: State, props: { entityQuery: unknown }) => ({
  groups: Group.selectors.getList(state, props),
  isAdmin: getUserIsAdmin(state),
});

const mapDispatchToProps = {
  delete: PLUGIN_GROUP_MANAGERS.deleteGroup ?? Group.actions.delete,
};

export const GroupsListingApp = _.compose(
  Group.loadList({ reload: true }),
  connect(mapStateToProps, mapDispatchToProps),
)(GroupsListing);
