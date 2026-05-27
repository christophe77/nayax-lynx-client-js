import { describe, expect, it, vi } from "vitest";
import { TokenManager } from "../../src/auth/token-manager.js";
import { resolveConfig } from "../../src/config.js";
import { NayaxAuthError } from "../../src/http/errors.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

function buildClientCreds(queue: Parameters<typeof makeFetchMock>[0]) {
  const { fetch, calls } = makeFetchMock(queue);
  const cfg = resolveConfig({
    baseUrl: "https://auth.test.example",
    auth: { type: "client_credentials", clientId: "cid", clientSecret: "csec" },
    fetch,
    tokenRefreshLeewaySec: 5,
  });
  return { tokens: new TokenManager(cfg), calls };
}

describe("TokenManager — static auth", () => {
  it("returns the token without any HTTP call", async () => {
    const cfg = resolveConfig({
      baseUrl: "https://x.test",
      auth: { type: "static", token: "ABC" },
      fetch: vi.fn() as unknown as typeof fetch,
    });
    const t = await new TokenManager(cfg).getToken();
    expect(t.headerName).toBe("Authorization");
    expect(t.headerValue).toBe("Bearer ABC");
    expect(t.expiresAt).toBeNull();
  });

  it("honours raw + custom header", async () => {
    const cfg = resolveConfig({
      baseUrl: "https://x.test",
      auth: { type: "static", token: "ABC", raw: true, headerName: "X-API-Key" },
      fetch: vi.fn() as unknown as typeof fetch,
    });
    const t = await new TokenManager(cfg).getToken();
    expect(t.headerName).toBe("X-API-Key");
    expect(t.headerValue).toBe("ABC");
  });
});

describe("TokenManager — client_credentials", () => {
  it("fetches a token and sends grant_type=client_credentials", async () => {
    const { tokens, calls } = buildClientCreds([
      { status: 200, body: { access_token: "TOK", expires_in: 3600, token_type: "bearer" } },
    ]);
    const t = await tokens.getToken();
    expect(t.headerValue).toBe("Bearer TOK");
    expect(t.expiresAt).toBeGreaterThan(Date.now());
    expect(calls).toHaveLength(1);
    const body = calls[0]!.init.body as string;
    expect(body).toContain("grant_type=client_credentials");
    expect(body).toContain("client_id=cid");
    expect(body).toContain("client_secret=csec");
    expect((calls[0]!.init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
  });

  it("caches the token across calls", async () => {
    const { tokens, calls } = buildClientCreds([
      { status: 200, body: { access_token: "TOK", expires_in: 3600 } },
    ]);
    await tokens.getToken();
    await tokens.getToken();
    await tokens.getToken();
    expect(calls).toHaveLength(1);
  });

  it("refreshes when forceRefresh=true", async () => {
    const { tokens, calls } = buildClientCreds([
      { status: 200, body: { access_token: "A", expires_in: 3600 } },
      { status: 200, body: { access_token: "B", expires_in: 3600 } },
    ]);
    const t1 = await tokens.getToken();
    const t2 = await tokens.getToken(true);
    expect(t1.headerValue).toBe("Bearer A");
    expect(t2.headerValue).toBe("Bearer B");
    expect(calls).toHaveLength(2);
  });

  it("invalidate() forces a fresh fetch on next call", async () => {
    const { tokens, calls } = buildClientCreds([
      { status: 200, body: { access_token: "A", expires_in: 3600 } },
      { status: 200, body: { access_token: "B", expires_in: 3600 } },
    ]);
    await tokens.getToken();
    tokens.invalidate();
    const t = await tokens.getToken();
    expect(t.headerValue).toBe("Bearer B");
    expect(calls).toHaveLength(2);
  });

  it("single-flight: concurrent getToken() de-duplicates", async () => {
    const { tokens, calls } = buildClientCreds([
      { status: 200, body: { access_token: "ONE", expires_in: 3600 }, delayMs: 30 },
    ]);
    const [a, b, c] = await Promise.all([tokens.getToken(), tokens.getToken(), tokens.getToken()]);
    expect(a.headerValue).toBe("Bearer ONE");
    expect(b.headerValue).toBe("Bearer ONE");
    expect(c.headerValue).toBe("Bearer ONE");
    expect(calls).toHaveLength(1);
  });

  it("refreshes when near expiry (within leeway)", async () => {
    const { tokens, calls } = buildClientCreds([
      // expires_in=1 -> 1000ms; leeway=5s -> already expiring
      { status: 200, body: { access_token: "A", expires_in: 1 } },
      { status: 200, body: { access_token: "B", expires_in: 3600 } },
    ]);
    const t1 = await tokens.getToken();
    const t2 = await tokens.getToken();
    expect(t1.headerValue).toBe("Bearer A");
    expect(t2.headerValue).toBe("Bearer B");
    expect(calls).toHaveLength(2);
  });

  it("throws NayaxAuthError on token endpoint failure", async () => {
    const { tokens } = buildClientCreds([
      { status: 401, body: { error: "invalid_client", error_description: "nope" } },
    ]);
    await expect(tokens.getToken()).rejects.toBeInstanceOf(NayaxAuthError);
  });

  it("uses sensible default expires_in when missing", async () => {
    const { tokens } = buildClientCreds([
      { status: 200, body: { access_token: "T" } },
    ]);
    const t = await tokens.getToken();
    expect(t.expiresAt).not.toBeNull();
    expect(t.expiresAt!).toBeGreaterThan(Date.now() + 60_000);
  });
});

describe("TokenManager — password + refresh_token", () => {
  it("uses refresh_token grant when a refresh token exists from prior fetch", async () => {
    const { fetch, calls } = makeFetchMock([
      { status: 200, body: { access_token: "A", refresh_token: "R1", expires_in: 1 } },
      { status: 200, body: { access_token: "B", refresh_token: "R2", expires_in: 3600 } },
    ]);
    const cfg = resolveConfig({
      baseUrl: "https://auth.test.example",
      auth: {
        type: "password",
        clientId: "cid",
        username: "u",
        password: "p",
      },
      fetch,
      tokenRefreshLeewaySec: 5,
    });
    const tokens = new TokenManager(cfg);
    await tokens.getToken();
    // Next call should trigger a refresh (token is "expiring")
    await tokens.getToken();
    expect(calls).toHaveLength(2);
    const body0 = calls[0]!.init.body as string;
    const body1 = calls[1]!.init.body as string;
    expect(body0).toContain("grant_type=password");
    expect(body0).toContain("username=u");
    expect(body1).toContain("grant_type=refresh_token");
    expect(body1).toContain("refresh_token=R1");
  });
});
