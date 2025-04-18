import React from "react";
import { t } from "ttag";
import cx from "classnames";

import PropTypes from "prop-types";
// eslint-disable-next-line import/no-unresolved
import { format } from "sql-formatter";
import { FormatPainterFilled } from "@ant-design/icons";
import Tooltip from "metabase/core/components/Tooltip";

const SQLFormat = ({ editor, datasetQuery, databases, className, size }) => {
  const formatSQL = () => {
    if (editor) {
      const selectedDatabase = databases.find(
        db => db.id === datasetQuery.database,
      );
      let language = "sql";
      if (selectedDatabase) {
        if (selectedDatabase.engine === "postgres") {
          language = "postgresql";
        } else if (selectedDatabase.engine === "mysql") {
          language = "mysql";
        } else {
          language = "sql";
        }
      }
      const selectedText = editor.getSelectedText();
      const fullText = editor.getValue();
      const cfg = {
        language: language,
        tabWidth: 2,
        keywordCase: "upper",
        expressionWidth: 100,
        linesBetweenQueries: 2,
        paramTypes: {
          custom: [
            { regex: String.raw`\{\{\s*\w+\s*\}\}` },
            { regex: String.raw`\{\w+\}` },
            { regex: String.raw`\[\[\s*[\s\S]*?\s*\]\]` },
            { regex: String.raw`\[\s*[\s\S]*?\s*\]` },
          ],
        },
      };
      if (selectedText?.trim()) {
        try {
          const formatted = format(selectedText, cfg);
          const range = editor.getSelectionRange();
          editor.session.replace(range, formatted);
        } catch (e) {
          console.error("SQL format error:", e);
        }
      } else {
        try {
          const formatted = format(fullText, cfg);
          editor.setValue(formatted, -1);
        } catch (e) {
          console.error("SQL format error:", e);
        }
      }
    }
  };
  return (
    <Tooltip tooltip={t`SQL Format`}>
      <a className={cx(className, "transition-color text-brand-hover")}>
        <FormatPainterFilled style={{ fontSize: size }} onClick={formatSQL} />
      </a>
    </Tooltip>
  );
};

SQLFormat.propTypes = {
  editor: PropTypes.object,
  datasetQuery: PropTypes.object,
  databases: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.number,
};
export default SQLFormat;
