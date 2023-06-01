/* eslint-disable react/prop-types */
import { t } from "ttag";

// NOTE: cyclical dependency
// import { showChartSettings } from "metabase/query_builder/actions";
function showChartSettings(...args) {
  return require("metabase/query_builder/actions").showChartSettings(...args);
}

function fixColumnSettings(...args) {
  return require("metabase/query_builder/actions").fixColumnSettings(...args);
}

import { keyForColumn } from "metabase/lib/dataset";

export default ({ question, clicked }) => {
  if (
    !clicked ||
    clicked.value !== undefined ||
    !clicked.column ||
    !question.query().isEditable()
  ) {
    return [];
  }
  const { column } = clicked;

  const format = [
    {
      name: "formatting",
      title: "Column formatting",
      section: "sort",
      buttonType: "setting",
      icon: "gear",
      tooltip: t`Column formatting`,
      action: () =>
        showChartSettings({
          widget: {
            id: "column_settings",
            props: { initialKey: keyForColumn(column) },
          },
        }),
    },
  ];
  if (question._card.display === "table") {
    let tooltip = t`Freeze Left`;
    let title = "Freeze Column";
    const parentProps = clicked.parentProps;
    if (
      parentProps !== undefined &&
      parentProps.fixedColumn !== undefined &&
      column.name in parentProps.fixedColumn
    ) {
      tooltip = t`Cancel Freeze`;
      title = "Unfreeze Column";
    }
    format.push({
      name: "fixed",
      title: title,
      section: "sort",
      buttonType: "setting",
      icon: "gear",
      tooltip: tooltip,
      action: () =>
        fixColumnSettings({
          id: "fixed_settings",
          props: { fixed: clicked.fixedColumnClick(column, clicked) },
        }),
    });
  }
  return format;
};
