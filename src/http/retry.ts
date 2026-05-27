import type { RetryConfig } from "../config.js";

/**
 * Compute the delay (ms) before attempt `n` (1-indexed).
 * `n=1` is the delay before the *second* call (first retry).
 */
export function computeBackoffMs(
  attempt: number,
  cfg: RetryConfig,
  random: () => number = Math.random,
): number {
  const expo = cfg.initialDelayMs * Math.pow(cfg.factor, attempt - 1);
  const capped = Math.min(expo, cfg.maxDelayMs);
  // Symmetric jitter: ±(capped * jitter)
  const jitterMagnitude = capped * cfg.jitter;
  const offset = (random() * 2 - 1) * jitterMagnitude;
  return Math.max(0, Math.round(capped + offset));
}

/**
 * Parse a Retry-After header. Returns seconds or null if unparseable.
 * Supports both delta-seconds and HTTP-date.
 */
export function parseRetryAfter(value: string | null, now: number = Date.now()): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Math.max(0, parseInt(trimmed, 10));
  }
  const t = Date.parse(trimmed);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((t - now) / 1000));
}

export function isRetriableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status < 600);
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(signal!.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
