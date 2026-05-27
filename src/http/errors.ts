export class NayaxError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly body?: unknown;
  readonly requestId?: string;

  constructor(
    message: string,
    opts: {
      status?: number;
      code?: string;
      body?: unknown;
      requestId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);
    this.name = "NayaxError";
    if (opts.status !== undefined) this.status = opts.status;
    if (opts.code !== undefined) this.code = opts.code;
    if (opts.body !== undefined) this.body = opts.body;
    if (opts.requestId !== undefined) this.requestId = opts.requestId;
  }
}

export class NayaxAuthError extends NayaxError {
  constructor(message: string, opts: ConstructorParameters<typeof NayaxError>[1] = {}) {
    super(message, opts);
    this.name = "NayaxAuthError";
  }
}

export class NayaxRateLimitError extends NayaxError {
  /** Seconds the server suggests waiting, parsed from Retry-After. */
  readonly retryAfterSec?: number;

  constructor(
    message: string,
    opts: ConstructorParameters<typeof NayaxError>[1] & { retryAfterSec?: number } = {},
  ) {
    super(message, opts);
    this.name = "NayaxRateLimitError";
    if (opts.retryAfterSec !== undefined) this.retryAfterSec = opts.retryAfterSec;
  }
}

export class NayaxNetworkError extends NayaxError {
  constructor(message: string, opts: ConstructorParameters<typeof NayaxError>[1] = {}) {
    super(message, opts);
    this.name = "NayaxNetworkError";
  }
}

export class NayaxTimeoutError extends NayaxError {
  constructor(message: string, opts: ConstructorParameters<typeof NayaxError>[1] = {}) {
    super(message, opts);
    this.name = "NayaxTimeoutError";
  }
}

export class NayaxWebhookSignatureError extends NayaxError {
  constructor(message: string) {
    super(message);
    this.name = "NayaxWebhookSignatureError";
  }
}
