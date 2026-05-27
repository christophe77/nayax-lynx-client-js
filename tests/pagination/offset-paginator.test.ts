import { describe, expect, it } from "vitest";
import { TokenManager } from "../../src/auth/token-manager.js";
import { resolveConfig } from "../../src/config.js";
import { HttpClient } from "../../src/http/http-client.js";
import { OffsetPaginator } from "../../src/pagination/offset-paginator.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

function build(queue: Parameters<typeof makeFetchMock>[0]) {
  const { fetch, calls } = makeFetchMock(queue);
  const cfg = resolveConfig({
    baseUrl: "https://api.test.example",
    auth: { type: "static", token: "T" },
    fetch,
    retry: { maxRetries: 0, initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1 },
  });
  return { http: new HttpClient(cfg, new TokenManager(cfg)), calls };
}

describe("OffsetPaginator", () => {
  it("stops as soon as a partial page comes back", async () => {
    const { http, calls } = build([
      { status: 200, body: [1, 2, 3] },
      { status: 200, body: [4, 5] }, // partial
    ]);
    const p = new OffsetPaginator<number>(
      http,
      { method: "GET", path: "/things" },
      { pageSize: 3 },
    );
    expect(await p.collect()).toEqual([1, 2, 3, 4, 5]);
    expect(calls).toHaveLength(2);
    expect(calls[0]!.url).toContain("ResultsLimit=3&ResultsOffset=0");
    expect(calls[1]!.url).toContain("ResultsOffset=3");
  });

  it("respects custom param names + start offset", async () => {
    const { http, calls } = build([{ status: 200, body: [] }]);
    const p = new OffsetPaginator<number>(
      http,
      { method: "GET", path: "/things" },
      { pageSize: 10, startOffset: 50, limitParam: "limit", offsetParam: "skip" },
    );
    await p.collect();
    expect(calls[0]!.url).toContain("limit=10&skip=50");
  });

  it("respects maxItems even mid-page", async () => {
    const { http } = build([{ status: 200, body: [1, 2, 3, 4, 5] }]);
    const p = new OffsetPaginator<number>(
      http,
      { method: "GET", path: "/things" },
      { pageSize: 5, maxItems: 2 },
    );
    const out: number[] = [];
    for await (const n of p) out.push(n);
    expect(out).toEqual([1, 2]);
  });
});
