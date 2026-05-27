import type { HttpClient, RequestOptions } from "../http/http-client.js";

export interface OffsetPaginatorOptions {
  /** Page size sent on every request. Default: 100. */
  pageSize?: number;
  /** Starting offset. Default: 0. */
  startOffset?: number;
  /** Query-string name for the page-size param. Default: `ResultsLimit`. */
  limitParam?: string;
  /** Query-string name for the offset param. Default: `ResultsOffset`. */
  offsetParam?: string;
  /** Hard cap on total items yielded. */
  maxItems?: number;
}

/**
 * Paginator for Lynx endpoints that:
 *  - take `ResultsLimit` / `ResultsOffset` query params
 *  - return a **bare JSON array** of items (no envelope)
 *
 * Stops when the server returns fewer items than `ResultsLimit` (or when
 * `maxItems` is reached). Implements `AsyncIterable<T>` and `collect()`.
 */
export class OffsetPaginator<T> implements AsyncIterable<T> {
  private readonly pageSize: number;
  private readonly startOffset: number;
  private readonly limitParam: string;
  private readonly offsetParam: string;
  private readonly maxItems: number | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly base: RequestOptions,
    options: OffsetPaginatorOptions = {},
  ) {
    this.pageSize = options.pageSize ?? 100;
    this.startOffset = options.startOffset ?? 0;
    this.limitParam = options.limitParam ?? "ResultsLimit";
    this.offsetParam = options.offsetParam ?? "ResultsOffset";
    this.maxItems = options.maxItems;
  }

  async collect(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }

  async *pages(): AsyncGenerator<T[], void, void> {
    let offset = this.startOffset;
    let yielded = 0;
    while (true) {
      const query: NonNullable<RequestOptions["query"]> = { ...(this.base.query ?? {}) };
      query[this.limitParam] = this.pageSize;
      query[this.offsetParam] = offset;
      const opts: RequestOptions = { ...this.base, query };
      const items = await this.http.request<T[]>(opts);
      const arr = Array.isArray(items) ? items : [];
      yield arr;
      yielded += arr.length;
      if (arr.length < this.pageSize) return;
      if (this.maxItems !== undefined && yielded >= this.maxItems) return;
      offset += this.pageSize;
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let count = 0;
    for await (const page of this.pages()) {
      for (const item of page) {
        if (this.maxItems !== undefined && count >= this.maxItems) return;
        count++;
        yield item;
      }
    }
  }
}
