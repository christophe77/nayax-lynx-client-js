/**
 * Common shapes used across resources.
 *
 * The Nayax Lynx API exposes paginated lists. The exact envelope shape varies
 * by endpoint and may evolve — this client supports both cursor-style and
 * page/pageSize-style responses (see {@link PaginatedResponse}).
 */
export interface DateRange {
  /** ISO-8601 string (inclusive). */
  from: string;
  /** ISO-8601 string (exclusive). */
  to: string;
}

/**
 * Permissive paginated envelope: a response is treated as paginated if it has
 * an `items` array (or `data` array) plus either a `nextCursor` token or a
 * `page`/`totalPages` pair.
 */
export interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  nextCursor?: string | null;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
}
