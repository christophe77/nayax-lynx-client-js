import { describe, expect, it } from "vitest";
import {
  computeBackoffMs,
  isRetriableStatus,
  parseRetryAfter,
  sleep,
} from "../../src/http/retry.js";

const cfg = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 1000,
  factor: 2,
  jitter: 0,
};

describe("computeBackoffMs", () => {
  it("grows exponentially without jitter", () => {
    expect(computeBackoffMs(1, cfg)).toBe(100);
    expect(computeBackoffMs(2, cfg)).toBe(200);
    expect(computeBackoffMs(3, cfg)).toBe(400);
    expect(computeBackoffMs(4, cfg)).toBe(800);
  });

  it("respects the cap", () => {
    expect(computeBackoffMs(10, cfg)).toBe(1000);
  });

  it("applies symmetric jitter using the injected random", () => {
    const withJitter = { ...cfg, jitter: 0.5 };
    // random() = 0 => offset = -0.5*base
    expect(computeBackoffMs(1, withJitter, () => 0)).toBe(50);
    // random() = 1 => offset = +0.5*base
    expect(computeBackoffMs(1, withJitter, () => 1)).toBe(150);
    // random() = 0.5 => offset = 0
    expect(computeBackoffMs(1, withJitter, () => 0.5)).toBe(100);
  });

  it("never returns a negative value", () => {
    const aggressive = { ...cfg, jitter: 5 };
    expect(computeBackoffMs(1, aggressive, () => 0)).toBe(0);
  });
});

describe("parseRetryAfter", () => {
  it("parses delta-seconds", () => {
    expect(parseRetryAfter("12")).toBe(12);
    expect(parseRetryAfter("0")).toBe(0);
  });

  it("parses HTTP-date", () => {
    const now = Date.parse("2025-01-01T00:00:00Z");
    expect(parseRetryAfter("Wed, 01 Jan 2025 00:00:30 GMT", now)).toBe(30);
  });

  it("returns null on unparseable", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("garbage")).toBeNull();
  });
});

describe("isRetriableStatus", () => {
  it("flags 408/425/429 and 5xx", () => {
    expect(isRetriableStatus(408)).toBe(true);
    expect(isRetriableStatus(425)).toBe(true);
    expect(isRetriableStatus(429)).toBe(true);
    expect(isRetriableStatus(500)).toBe(true);
    expect(isRetriableStatus(503)).toBe(true);
  });
  it("does not flag 4xx other", () => {
    expect(isRetriableStatus(400)).toBe(false);
    expect(isRetriableStatus(401)).toBe(false);
    expect(isRetriableStatus(404)).toBe(false);
  });
});

describe("sleep", () => {
  it("respects AbortSignal", async () => {
    const ac = new AbortController();
    const p = sleep(1000, ac.signal);
    ac.abort(new Error("nope"));
    await expect(p).rejects.toThrow("nope");
  });

  it("resolves after the delay", async () => {
    const start = Date.now();
    await sleep(20);
    expect(Date.now() - start).toBeGreaterThanOrEqual(15);
  });
});
