/* eslint-disable react/prop-types */
import React from "react";
import cx from "classnames";
import { t } from "ttag";
import Icon from "metabase/components/Icon";

export default class QuestionExportWidget extends React.Component {
  render() {
    const { className, onExportClick } = this.props;

    return (
      <Icon
        name="copy"
        tooltip={t`Export`}
        className={cx(
          className,
          "mx1 hide sm-show text-brand-hover cursor-pointer",
        )}
        onClick={onExportClick}
      />
    );
  }
}
