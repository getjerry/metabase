import React from "react";
import PropTypes from "prop-types";
import { t } from "ttag";

import { isMac } from "metabase/lib/browser";

import DataReferenceButton from "metabase/query_builder/components/view/DataReferenceButton";
import NativeVariablesButton from "metabase/query_builder/components/view/NativeVariablesButton";
import SnippetSidebarButton from "metabase/query_builder/components/view/SnippetSidebarButton";
import PreviewQueryButton from "metabase/query_builder/components/view/PreviewQueryButton";

import AISQL from "metabase/components/Jerry/AISQL";
import SQLFormat from "metabase/components/Jerry/SQLFormat";
import {
  Container,
  RunButtonWithTooltipStyled,
} from "./NativeQueryEditorSidebar.styled";

const propTypes = {
  question: PropTypes.object,
  cancelQuery: PropTypes.func,
  isResultDirty: PropTypes.bool,
  isRunnable: PropTypes.bool,
  isRunning: PropTypes.bool,
  nativeEditorSelectedText: PropTypes.string,
  runQuery: PropTypes.func,
  editor: PropTypes.object,
  snippetCollections: PropTypes.array,
  snippets: PropTypes.array,
  user: PropTypes.object,
};

const ICON_SIZE = 18;

const NativeQueryEditorSidebar = props => {
  const {
    question,
    cancelQuery,
    isResultDirty,
    isRunnable,
    isRunning,
    nativeEditorSelectedText,
    runQuery,
    editor,
    snippetCollections,
    snippets,
    user,
  } = props;

  // hide the snippet sidebar if there aren't any visible snippets/collections
  // and the root collection isn't writable
  const showSnippetSidebarButton = !(
    snippets?.length === 0 &&
    snippetCollections?.length === 1 &&
    !snippetCollections[0].can_write
  );

  const getTooltip = () => {
    const command = nativeEditorSelectedText
      ? t`Run selected text`
      : t`Run query`;

    const shortcut = isMac() ? t`(⌘ + enter)` : t`(Ctrl + enter)`;

    return command + " " + shortcut;
  };

  const canRunQuery = runQuery && cancelQuery;

  let hasAISQL = false;
  if (user.group_ids.includes(6) || user.common_name === "zhipeng wu") {
    hasAISQL = true;
  }

  return (
    <Container data-testid="native-query-editor-sidebar">
      <DataReferenceButton {...props} size={ICON_SIZE} className="mt3" />
      <NativeVariablesButton {...props} size={ICON_SIZE} className="mt3" />
      {showSnippetSidebarButton && (
        <SnippetSidebarButton {...props} size={ICON_SIZE} className="mt3" />
      )}
      {PreviewQueryButton.shouldRender({ question }) && (
        <PreviewQueryButton {...props} />
      )}
      <SQLFormat editor={editor} {...props} size={ICON_SIZE} className="mt3" />
      {hasAISQL && (
        <AISQL editor={editor} {...props} size={ICON_SIZE} className="mt3" />
      )}
      {!!canRunQuery && (
        <RunButtonWithTooltipStyled
          disabled={!isRunnable}
          isRunning={isRunning}
          isDirty={isResultDirty}
          onRun={runQuery}
          onCancel={cancelQuery}
          compact
          getTooltip={getTooltip}
        />
      )}
    </Container>
  );
};

NativeQueryEditorSidebar.propTypes = propTypes;

export default NativeQueryEditorSidebar;
