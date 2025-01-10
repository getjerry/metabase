/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { t } from "ttag";
import _ from "underscore";
import { isProduction } from "metabase/env";
import RecipientPicker from "metabase/pulse/components/RecipientPicker";

import Form, { FormField, FormFooter } from "metabase/containers/FormikForm";
import ModalContent from "metabase/components/ModalContent";
import Radio from "metabase/core/components/Radio";
import validate from "metabase/lib/validate";
import { canonicalCollectionId } from "metabase/collections/utils";
import { getDataFromId } from "metabase/lib/indexedDBUtils";

import "./SaveQuestionModal.css";
import User from "metabase/entities/users";
import { getUser } from "metabase/selectors/user";
import { getPulseFormInput } from "metabase/pulse/selectors";
import { fetchPulseFormInput } from "metabase/pulse/actions";
import * as Q_DEPRECATED from "metabase-lib/queries/utils";
import { generateQueryDescription } from "metabase-lib/queries/utils/description";

const getSingleStepTitle = (questionType, showSaveType) => {
  if (questionType === "model") {
    return t`Save model`;
  } else if (showSaveType) {
    return t`Save question`;
  } else {
    return t`Save new question`;
  }
};

async function isCoreReport(question, user) {
  const report_id = `report_id_${question.id}`;
  let data;
  try {
    data = await getDataFromId(report_id);
    const tags = data?.metadata?.index?.tags || [];
    return isProduction
      ? tags.some(tag => tag.name === "Core") & user.group_ids.includes(6)
      : question.id === 10;
  } catch (error) {
    console.error("Error fetching data from IndexedDB:", error);
  }
  return false;
}

