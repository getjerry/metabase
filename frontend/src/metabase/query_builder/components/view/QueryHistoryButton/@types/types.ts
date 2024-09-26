export interface QueryHistory {
  hash: string;
  database_id: number;
  result_rows: number;
  started_at: string;
  native: boolean;
  running_time: number;
  query: string;
  name: string;
}

export interface Query {
  type: string;
  native?: Native;
  database: number;
  middleware: Middleware;
}
export interface Native {
  query?: string;
}

export interface Middleware {
  "js-int-to-string?": boolean;
  "add-default-userland-constraints?": boolean;
}
