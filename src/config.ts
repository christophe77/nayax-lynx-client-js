/**
 * Environment presets for Nayax Lynx.
 *
 * NOTE: only base hosts are presets here — the actual paths (`/oauth/token`,
 * `/operational/v1/...`) are defaults that can be overridden in {@link NayaxLynxConfig}.
 * Default `basePath` is `/operational`; resource methods prefix their paths with `/v1/...`.
 */
export const ENVIRONMENTS = {
  prod: "https://lynx.nayax.com",
  qa: "https://qa-lynx.nayax.com",
} as const;

export type NayaxEnvironment = keyof typeof ENVIRONMENTS;

export interface RetryConfig {
  /** Max retry attempts on retriable failures (429, 5xx, network). Default: 3. */
  maxRetries: number;
  /** Initial backoff in ms. Default: 300. */
  initialDelayMs: number;
  /** Cap on a single delay in ms. Default: 10000. */
  maxDelayMs: number;
  /** Multiplier per attempt. Default: 2. */
  factor: number;
  /** Random jitter ratio in [0, 1]. Default: 0.25 (±25%). */
  jitter: number;
}

export const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 300,
  maxDelayMs: 10_000,
  factor: 2,
  jitter: 0.25,
};

export type AuthConfig =
  | {
      type: "client_credentials";
      clientId: string;
      clientSecret: string;
      /** Optional scope string passed to the token endpoint. */
      scope?: string;
      /** Override of the token endpoint path. Default: `/oauth/token`. */
      tokenPath?: string;
    }
  | {
      type: "password";
      clientId: string;
      clientSecret?: string;
      username: string;
      password: string;
      scope?: string;
      tokenPath?: string;
    }
  | {
      /** Escape hatch — static bearer or API-key, no refresh. */
      type: "static";
      token: string;
      /** Header name. Default: `Authorization` (value will be `Bearer <token>`). */
      headerName?: string;
      /** If true, sends raw token without the `Bearer ` prefix. Default: false. */
      raw?: boolean;
    };

export interface NayaxLynxConfig {
  /** Preset environment, or pass `baseUrl` directly. */
  environment?: NayaxEnvironment;
  /** Explicit base URL — overrides `environment` if both are set. */
  baseUrl?: string;
  /**
   * Default base path prepended to resource paths.
   * Default: `/operational` (the surface that hosts the documented v1 endpoints).
   * Resource paths in this client begin with `/v1/...` so the assembled URL is
   * `<baseUrl>/operational/v1/...`. Override only if you target a different
   * Lynx surface (e.g. management).
   */
  basePath?: string;
  auth: AuthConfig;
  retry?: Partial<RetryConfig>;
  /** Request timeout in ms. Default: 30000. */
  timeoutMs?: number;
  /** User-Agent appended to requests. */
  userAgent?: string;
  /** Inject an alternative fetch (testing, proxy, etc.). */
  fetch?: typeof fetch;
  /**
   * Number of seconds before token expiry to trigger a refresh.
   * Default: 30.
   */
  tokenRefreshLeewaySec?: number;
}

export interface ResolvedConfig {
  baseUrl: string;
  basePath: string;
  auth: AuthConfig;
  retry: RetryConfig;
  timeoutMs: number;
  userAgent: string;
  fetch: typeof fetch;
  tokenRefreshLeewaySec: number;
}

export function resolveConfig(cfg: NayaxLynxConfig): ResolvedConfig {
  const baseUrl =
    cfg.baseUrl ??
    (cfg.environment ? ENVIRONMENTS[cfg.environment] : undefined);
  if (!baseUrl) {
    throw new Error(
      "NayaxLynxConfig: either `baseUrl` or `environment` must be provided.",
    );
  }
  return {
    baseUrl: stripTrailingSlash(baseUrl),
    basePath: cfg.basePath ?? "/operational",
    auth: cfg.auth,
    retry: { ...DEFAULT_RETRY, ...(cfg.retry ?? {}) },
    timeoutMs: cfg.timeoutMs ?? 30_000,
    userAgent: cfg.userAgent ?? "nayax-lynx-js/0.1.0",
    fetch: cfg.fetch ?? fetch,
    tokenRefreshLeewaySec: cfg.tokenRefreshLeewaySec ?? 30,
  };
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