class SaveQuestionModalInner extends Component {
  static propTypes = {
    card: PropTypes.object.isRequired,
    originalCard: PropTypes.object,
    tableMetadata: PropTypes.object, // can't be required, sometimes null
    onCreate: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onReview: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    multiStep: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      isCoreReport: false,
      isCoreReportLoading: true,
      recipients: [],
    };
  }

  async componentDidMount() {
    const { originalCard, user } = this.props;
    try {
      const isCore = await isCoreReport(originalCard, user);
      this.setState({
        isCoreReport: isCore,
        isCoreReportLoading: false,
      });
    } catch (error) {
      console.error("Error fetching core report status:", error);
      this.setState({ isCoreReportLoading: false });
    }
  }

  validateName = (name, { values }) => {
    if (values.saveType !== "overwrite") {
      // We don't care if the form is valid when overwrite mode is enabled,
      // as original question's data will be submitted instead of the form values
      return validate.required()(name);
    }
  };

  handleRecipientsChange = recipients => {
    this.setState({ recipients });
  };

  handleSubmit = async details => {
    // TODO Atte Keinäenn 31/1/18 Refactor this
    // I think that the primary change should be that
    // SaveQuestionModal uses Question objects instead of directly modifying card objects –
    // but that is something that doesn't need to be done first)
    // question
    //     .setDisplayName(details.name.trim())
    //     .setDescription(details.description ? details.description.trim() : null)
    //     .setCollectionId(details.collection_id)
    let { card, originalCard, onCreate, onSave, onReview, user } = this.props;

    const collection_id = canonicalCollectionId(
      details.saveType === "overwrite"
        ? originalCard.collection_id
        : details.collection_id,
    );

    card = {
      ...card,
      name:
        details.saveType === "overwrite"
          ? originalCard.name
          : details.name.trim(),
      // since description is optional, it can be null, so check for a description before trimming it
      description:
        details.saveType === "overwrite"
          ? originalCard.description
          : details.description
          ? details.description.trim()
          : null,
      collection_id,
    };

    const { recipients, isCoreReport } = this.state;
    if (details.saveType === "create") {
      await onCreate(card);
    } else if (details.saveType === "overwrite" && isCoreReport) {
      // core report review
      const nowTime = new Date().toISOString();
      const copyCard = {
        ...card,
        name: `Review: ${originalCard.name} - created_by: ${user.first_name} ${user.last_name} at ${nowTime}`,
        description: originalCard.description,
        collection_id: isProduction ? 1075 : 3,
      };
      await onReview(copyCard, originalCard, recipients);
    } else if (details.saveType === "overwrite") {
      card.id = this.props.originalCard.id;
      await onSave(card);
    }
  };

  render() {
    const { isCoreReport, isCoreReportLoading } = this.state;
    const {
      card,
      originalCard,
      initialCollectionId,
      tableMetadata,
      user,
      users,
    } = this.props;

    const isStructured = Q_DEPRECATED.isStructured(card.dataset_query);
    const isReadonly = originalCard != null && !originalCard.can_write;

    const initialValues = {
      name:
        card.name || isStructured
          ? generateQueryDescription(tableMetadata, card.dataset_query.query)
          : "",
      description: card.description || "",
      collection_id:
        card.collection_id === undefined || isReadonly
          ? initialCollectionId
          : card.collection_id,
      saveType:
        originalCard && !originalCard.dataset && originalCard.can_write
          ? "overwrite"
          : "create",
    };

    const questionType = card.dataset ? "model" : "question";

    const multiStepTitle =
      questionType === "question"
        ? t`First, save your question`
        : t`First, save your model`;

    const showSaveType =
      !card.id &&
      !!originalCard &&
      !originalCard.dataset &&
      originalCard.can_write;

    const singleStepTitle = getSingleStepTitle(questionType, showSaveType);

    const title = this.props.multiStep ? multiStepTitle : singleStepTitle;

    const nameInputPlaceholder =
      questionType === "question"
        ? t`What is the name of your question?`
        : t`What is the name of your model?`;

    if (isCoreReportLoading) {
      return <div>Loading...</div>;
    }

    const sendUser = users.filter(u => u.id !== user.id);
    return (
      <ModalContent
        id="SaveQuestionModal"
        title={title}
        onClose={this.props.onClose}
      >
        <Form
          initialValues={initialValues}
          fields={[
            { name: "saveType" },
            {
              name: "name",
              validate: this.validateName,
            },
            { name: "description" },
            { name: "collection_id" },
          ]}
          onSubmit={this.handleSubmit}
          overwriteOnInitialValuesChange
        >
          {({ values, Form }) => {
            const submitTitle =
              isCoreReport && values.saveType === "overwrite"
                ? t`Send Review`
                : t`Save`;
            // console.log(values, isCoreReport);

            return (
              <Form>
                <FormField
                  name="saveType"
                  title={t`Replace or save as new?`}
                  type={SaveTypeInput}
                  hidden={!showSaveType}
                  originalCard={originalCard}
                  isCoreReport={isCoreReport}
                />
                <TransitionGroup>
                  {values.saveType === "overwrite" && Boolean(isCoreReport) && (
                    <CSSTransition
                      classNames="reviewQuestionModalFields"
                      timeout={{
                        enter: 500,
                        exit: 500,
                      }}
                    >
                      <div>
                        <p>
                          <strong>This is a core report.</strong> Any changes
                          need to be reviewed. A copy of the report will be
                          saved in the
                          <strong> Core Report Review</strong> collection.
                        </p>
                        <div className="mb4">
                          <div className="text-bold mb1">{t`Reviewers:`}</div>
                          <RecipientPicker
                            isNewPulse={true}
                            autoFocus={false}
                            recipients={this.state.recipients}
                            recipientTypes={["user", "email"]}
                            users={sendUser}
                            onRecipientsChange={this.handleRecipientsChange}
                            invalidRecipientText={domains =>
                              t`You're only allowed to email subscriptions to addresses ending in ${domains}`
                            }
                          />
                        </div>
                      </div>
                    </CSSTransition>
                  )}
                  {values.saveType === "create" && (
                    <CSSTransition
                      classNames="saveQuestionModalFields"
                      timeout={{
                        enter: 500,
                        exit: 500,
                      }}
                    >
                      <div className="saveQuestionModalFields">
                        <FormField
                          autoFocus
                          name="name"
                          title={t`Name`}
                          placeholder={nameInputPlaceholder}
                        />
                        <FormField
                          name="description"
                          type="text"
                          title={t`Description`}
                          placeholder={t`It's optional but oh, so helpful`}
                        />
                        <FormField
                          name="collection_id"
                          title={t`Which collection should this go in?`}
                          type="collection"
                        />
                      </div>
                    </CSSTransition>
                  )}
                </TransitionGroup>
                <FormFooter
                  submitTitle={submitTitle}
                  onCancel={this.props.onClose}
                />
              </Form>
            );
          }}
        </Form>
      </ModalContent>
    );
  }
}

const SaveTypeInput = ({ field, originalCard }) => (
  <Radio
    {...field}
    options={[
      {
        name: t`Replace original question, "${
          originalCard && originalCard.name
        }"`,
        value: "overwrite",
      },
      { name: t`Save as new question`, value: "create" },
    ]}
    vertical
  />
);

const SaveQuestionModal = _.compose(
  User.loadList(),
  connect(
    (state, props) => ({
      user: getUser(state),
      formInput: getPulseFormInput(state),
    }),
    {
      fetchPulseFormInput,
    },
  ),
)(SaveQuestionModalInner);

export default SaveQuestionModal;
