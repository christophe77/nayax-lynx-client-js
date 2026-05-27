import type { AuthConfig, ResolvedConfig } from "../config.js";
import { NayaxAuthError } from "../http/errors.js";

export interface BearerToken {
  /** Header value to send, e.g. `Bearer eyJ...` or a raw API key. */
  headerValue: string;
  /** Header name to inject. */
  headerName: string;
  /** Unix epoch ms when this token expires; `null` means no expiry (static). */
  expiresAt: number | null;
  /** Optional refresh_token returned by the auth server. */
  refreshToken?: string;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Single-flight token manager. Holds the current bearer, refreshes it on
 * demand, and de-duplicates concurrent refresh requests so a burst of in-flight
 * API calls triggers exactly one token fetch.
 */
export class TokenManager {
  private current: BearerToken | null = null;
  private inflight: Promise<BearerToken> | null = null;

  constructor(private readonly cfg: ResolvedConfig) {}

  /** Force the next call to fetch a fresh token. */
  invalidate(): void {
    this.current = null;
  }

  /** Returns a valid token, refreshing if missing or near expiry. */
  async getToken(forceRefresh = false): Promise<BearerToken> {
    if (!forceRefresh && this.current && !this.isExpiringSoon(this.current)) {
      return this.current;
    }
    if (this.inflight) return this.inflight;
    this.inflight = this.fetchToken()
      .then((tok) => {
        this.current = tok;
        return tok;
      })
      .finally(() => {
        this.inflight = null;
      });
    return this.inflight;
  }

  private isExpiringSoon(tok: BearerToken): boolean {
    if (tok.expiresAt === null) return false;
    return Date.now() >= tok.expiresAt - this.cfg.tokenRefreshLeewaySec * 1000;
  }

  private async fetchToken(): Promise<BearerToken> {
    const auth = this.cfg.auth;
    if (auth.type === "static") {
      return {
        headerName: auth.headerName ?? "Authorization",
        headerValue: auth.raw ? auth.token : `Bearer ${auth.token}`,
        expiresAt: null,
      };
    }
    return this.fetchOAuthToken(auth);
  }

  private async fetchOAuthToken(
    auth: Extract<AuthConfig, { type: "client_credentials" | "password" }>,
  ): Promise<BearerToken> {
    const path = auth.tokenPath ?? "/oauth/token";
    const url = `${this.cfg.baseUrl}${path}`;
    const body = buildTokenForm(auth, this.current?.refreshToken);

    let res: Response;
    try {
      res = await this.cfg.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": this.cfg.userAgent,
        },
        body,
      });
    } catch (cause) {
      throw new NayaxAuthError("Token endpoint network error", { cause });
    }

    const text = await res.text();
    let json: OAuthTokenResponse | { error?: string; error_description?: string } | undefined;
    try {
      json = text ? (JSON.parse(text) as OAuthTokenResponse) : undefined;
    } catch {
      // leave json undefined; we'll fall through to error path
    }

    if (!res.ok || !json || !("access_token" in json) || !json.access_token) {
      const errPayload = json as
        | { error?: string; error_description?: string }
        | undefined;
      const desc = errPayload?.error_description ?? errPayload?.error ?? text;
      throw new NayaxAuthError(
        `Token request failed (${res.status}): ${desc || "no body"}`,
        { status: res.status, body: json ?? text },
      );
    }

    const data = json;
    const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
    const headerScheme = data.token_type ? capitalize(data.token_type) : "Bearer";

    const result: BearerToken = {
      headerName: "Authorization",
      headerValue: `${headerScheme} ${data.access_token}`,
      expiresAt: Date.now() + expiresIn * 1000,
    };
    if (data.refresh_token !== undefined) {
      result.refreshToken = data.refresh_token;
    }
    return result;
  }
}

function buildTokenForm(
  auth: Extract<AuthConfig, { type: "client_credentials" | "password" }>,
  refreshToken: string | undefined,
): string {
  const params = new URLSearchParams();
  if (refreshToken) {
    params.set("grant_type", "refresh_token");
    params.set("refresh_token", refreshToken);
    params.set("client_id", auth.clientId);
    if ("clientSecret" in auth && auth.clientSecret) {
      params.set("client_secret", auth.clientSecret);
    }
  } else if (auth.type === "client_credentials") {
    params.set("grant_type", "client_credentials");
    params.set("client_id", auth.clientId);
    params.set("client_secret", auth.clientSecret);
  } else {
    params.set("grant_type", "password");
    params.set("client_id", auth.clientId);
    if (auth.clientSecret) params.set("client_secret", auth.clientSecret);
    params.set("username", auth.username);
    params.set("password", auth.password);
  }
  if (auth.scope) params.set("scope", auth.scope);
  return params.toString();
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0]!.toUpperCase() + s.slice(1).toLowerCase();
}
