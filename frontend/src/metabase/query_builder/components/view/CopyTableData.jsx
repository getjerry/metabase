import _ from "underscore";
import {
  getTableCellClickedObject,
  getTableClickedObjectRowData,
} from "metabase/visualizations/lib/table";
import { formatValue } from "metabase/lib/formatting/value";
import * as DataGrid from "metabase/lib/data_grid";
import Table from "metabase/visualizations/visualizations/Table";
import { findColumnIndexForColumnSetting } from "metabase-lib/queries/utils/dataset";

function getData(data, settings, series) {
  if (Table.isPivoted(series, settings)) {
    const pivotIndex = _.findIndex(
      data.cols,
      col => col.name === settings["table.pivot_column"],
    );
    const cellIndex = _.findIndex(
      data.cols,
      col => col.name === settings["table.cell_column"],
    );
    const normalIndex = _.findIndex(
      data.cols,
      (col, index) => index !== pivotIndex && index !== cellIndex,
    );
    return DataGrid.pivot(data, normalIndex, pivotIndex, cellIndex, settings);
  } else {
    const { cols, rows } = data;
    const columnSettings = settings["table.columns"];
    const columnIndexes = columnSettings
      .filter(columnSetting => columnSetting.enabled)
      .map(columnSetting =>
        findColumnIndexForColumnSetting(cols, columnSetting),
      )
      .filter(columnIndex => columnIndex >= 0 && columnIndex < cols.length);
    return {
      cols: columnIndexes.map(i => cols[i]),
      rows: rows.map(row => columnIndexes.map(i => row[i])),
    };
  }
}

function getCellClickedObject(rowIndex, columnIndex, data, settings, series) {
  try {
    return _getCellClickedObjectCached(
      data,
      settings,
      rowIndex,
      columnIndex,
      settings["table.pivot"],
      series,
    );
  } catch (e) {
    console.error(e);
  }
}

function _getCellClickedObjectCached(
  data,
  settings,
  rowIndex,
  columnIndex,
  isPivoted,
  series,
) {
  const clickedRowData = getTableClickedObjectRowData(
    series,
    rowIndex,
    columnIndex,
    isPivoted,
    data,
  );

  return getTableCellClickedObject(
    data,
    settings,
    rowIndex,
    columnIndex,
    isPivoted,
    clickedRowData,
  );
}

function getCellFormattedValue(value, columnSettings, clicked) {
  try {
    return formatValue(value, {
      ...columnSettings,
      type: "cell",
      jsx: true,
      rich: true,
      clicked: clicked,
    });
  } catch (e) {
    console.error(e);
  }
}

function extractSourceData(result) {
  const cols = { result }.result.data.cols;
  const headers = cols.map(col => col.display_name);
  const formattedHeaders = headers.join("\t");
  const rows = { result }.result.data.rows;
  const formattedRows = rows.map(row => row.join("\t")).join("\n");
  return `${formattedHeaders}\n${formattedRows}`;
}

export function copyData(
  isShowingRawTable,
  result,
  visualizationSettings,
  rawSeries,
) {
  try {
    if (isShowingRawTable) {
      return extractSourceData(result);
    } else {
      const data = { result }.result.data;
      const showData = getData(data, visualizationSettings, rawSeries);
      const headers = showData.cols.map(col => col.display_name);
      const formattedHeaders = headers.join("\t");
      const formattedRows = showData.rows
        .map((row, index) => {
          const showRow = row.map((value, subIndex) => {
            const column = showData.cols[subIndex];
            const clicked = getCellClickedObject(
              index,
              subIndex,
              showData,
              visualizationSettings,
              rawSeries,
            );
            const columnSettings = visualizationSettings.column(column);
            return getCellFormattedValue(value, columnSettings, clicked);
          });
          return showRow.join("\t");
        })
        .join("\n");
      return `${formattedHeaders}\n${formattedRows}`;
    }
  } catch (e) {
    console.error(e);
    return extractSourceData(result);
  }
}
