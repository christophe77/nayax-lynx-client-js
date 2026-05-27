import type { TokenManager } from "../auth/token-manager.js";
import type { ResolvedConfig } from "../config.js";
import {
  NayaxAuthError,
  NayaxError,
  NayaxNetworkError,
  NayaxRateLimitError,
  NayaxTimeoutError,
} from "./errors.js";
import { computeBackoffMs, isRetriableStatus, parseRetryAfter, sleep } from "./retry.js";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Path appended to the base URL. Absolute URLs are also accepted. */
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** JSON body (will be serialized + Content-Type set). */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Override per-request retry count. */
  maxRetries?: number;
  /** Override per-request timeout. */
  timeoutMs?: number;
}

export class HttpClient {
  constructor(
    private readonly cfg: ResolvedConfig,
    private readonly tokens: TokenManager,
  ) {}

  async request<T = unknown>(opts: RequestOptions): Promise<T> {
    const url = this.buildUrl(opts.path, opts.query);
    const maxRetries = opts.maxRetries ?? this.cfg.retry.maxRetries;
    const timeoutMs = opts.timeoutMs ?? this.cfg.timeoutMs;

    let lastError: unknown;
    // attempts is 0..maxRetries -> total tries = maxRetries + 1
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await this.singleAttempt(url, opts, timeoutMs);
        if (res.ok) {
          return (await parseBody(res)) as T;
        }
        // Handle 401 with a single forced refresh + retry (separate from backoff loop)
        if (res.status === 401 && attempt === 0 && this.cfg.auth.type !== "static") {
          this.tokens.invalidate();
          const retried = await this.singleAttempt(url, opts, timeoutMs);
          if (retried.ok) return (await parseBody(retried)) as T;
          if (!isRetriableStatus(retried.status)) {
            throw await buildErrorFromResponse(retried);
          }
          lastError = await buildErrorFromResponse(retried);
        } else if (isRetriableStatus(res.status)) {
          lastError = await buildErrorFromResponse(res);
        } else {
          throw await buildErrorFromResponse(res);
        }
      } catch (err) {
        if (err instanceof NayaxError && !isRetriable(err)) throw err;
        lastError = err;
      }

      if (attempt >= maxRetries) break;

      // Compute delay. If lastError is a NayaxRateLimitError with retryAfterSec, honor it.
      let delay = computeBackoffMs(attempt + 1, this.cfg.retry);
      if (lastError instanceof NayaxRateLimitError && typeof lastError.retryAfterSec === "number") {
        delay = Math.max(delay, lastError.retryAfterSec * 1000);
      }
      await sleep(delay, opts.signal);
    }

    throw lastError ?? new NayaxError("Request failed without explicit error");
  }

  private async singleAttempt(
    url: string,
    opts: RequestOptions,
    timeoutMs: number,
  ): Promise<Response> {
    const token = await this.tokens.getToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": this.cfg.userAgent,
      ...(opts.headers ?? {}),
      [token.headerName]: token.headerValue,
    };
    let body: string | undefined;
    if (opts.body !== undefined) {
      body = JSON.stringify(opts.body);
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const onExternalAbort = () => controller.abort(opts.signal?.reason);
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort(opts.signal.reason);
      else opts.signal.addEventListener("abort", onExternalAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(new NayaxTimeoutError(`Request timeout after ${timeoutMs}ms`)), timeoutMs);

    try {
      const init: RequestInit = {
        method: opts.method ?? "GET",
        headers,
        signal: controller.signal,
      };
      if (body !== undefined) init.body = body;
      return await this.cfg.fetch(url, init);
    } catch (cause) {
      if (controller.signal.aborted && controller.signal.reason instanceof NayaxTimeoutError) {
        throw controller.signal.reason;
      }
      if (cause instanceof NayaxError) throw cause;
      throw new NayaxNetworkError("Network request failed", { cause });
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    const isAbsolute = /^https?:\/\//i.test(path);
    const base = isAbsolute
      ? path
      : `${this.cfg.baseUrl}${joinPath(this.cfg.basePath, path)}`;
    if (!query) return base;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    if (!qs) return base;
    return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
  }
}

function joinPath(basePath: string, path: string): string {
  const left = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const right = path.startsWith("/") ? path : `/${path}`;
  return `${left}${right}`;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  }
  return await res.text();
}

async function buildErrorFromResponse(res: Response): Promise<NayaxError> {
  let body: unknown;
  try {
    body = await parseBody(res);
  } catch {
    body = undefined;
  }
  const requestId = res.headers.get("x-request-id") ?? undefined;
  const message = extractMessage(body) ?? `HTTP ${res.status}`;
  const opts: ConstructorParameters<typeof NayaxError>[1] = { status: res.status, body };
  if (requestId !== undefined) opts.requestId = requestId;

  if (res.status === 401 || res.status === 403) {
    return new NayaxAuthError(message, opts);
  }
  if (res.status === 429) {
    const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
    const rlOpts: ConstructorParameters<typeof NayaxRateLimitError>[1] = { ...opts };
    if (retryAfter !== null) rlOpts.retryAfterSec = retryAfter;
    return new NayaxRateLimitError(message, rlOpts);
  }
  return new NayaxError(message, opts);
}

function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.message === "string") return b.message;
  if (typeof b.error === "string") return b.error;
  if (typeof b.error_description === "string") return b.error_description;
  if (b.error && typeof b.error === "object") {
    const inner = b.error as Record<string, unknown>;
    if (typeof inner.message === "string") return inner.message;
  }
  return undefined;
}

function isRetriable(err: NayaxError): boolean {
  if (err instanceof NayaxRateLimitError) return true;
  if (err instanceof NayaxTimeoutError) return true;
  if (err instanceof NayaxNetworkError) return true;
  if (typeof err.status === "number") return isRetriableStatus(err.status);
  return false;
}
