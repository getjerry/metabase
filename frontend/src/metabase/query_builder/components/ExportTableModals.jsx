// /* eslint-disable react/prop-types */
// import {connect} from "react-redux";
// import React, {Component} from "react";
// import {getQuestion, getVisualizationSettings} from "metabase/query_builder/selectors";
// import {getUser, getUserIsAdmin} from "metabase/selectors/user";
// import {
//   hasConfiguredAnyChannelSelector,
//   hasConfiguredEmailChannelSelector,
//   hasLoadedChannelInfoSelector
// } from "metabase/pulse/selectors";
// import {createAlert} from "metabase/alert/alert";
// import {fetchPulseFormInput} from "metabase/pulse/actions";
// import {apiUpdateQuestion, updateUrl} from "metabase/query_builder/actions";
// import MetabaseCookies from "metabase/lib/cookies";
// import {getDefaultAlert} from "metabase-lib/lib/Alert";
// import {AlertEditChannels, AlertEditSchedule, AlertGoalToggles} from "metabase/query_builder/components/AlertModals";
//
//
// class CreateExportTableModalContentInner extends Component {
//   constructor(props) {
//     super();
//
//     const {question, user, visualizationSettings} = props;
//
//     this.state = {
//       // hasSeenEducationalScreen: MetabaseCookies.getHasSeenAlertSplash(),
//       // alert: getDefaultAlert(question, user, visualizationSettings),
//     };
//   }
//
//   render() {
//     return (
//       <div>
//         abc
//       </div>
//     );
//   }
//
// }
//
// export const CreateExportModalContent = connect(
//   state => ({}),
// )(CreateExportTableModalContentInner);
//
//
