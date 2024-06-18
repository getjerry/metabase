import React from "react";
import _ from "underscore";
import { connect } from "react-redux";
import { Location } from "history";
import { push } from "react-router-redux";
import Databases from "metabase/entities/databases";
import { State } from "metabase-types/store";
import { getHasDataAccess, getHasNativeWrite } from "metabase/selectors/data";
import Database from "metabase-lib/metadata/Database";

interface MetadataOptionsProps {
  databases?: Database[];
  location: Location;
}

const mapStateToProps = (state: State, { databases = [] }) => ({
  hasDataAccess: getHasDataAccess(databases),
  hasNativeWrite: getHasNativeWrite(databases),
});

const mapDispatchToProps = {
  push,
};

const MetadataOptions = (props: MetadataOptionsProps) => {
  return <div style={{ height: "100%", padding: "5px" }}></div>;
};
export default _.compose(
  Databases.loadList({
    loadingAndErrorWrapper: false,
  }),
  connect(mapStateToProps, mapDispatchToProps),
)(MetadataOptions);
