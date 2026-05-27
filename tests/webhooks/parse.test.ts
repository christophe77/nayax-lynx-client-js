import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { NayaxWebhookSignatureError } from "../../src/http/errors.js";
import { parseWebhook } from "../../src/webhooks/parse.js";

describe("parseWebhook", () => {
  it("parses a canonical envelope", () => {
    const payload = JSON.stringify({
      id: "evt_1",
      type: "transaction.completed",
      createdAt: "2026-05-24T08:00:00Z",
      machineId: "MID-1",
      data: { amount: 3.5 },
    });
    const ev = parseWebhook<{ amount: number }>({ payload });
    expect(ev.id).toBe("evt_1");
    expect(ev.type).toBe("transaction.completed");
    expect(ev.machineId).toBe("MID-1");
    expect(ev.data).toEqual({ amount: 3.5 });
  });

  it("normalises alternate key names", () => {
    const payload = JSON.stringify({
      event_id: "evt_2",
      event_type: "machine.offline",
      timestamp: "2026-05-24T09:00:00Z",
      mid: "MID-2",
      payload: { reason: "heartbeat" },
    });
    const ev = parseWebhook({ payload });
    expect(ev.id).toBe("evt_2");
    expect(ev.type).toBe("machine.offline");
    expect(ev.machineId).toBe("MID-2");
    expect(ev.data).toEqual({ reason: "heartbeat" });
  });

  it("falls back to the full body as `data` when neither data nor payload keys exist", () => {
    const payload = JSON.stringify({
      id: "evt_3",
      type: "inventory.low",
      foo: "bar",
    });
    const ev = parseWebhook({ payload });
    expect(ev.data).toMatchObject({ foo: "bar", type: "inventory.low" });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseWebhook({ payload: "{ not json" })).toThrow(
      NayaxWebhookSignatureError,
    );
  });

  it("throws on missing id", () => {
    const payload = JSON.stringify({ type: "x" });
    expect(() => parseWebhook({ payload })).toThrow(/event id/);
  });

  it("throws on missing type", () => {
    const payload = JSON.stringify({ id: "x" });
    expect(() => parseWebhook({ payload })).toThrow(/event type/);
  });

  it("verifies signature when `verify` is supplied", () => {
    const secret = "s";
    const body = JSON.stringify({ id: "1", type: "t", data: {} });
    const ts = Math.floor(Date.now() / 1000);
    const sig = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
    const header = `t=${ts},v1=${sig}`;
    const ev = parseWebhook({
      payload: body,
      verify: { secret, signatureHeader: header },
    });
    expect(ev.id).toBe("1");
  });

  it("rejects with bad signature before parsing", () => {
    const body = JSON.stringify({ id: "1", type: "t" });
    expect(() =>
      parseWebhook({
        payload: body,
        verify: { secret: "s", signatureHeader: "t=1,v1=00", toleranceSec: 0 },
      }),
    ).toThrow(NayaxWebhookSignatureError);
  });
});
