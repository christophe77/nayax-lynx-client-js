import type { HttpClient } from "../http/http-client.js";
import { Paginator } from "../pagination/paginator.js";
import type { Transaction, TransactionQuery } from "../types/transaction.js";

export class TransactionsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Paginated list of transactions, filterable by machine/date/status.
   * Use `.collect()` for a flat array or iterate with `for await`.
   */
  list(query: TransactionQuery): Paginator<Transaction> {
    const q: Record<string, string | number | undefined> = {
      from: query.from,
      to: query.to,
    };
    if (query.machineId !== undefined) q.machineId = query.machineId;
    if (query.status !== undefined) q.status = query.status;
    if (query.pageSize !== undefined) q.pageSize = query.pageSize;
    if (query.cursor !== undefined) q.cursor = query.cursor;
    return new Paginator<Transaction>(this.http, {
      method: "GET",
      path: "/v1/transactions",
      query: q,
    });
  }

  async get(id: string): Promise<Transaction> {
    return this.http.request<Transaction>({
      method: "GET",
      path: `/v1/transactions/${encodeURIComponent(id)}`,
    });
  }
}
