import ace from "ace-builds";

const oop = ace.require("ace/lib/oop");
const CStyleFoldMode = ace.require("ace/mode/folding/cstyle").FoldMode;
const SqlMode = ace.require("ace/mode/sql").Mode;
const Range = ace.require("ace/range").Range;

function createCustomSqlFoldMode() {
  function FoldMode() {
    CStyleFoldMode.call(this);
  }
  oop.inherits(FoldMode, CStyleFoldMode);

  FoldMode.prototype.getFoldWidget = function (session, foldStyle, row) {
    const line = session.getLine(row);
    return /^\s*WITH\s+\w+\s+AS\s*\(/i.test(line) ||
      /^\s*\w+\s+AS\s*\(/i.test(line)
      ? "start"
      : "";
  };

  FoldMode.prototype.getFoldWidgetRange = function (session, foldStyle, row) {
    const startLine = session.getLine(row);
    console.log("start line", startLine);
    const startLineMatch = startLine.match(/^\s*(WITH\s+)?(\w+)\s+AS\s*\(/i);
    if (!startLineMatch) {
      return null;
    }

    const startRow = row;
    const startColumn = startLine.indexOf("(") + 1;

    const maxRow = session.getLength();
    let openBrackets = 1;

    for (let i = row; i < maxRow; i++) {
      const line = session.getLine(i);
      for (let j = i === row ? startColumn : 0; j < line.length; j++) {
        const char = line[j];
        if (char === "(") {
          openBrackets++;
        }
        if (char === ")") {
          openBrackets--;
        }

        if (openBrackets === 0) {
          console.log("return", startRow, startColumn - 1, i, j + 1);
          return new Range(startRow, startColumn - 1, i, j + 1);
        }
      }
    }
    return null;
  };

  return new FoldMode();
}

class CustomSqlMode extends SqlMode {
  constructor() {
    super();
    this.foldingRules = createCustomSqlFoldMode();
  }
}

ace.define("ace/mode/custom-sql", [], function (require, exports) {
  exports.Mode = CustomSqlMode;
});
