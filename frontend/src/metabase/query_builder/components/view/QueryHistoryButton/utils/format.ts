/**
 * Format SQL to be displayed in the UI
 * @param sql
 * @param visibleLength
 */
export const formatSql = (sql?: string, visibleLength: number = 50) => {
  if (!sql) {
    return "";
  }

  if (sql.length <= 50) {
    return sql;
  }

  return sql.substring(0, 50) + "...";
};
