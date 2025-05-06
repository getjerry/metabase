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
    const trimmedLine = line.trim();

    // --- Regex Definitions ---
    // Keywords that typically start a foldable block (case-insensitive)
    // Added WINDOW, removed WITH (handled by paren logic preferably)
    const keywordRegex =
      /^\s*(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|CASE|WINDOW)\b/i;
    // CTEs and subqueries starting with parentheses (case-insensitive)
    const parenStartRegex = /^\s*(WITH\s+\w+\s+AS\s*\(|\w+\s+AS\s*\(|^\s*\()/i;

    // --- Check for Fold Start ---

    // 1. Check for Parenthesis-based starts (CTEs, Subqueries)
    const parenMatch = parenStartRegex.exec(trimmedLine);
    if (parenMatch) {
      // Check if it's likely a multi-line block. Find matching ')'
      let openParenCol = line.indexOf("(");
      // Adjust column for `name AS (` forms
      if (!trimmedLine.startsWith("(")) {
        const asMatch = line.match(/\bAS\s*\(/i);
        if (asMatch && line.indexOf("(") > asMatch.index) {
          // Ensure '(' comes after 'AS'
          openParenCol = line.indexOf("(");
        } else if (asMatch) {
          // Fallback if indexOf is weird, though less likely
          openParenCol = asMatch.index + asMatch[0].length - 1;
        }
      }

      if (openParenCol > -1) {
        const startPos = { row: row, column: openParenCol + 1 };
        // Use findMatchingBracket if available (more robust)
        if (session.findMatchingBracket) {
          const endPos = session.findMatchingBracket(startPos);
          // Mark start if matching bracket exists and is on a different line,
          // OR on the same line but significantly further away (heuristic for non-trivial single line)
          if (
            endPos &&
            (endPos.row > row ||
              (endPos.row === row && endPos.column > openParenCol + 5))
          ) {
            return "start";
          }
        } else {
          // Basic check if findMatchingBracket isn't there: Is there a ')' later on the line?
          if (line.indexOf(")", openParenCol + 1) === -1) {
            return "start"; // Assume multi-line if no ')' on the same line
          }
        }
      }
      // If checks fail (e.g., simple single line like `(1)`), don't mark "start" here.
    }

    // 2. Check for Keyword-based starts
    const keywordMatch = keywordRegex.exec(trimmedLine);
    if (keywordMatch) {
      // Avoid folding trivial single lines like "SELECT *;"
      // Check if next non-empty, non-comment line exists and is potentially indented
      // This is heuristic and might not always be accurate.
      let nextRow = row + 1;
      let nextLine = session.getLine(nextRow);
      while (
        nextLine !== undefined &&
        (nextLine.trim() === "" ||
          nextLine.trim().startsWith("--") ||
          nextLine.trim().startsWith("#") ||
          nextLine.trim().startsWith("/*"))
      ) {
        nextRow++;
        nextLine = session.getLine(nextRow);
      }

      if (nextLine !== undefined) {
        // Basic heuristic: fold if next line exists and doesn't start with a likely terminating keyword or semicolon immediately
        const nextTrimmed = nextLine.trim();
        if (!/^\s*(;|UNION|INTERSECT|EXCEPT)\b/i.test(nextTrimmed)) {
          // More advanced: check indentation (unreliable but sometimes useful)
          // const startIndent = line.match(/^\s*/)[0].length;
          // const nextIndent = nextLine.match(/^\s*/)[0].length;
          // if (nextIndent > startIndent || nextTrimmed !== "") { return "start"; }
          return "start"; // Optimistically mark as start if next significant line exists
        }
      }
    }

    // 3. Fallback (or include CStyle logic if desired, though unlikely useful for SQL)
    // return CStyleFoldMode.prototype.getFoldWidget.call(this, session, foldStyle, row);
    return ""; // Default: no fold widget
  };

  FoldMode.prototype.getFoldWidgetRange = function (session, foldStyle, row) {
    const line = session.getLine(row);
    const trimmedLine = line.trim();

    // --- Strategy 1: Parenthesis-based Folding (CTEs, Subqueries) ---
    const parenStartRegex = /^\s*(WITH\s+\w+\s+AS\s*\(|\w+\s+AS\s*\(|^\s*\()/i;
    const parenMatch = parenStartRegex.exec(trimmedLine);

    if (parenMatch) {
      let openParenCol = line.indexOf("(");
      // Adjust column precisely for `name AS (` forms
      if (parenMatch[0].toUpperCase().includes("AS")) {
        const asMatch = line.match(/\bAS\s*\(/i);
        if (asMatch) {
          openParenCol = asMatch.index + asMatch[0].length - 1;
        }
      }

      if (openParenCol > -1) {
        // Use Ace's robust bracket matcher
        if (session.findMatchingBracket) {
          const startPos = { row: row, column: openParenCol + 1 };
          const endPos = session.findMatchingBracket(startPos);
          if (endPos) {
            // Create range from opening '(' to closing ')'
            // Add 1 to end column to include the bracket visually
            return new Range(row, openParenCol, endPos.row, endPos.column + 1);
          }
        } else {
          // Fallback: Manual parenthesis counting (like your original code)
          const maxRow = session.getLength();
          let openBrackets = 1; // Start count from the '(' found
          for (let i = row; i < maxRow; i++) {
            const currentLine = session.getLine(i);
            // Start searching after the opening bracket on the first line
            const startJ = i === row ? openParenCol + 1 : 0;
            for (let j = startJ; j < currentLine.length; j++) {
              const char = currentLine[j];
              if (char === "(") {
                openBrackets++;
              } else if (char === ")") {
                openBrackets--;
              }
              if (openBrackets === 0) {
                // Found the matching closing bracket
                return new Range(row, openParenCol, i, j + 1);
              }
            }
          }
        }
        // If no matching bracket found by either method
        return null;
      }
    }

    // --- Strategy 2: Keyword-based Folding (SELECT, FROM, WHERE, etc.) ---
    const keywordRegex =
      /^\s*(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|CASE|WINDOW)\b/i;
    const keywordMatch = keywordRegex.exec(trimmedLine);

    if (keywordMatch) {
      const startKeyword = keywordMatch[1]
        .toUpperCase()
        .replace(/\s+BY$/, " BY"); // Normalize 'GROUP BY' etc.
      let foldEndRow = -1;
      const maxRow = session.getLength();
      let openParens = 0; // Track parenthesis depth relative to this block

      // Define keywords that typically terminate the current block
      // These lists might need adjustment based on SQL dialect specifics (PG vs CH)
      let terminatingKeywords = [];
      switch (startKeyword) {
        case "SELECT":
          terminatingKeywords = [
            "FROM",
            "WHERE",
            "GROUP BY",
            "HAVING",
            "ORDER BY",
            "LIMIT",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
            "FETCH",
            "OFFSET",
          ];
          break;
        case "FROM": // Includes JOINs conceptually
          terminatingKeywords = [
            "WHERE",
            "GROUP BY",
            "HAVING",
            "ORDER BY",
            "LIMIT",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
            "FETCH",
            "OFFSET",
          ];
          break;
        case "WHERE":
          terminatingKeywords = [
            "GROUP BY",
            "HAVING",
            "ORDER BY",
            "LIMIT",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
            "FETCH",
            "OFFSET",
          ];
          break;
        case "GROUP BY":
          terminatingKeywords = [
            "HAVING",
            "ORDER BY",
            "LIMIT",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
            "FETCH",
            "OFFSET",
          ];
          break;
        case "HAVING":
          terminatingKeywords = [
            "ORDER BY",
            "LIMIT",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
            "FETCH",
            "OFFSET",
          ];
          break;
        case "ORDER BY":
          terminatingKeywords = [
            "LIMIT",
            "OFFSET",
            "FETCH",
            "WINDOW",
            "UNION",
            "INTERSECT",
            "EXCEPT",
          ];
          break;
        case "WINDOW": // Window clause usually before ORDER BY or LIMIT
          terminatingKeywords = [
            "ORDER BY",
            "LIMIT",
            "OFFSET",
            "FETCH",
            "UNION",
            "INTERSECT",
            "EXCEPT",
          ];
          break;
        case "CASE":
          terminatingKeywords = ["END"]; // Simple termination for CASE
          break;
        // Note: WITH is handled by parenthesis logic above
      }

      // Iterate through subsequent lines to find the end of the block
      for (let i = row + 1; i < maxRow; i++) {
        const currentLine = session.getLine(i);
        const currentTrimmed = currentLine.trim();
        let lineContainsTerminator = false;

        // Basic comment skipping (naive)
        if (currentTrimmed.startsWith("--") || currentTrimmed.startsWith("#")) {
          continue;
        }
        // Skip empty lines
        if (currentTrimmed === "") {
          continue;
        }

        // Update parenthesis count *before* checking for keywords on this line
        // This helps handle cases like `WHERE column = (SELECT MAX(id)...)`
        for (let j = 0; j < currentLine.length; j++) {
          const char = currentLine[j];
          // Extremely basic string/comment awareness (can be fooled)
          if (char === "'" || char === '"') {
            const quote = char;
            j++;
            while (
              j < currentLine.length &&
              (currentLine[j] !== quote || currentLine[j - 1] === "\\")
            ) {
              j++;
            }
          } else if (char === "(") {
            openParens++;
          } else if (char === ")") {
            openParens--;
          }
        }

        // Check if the line starts with a terminating keyword *only if parentheses are balanced*
        // (openParens === 0 means we are at the same nesting level as the start keyword)
        if (openParens === 0) {
          const lineKeywordMatch = currentTrimmed.match(
            /^(\w+(\s+BY)?)(\s|\(|\)|;|$)/i,
          ); // Match first keyword(s) more carefully
          if (lineKeywordMatch) {
            const lineKeyword = lineKeywordMatch[1]
              .toUpperCase()
              .replace(/\s+BY$/, " BY");
            // Special handling for CASE / END
            if (startKeyword === "CASE" && lineKeyword !== "END") {
              // Inside a CASE, only END terminates at level 0
            } else if (startKeyword === "CASE" && lineKeyword === "END") {
              lineContainsTerminator = true;
            } else if (
              startKeyword !== "CASE" &&
              terminatingKeywords.includes(lineKeyword)
            ) {
              lineContainsTerminator = true;
            }
          }
        }

        // Check for end of statement (semicolon) as a potential terminator if outside parens
        // This is a weak terminator, as semicolons can be inside blocks in some dialects (PL/pgSQL)
        // We check it *after* keyword check to prioritize keywords.
        // if (!lineContainsTerminator && openParens === 0 && currentTrimmed.endsWith(';')) {
        //     lineContainsTerminator = true; // Let's NOT use semicolon as a primary block terminator for now.
        // }

        if (lineContainsTerminator) {
          foldEndRow = i - 1; // Fold ends on the line *before* the terminator
          break; // Found the end
        }

        // If parenthesis level drops below zero, something is wrong, stop searching
        if (openParens < 0) {
          // This might happen with complex/mismatched parens.
          // Folding to the previous line might be the safest fallback.
          foldEndRow = i - 1;
          break;
        }
      }

      // If no terminator found, fold to the last line of the document (or last processed line)
      if (foldEndRow === -1) {
        foldEndRow = maxRow - 1;
      }

      // Ensure the fold range is valid (end row >= start row)
      if (foldEndRow >= row) {
        // Calculate start column: Start fold *after* the keyword itself.
        const startCol =
          line.toLowerCase().indexOf(startKeyword.toLowerCase()) +
          startKeyword.length;
        // Calculate end column: End of the last line in the fold block.
        const endCol = session.getLine(foldEndRow).length;
        return new Range(row, startCol, foldEndRow, endCol);
      }
    }

    // Fallback: No range found for this starting line
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
