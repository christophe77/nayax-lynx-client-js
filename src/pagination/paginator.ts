import type { HttpClient, RequestOptions } from "../http/http-client.js";
import type { PaginatedResponse } from "../types/common.js";

export interface PaginateOptions<T> {
  /** Maximum items to yield across pages. Useful as a hard safety stop. */
  maxItems?: number;
  /** Hook called once per page response, before items are yielded. */
  onPage?: (page: PaginatedResponse<T>, pageIndex: number) => void;
}

/**
 * AsyncIterable wrapper over a paginated Lynx endpoint.
 *
 * Supports two pagination styles the Lynx surface uses:
 *  - cursor: response carries `nextCursor`, request takes `cursor`
 *  - page/pageSize: response carries `page`/`totalPages`, request takes `page`
 */
export class Paginator<T> implements AsyncIterable<T> {
  constructor(
    private readonly http: HttpClient,
    private readonly base: RequestOptions,
    private readonly options: PaginateOptions<T> = {},
  ) {}

  /** Materialise everything into an array (respects maxItems). */
  async collect(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }

  /** Yields each page envelope (rather than each item). */
  async *pages(): AsyncGenerator<PaginatedResponse<T>, void, void> {
    let cursor: string | undefined =
      typeof this.base.query?.cursor === "string" ? this.base.query.cursor : undefined;
    let page: number | undefined =
      typeof this.base.query?.page === "number" ? this.base.query.page : undefined;
    let yielded = 0;
    let pageIndex = 0;

    while (true) {
      const query: NonNullable<RequestOptions["query"]> = { ...(this.base.query ?? {}) };
      if (cursor !== undefined) query.cursor = cursor;
      if (page !== undefined) query.page = page;

      const opts: RequestOptions = { ...this.base, query };
      const res = await this.http.request<PaginatedResponse<T>>(opts);

      this.options.onPage?.(res, pageIndex);
      pageIndex++;
      yield res;

      const items = res.items ?? res.data ?? [];
      yielded += items.length;
      if (this.options.maxItems !== undefined && yielded >= this.options.maxItems) return;

      // Determine next page locator.
      if (typeof res.nextCursor === "string" && res.nextCursor.length > 0) {
        cursor = res.nextCursor;
        page = undefined;
      } else if (
        typeof res.page === "number" &&
        typeof res.totalPages === "number" &&
        res.page < res.totalPages
      ) {
        page = res.page + 1;
        cursor = undefined;
      } else if (
        typeof res.page === "number" &&
        res.totalPages === undefined &&
        items.length > 0 &&
        typeof res.pageSize === "number" &&
        items.length >= res.pageSize
      ) {
        // Unknown total but the page is full — try the next page.
        page = res.page + 1;
        cursor = undefined;
      } else {
        return;
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let count = 0;
    for await (const pageRes of this.pages()) {
      const items = pageRes.items ?? pageRes.data ?? [];
      for (const item of items) {
        if (this.options.maxItems !== undefined && count >= this.options.maxItems) return;
        count++;
        yield item;
      }
    }
  }
}
