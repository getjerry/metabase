import { t } from "ttag";
import { Drill } from "metabase/modes/types";

const FreezeColumnDrill: Drill = ({ question, clicked = {} }) => {
  function fixColumnSettings(...args: { id: string; props: { fixed: any } }[]) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("metabase/query_builder/actions").fixColumnSettings(...args);
  }

  if (
    !clicked ||
    clicked.value !== undefined ||
    !clicked.column ||
    !question.query().isEditable() ||
    question._card.display !== "table"
  ) {
    return [];
  }
  const { column } = clicked;
  let tooltip = t`Freeze Left`;
  let title = "Freeze Column";
  const parentProps = clicked.parentProps;
  if (parentProps !== undefined) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fixedColumn = parentProps.fixedColumn;
    if (fixedColumn !== undefined && column.name in fixedColumn) {
      tooltip = t`Cancel Freeze`;
      title = "Unfreeze Column";
    }
  }

  return [
    {
      name: "fixed",
      title: title,
      section: "sort",
      buttonType: "setting",
      icon: "gear",
      defaultAlways: true,
      tooltip: tooltip,
      action: () =>
        fixColumnSettings({
          id: "fixed_settings",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          props: { fixed: clicked.fixedColumnClick(column, clicked) },
        }),
    },
  ];
};

export default FreezeColumnDrill;
