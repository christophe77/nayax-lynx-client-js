import type { HttpClient, RequestOptions } from "../http/http-client.js";

export interface PagePaginatorOptions {
  /** Items per page sent on every request. Default: 100. */
  pageSize?: number;
  /** First page to request (1-indexed). Default: 1. */
  startPage?: number;
  /** Query-string name for page-size param. Default: `pageSize`. */
  limitParam?: string;
  /** Query-string name for page-number param. Default: `pageNumber`. */
  pageParam?: string;
  /** Hard cap on total items yielded. */
  maxItems?: number;
}

/**
 * Paginator for Lynx endpoints that:
 *  - take `pageNumber` (1-indexed) and `pageSize` query params
 *  - return a **bare JSON array** of items (no envelope)
 *
 * Used by `GET /v1/devices`. Sibling of {@link OffsetPaginator}.
 */
export class PagePaginator<T> implements AsyncIterable<T> {
  private readonly pageSize: number;
  private readonly startPage: number;
  private readonly limitParam: string;
  private readonly pageParam: string;
  private readonly maxItems: number | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly base: RequestOptions,
    options: PagePaginatorOptions = {},
  ) {
    this.pageSize = options.pageSize ?? 100;
    this.startPage = options.startPage ?? 1;
    this.limitParam = options.limitParam ?? "pageSize";
    this.pageParam = options.pageParam ?? "pageNumber";
    this.maxItems = options.maxItems;
  }

  async collect(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }

  async *pages(): AsyncGenerator<T[], void, void> {
    let page = this.startPage;
    let yielded = 0;
    while (true) {
      const query: NonNullable<RequestOptions["query"]> = { ...(this.base.query ?? {}) };
      query[this.limitParam] = this.pageSize;
      query[this.pageParam] = page;
      const opts: RequestOptions = { ...this.base, query };
      const items = await this.http.request<T[]>(opts);
      const arr = Array.isArray(items) ? items : [];
      yield arr;
      yielded += arr.length;
      if (arr.length < this.pageSize) return;
      if (this.maxItems !== undefined && yielded >= this.maxItems) return;
      page += 1;
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
