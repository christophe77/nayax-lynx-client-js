import { vi } from "vitest";

export interface MockCall {
  url: string;
  init: RequestInit;
}

export interface MockResponseSpec {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** If set, throw this instead of returning a response (simulate network error). */
  throw?: unknown;
  /** Delay (ms) before resolving — useful for race-condition tests. */
  delayMs?: number;
}

/**
 * Build a fetch mock that returns canned responses in order.
 * After the queue is empty, further calls fail loudly.
 */
export function makeFetchMock(queue: MockResponseSpec[]) {
  const calls: MockCall[] = [];
  const remaining = [...queue];
  const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
    calls.push({ url: u, init: init ?? {} });
    const spec = remaining.shift();
    if (!spec) {
      throw new Error(`unexpected fetch call (queue empty): ${u}`);
    }
    if (spec.delayMs) {
      const ac = init?.signal;
      await new Promise<void>((resolve, reject) => {
        if (ac?.aborted) {
          reject(ac.reason);
          return;
        }
        const t = setTimeout(resolve, spec.delayMs);
        ac?.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            reject(ac.reason);
          },
          { once: true },
        );
      });
    }
    if (spec.throw) throw spec.throw;
    const status = spec.status ?? 200;
    const headers = new Headers(spec.headers ?? {});
    let body: string | null;
    // 204/205/304 MUST have a null body per the Fetch spec — Response() throws otherwise.
    const isNullBodyStatus = status === 204 || status === 205 || status === 304;
    if (isNullBodyStatus || spec.body === undefined || spec.body === null) {
      body = null;
    } else if (typeof spec.body === "string") {
      body = spec.body;
    } else {
      body = JSON.stringify(spec.body);
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
    }
    return new Response(body, { status, headers });
  });
  return { fetch: fetchMock as unknown as typeof fetch, calls, remaining };
}
