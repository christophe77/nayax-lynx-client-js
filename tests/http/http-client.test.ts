import { describe, expect, it } from "vitest";
import { TokenManager } from "../../src/auth/token-manager.js";
import { resolveConfig } from "../../src/config.js";
import {
  NayaxAuthError,
  NayaxError,
  NayaxRateLimitError,
  NayaxTimeoutError,
} from "../../src/http/errors.js";
import { HttpClient } from "../../src/http/http-client.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

function build(queue: Parameters<typeof makeFetchMock>[0], extra: Partial<Parameters<typeof resolveConfig>[0]> = {}) {
  const { fetch, calls } = makeFetchMock(queue);
  const config = resolveConfig({
    baseUrl: "https://api.test.example",
    auth: { type: "static", token: "T" },
    fetch,
    retry: { initialDelayMs: 1, maxDelayMs: 5, jitter: 0, factor: 2, maxRetries: 3 },
    ...extra,
  });
  const tokens = new TokenManager(config);
  const http = new HttpClient(config, tokens);
  return { http, calls, tokens, config };
}

describe("HttpClient.request — happy path", () => {
  it("returns JSON for 200", async () => {
    const { http, calls } = build([{ status: 200, body: { ok: true } }]);
    const res = await http.request<{ ok: boolean }>({ path: "/things" });
    expect(res).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://api.test.example/operational/things");
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer T");
  });

  it("returns undefined for 204", async () => {
    const { http } = build([{ status: 204 }]);
    const res = await http.request({ path: "/ping" });
    expect(res).toBeUndefined();
  });

  it("serialises body and sets Content-Type", async () => {
    const { http, calls } = build([{ status: 200, body: { id: "x" } }]);
    await http.request({ path: "/things", method: "POST", body: { a: 1 } });
    const init = calls[0]!.init;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("builds query strings, skipping undefined/null", async () => {
    const { http, calls } = build([{ status: 200, body: {} }]);
    await http.request({
      path: "/x",
      query: { a: 1, b: "two", c: undefined, d: null, e: false },
    });
    expect(calls[0]!.url).toBe("https://api.test.example/operational/x?a=1&b=two&e=false");
  });

  it("uses absolute URL when path is absolute", async () => {
    const { http, calls } = build([{ status: 200, body: {} }]);
    await http.request({ path: "https://other.example/raw" });
    expect(calls[0]!.url).toBe("https://other.example/raw");
  });
});

describe("HttpClient.request — error mapping", () => {
  it("throws NayaxError with parsed message for 4xx", async () => {
    const { http } = build([
      { status: 400, body: { message: "bad input" } },
    ]);
    await expect(http.request({ path: "/x" })).rejects.toMatchObject({
      name: "NayaxError",
      status: 400,
      message: "bad input",
    });
  });

  it("throws NayaxAuthError on 403", async () => {
    const { http } = build([{ status: 403, body: { error: "forbidden" } }]);
    await expect(http.request({ path: "/x" })).rejects.toBeInstanceOf(NayaxAuthError);
  });

  it("throws NayaxRateLimitError with retryAfterSec on 429", async () => {
    const { http } = build(
      [{ status: 429, headers: { "retry-after": "7" }, body: { message: "slow down" } }],
      { retry: { initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1, maxRetries: 0 } },
    );
    const err = await http.request({ path: "/x" }).catch((e) => e);
    expect(err).toBeInstanceOf(NayaxRateLimitError);
    expect((err as NayaxRateLimitError).retryAfterSec).toBe(7);
  });
});

describe("HttpClient.request — retry behaviour", () => {
  it("retries 503 then succeeds", async () => {
    const { http, calls } = build([
      { status: 503, body: { message: "down" } },
      { status: 200, body: { ok: 1 } },
    ]);
    const res = await http.request({ path: "/x" });
    expect(res).toEqual({ ok: 1 });
    expect(calls).toHaveLength(2);
  });

  it("gives up after maxRetries and surfaces last error", async () => {
    const { http, calls } = build([
      { status: 503, body: { message: "down" } },
      { status: 503, body: { message: "down" } },
      { status: 503, body: { message: "down" } },
      { status: 503, body: { message: "down" } }, // 1 initial + 3 retries
    ]);
    await expect(http.request({ path: "/x" })).rejects.toMatchObject({ status: 503 });
    expect(calls).toHaveLength(4);
  });

  it("does not retry 400-class (other than 408/425/429)", async () => {
    const { http, calls } = build([{ status: 404, body: { message: "nope" } }]);
    await expect(http.request({ path: "/x" })).rejects.toMatchObject({ status: 404 });
    expect(calls).toHaveLength(1);
  });

  it("retries network errors", async () => {
    const { http, calls } = build([
      { throw: new TypeError("network failure") },
      { status: 200, body: { ok: 1 } },
    ]);
    const res = await http.request({ path: "/x" });
    expect(res).toEqual({ ok: 1 });
    expect(calls).toHaveLength(2);
  });
});

describe("HttpClient.request — 401 forced refresh", () => {
  it("invalidates the token and retries once on 401", async () => {
    const { fetch, calls } = makeFetchMock([
      // token fetch
      { status: 200, body: { access_token: "A1", expires_in: 60 } },
      // first call 401
      { status: 401, body: { message: "expired" } },
      // refreshed token fetch
      { status: 200, body: { access_token: "A2", expires_in: 60 } },
      // retried call OK
      { status: 200, body: { ok: true } },
    ]);
    const config = resolveConfig({
      baseUrl: "https://api.test.example",
      auth: {
        type: "client_credentials",
        clientId: "id",
        clientSecret: "secret",
      },
      fetch,
      retry: { initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1, maxRetries: 0 },
    });
    const tokens = new TokenManager(config);
    const http = new HttpClient(config, tokens);
    const res = await http.request({ path: "/x" });
    expect(res).toEqual({ ok: true });
    expect(calls).toHaveLength(4);
    // the API calls used A1 then A2
    const auth1 = (calls[1]!.init.headers as Record<string, string>).Authorization;
    const auth2 = (calls[3]!.init.headers as Record<string, string>).Authorization;
    expect(auth1).toBe("Bearer A1");
    expect(auth2).toBe("Bearer A2");
  });
});

describe("HttpClient.request — timeout", () => {
  it("throws NayaxTimeoutError when the request takes too long", async () => {
    const { fetch } = makeFetchMock([{ status: 200, body: {}, delayMs: 50 }]);
    const config = resolveConfig({
      baseUrl: "https://api.test.example",
      auth: { type: "static", token: "T" },
      fetch,
      timeoutMs: 5,
      retry: { maxRetries: 0, initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1 },
    });
    const http = new HttpClient(config, new TokenManager(config));
    await expect(http.request({ path: "/slow" })).rejects.toBeInstanceOf(NayaxTimeoutError);
  });
});

describe("HttpClient.request — sanity", () => {
  it("NayaxError is the base class", () => {
    expect(new NayaxAuthError("x")).toBeInstanceOf(NayaxError);
    expect(new NayaxRateLimitError("x")).toBeInstanceOf(NayaxError);
  });
});
