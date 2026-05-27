import { describe, expect, it } from "vitest";
import { TokenManager } from "../../src/auth/token-manager.js";
import { resolveConfig } from "../../src/config.js";
import { HttpClient } from "../../src/http/http-client.js";
import { Paginator } from "../../src/pagination/paginator.js";
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

describe("Paginator — cursor style", () => {
  it("walks pages until nextCursor is null/empty", async () => {
    const { http, calls } = build([
      { status: 200, body: { items: [1, 2], nextCursor: "c2" } },
      { status: 200, body: { items: [3, 4], nextCursor: "c3" } },
      { status: 200, body: { items: [5], nextCursor: null } },
    ]);
    const p = new Paginator<number>(http, { path: "/things" });
    expect(await p.collect()).toEqual([1, 2, 3, 4, 5]);
    expect(calls).toHaveLength(3);
    expect(calls[0]!.url).toBe("https://api.test.example/operational/things");
    expect(calls[1]!.url).toContain("cursor=c2");
    expect(calls[2]!.url).toContain("cursor=c3");
  });

  it("supports for-await iteration with maxItems cap", async () => {
    const { http, calls } = build([
      { status: 200, body: { items: [1, 2], nextCursor: "c2" } },
      { status: 200, body: { items: [3, 4], nextCursor: "c3" } },
    ]);
    const p = new Paginator<number>(http, { path: "/things" }, { maxItems: 3 });
    const out: number[] = [];
    for await (const n of p) out.push(n);
    expect(out).toEqual([1, 2, 3]);
    // we still fetched page 2 (paginator yields items lazily but page is fetched at once)
    expect(calls.length).toBeLessThanOrEqual(2);
  });

  it("treats 'data' as an alias for 'items'", async () => {
    const { http } = build([{ status: 200, body: { data: [10], nextCursor: null } }]);
    const p = new Paginator<number>(http, { path: "/things" });
    expect(await p.collect()).toEqual([10]);
  });
});

describe("Paginator — page/pageSize style", () => {
  it("increments page until totalPages reached", async () => {
    const { http, calls } = build([
      { status: 200, body: { items: ["a", "b"], page: 1, pageSize: 2, totalPages: 3 } },
      { status: 200, body: { items: ["c", "d"], page: 2, pageSize: 2, totalPages: 3 } },
      { status: 200, body: { items: ["e"], page: 3, pageSize: 2, totalPages: 3 } },
    ]);
    const p = new Paginator<string>(http, { path: "/things", query: { page: 1 } });
    expect(await p.collect()).toEqual(["a", "b", "c", "d", "e"]);
    expect(calls).toHaveLength(3);
    expect(calls[1]!.url).toContain("page=2");
    expect(calls[2]!.url).toContain("page=3");
  });

  it("stops on partial last page when totalPages absent", async () => {
    const { http, calls } = build([
      { status: 200, body: { items: ["a", "b"], page: 1, pageSize: 2 } }, // full page
      { status: 200, body: { items: ["c"], page: 2, pageSize: 2 } }, // partial — stop
    ]);
    const p = new Paginator<string>(http, { path: "/things", query: { page: 1 } });
    expect(await p.collect()).toEqual(["a", "b", "c"]);
    expect(calls).toHaveLength(2);
  });
});

describe("Paginator — onPage hook + .pages()", () => {
  it("calls onPage with page index", async () => {
    const seenIndices: number[] = [];
    const { http } = build([
      { status: 200, body: { items: [1], nextCursor: "c2" } },
      { status: 200, body: { items: [2], nextCursor: null } },
    ]);
    const p = new Paginator<number>(
      http,
      { path: "/x" },
      { onPage: (_pg, idx) => seenIndices.push(idx) },
    );
    await p.collect();
    expect(seenIndices).toEqual([0, 1]);
  });

  it("pages() yields envelopes", async () => {
    const { http } = build([
      { status: 200, body: { items: [1, 2], nextCursor: "c2" } },
      { status: 200, body: { items: [3], nextCursor: null } },
    ]);
    const p = new Paginator<number>(http, { path: "/x" });
    const envs = [];
    for await (const env of p.pages()) envs.push(env);
    expect(envs).toHaveLength(2);
    expect(envs[0]!.items).toEqual([1, 2]);
  });
});
