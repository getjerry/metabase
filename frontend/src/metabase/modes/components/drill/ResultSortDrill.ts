import { t } from "ttag";
import { Drill } from "metabase/modes/types";

const ResultSortDrill: Drill = ({ question, clicked = {} }) => {
  function result_sort(...args: { id: string; props: { sort: any } }[]) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("metabase/query_builder/actions").resultSort(...args);
  }
  if (
    !clicked ||
    clicked.value !== undefined ||
    !clicked.column ||
    question._card.display !== "table"
  ) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { column } = clicked;

  return [
    {
      name: "sort",
      title: "Sort ascending",
      section: "sort",
      buttonType: "setting",
      icon: "arrow_up",
      tooltip: t`Sort ascending`,
      defaultAlways: false,
      action: () =>
        result_sort({
          id: "asc_sort",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          props: { sort: clicked.sortTableResult("asc", column) },
        }),
    },
    {
      name: "sort",
      title: "Sort descending",
      section: "sort",
      buttonType: "setting",
      icon: "arrow_down",
      tooltip: t`Sort descending`,
      defaultAlways: false,
      action: () =>
        result_sort({
          id: "desc_sort",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          props: { sort: clicked.sortTableResult("desc", column) },
        }),
    },
  ];
};

export default ResultSortDrill;
