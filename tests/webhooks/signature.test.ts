import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { NayaxWebhookSignatureError } from "../../src/http/errors.js";
import { verifyWebhookSignature } from "../../src/webhooks/signature.js";

const SECRET = "whsec_test_secret";
const PAYLOAD = '{"id":"evt_1","type":"transaction.completed","data":{}}';

function stripeHeader(payload: string, secret: string, ts: number): string {
  const signed = `${ts}.${payload}`;
  const sig = createHmac("sha256", secret).update(signed).digest("hex");
  return `t=${ts},v1=${sig}`;
}

describe("verifyWebhookSignature — stripe scheme", () => {
  it("verifies a valid signature", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = stripeHeader(PAYLOAD, SECRET, ts);
    const got = verifyWebhookSignature({
      payload: PAYLOAD,
      signatureHeader: header,
      secret: SECRET,
    });
    expect(got).toBe(ts);
  });

  it("supports multiple v1 entries, valid if any matches", () => {
    const ts = Math.floor(Date.now() / 1000);
    const validSig = createHmac("sha256", SECRET).update(`${ts}.${PAYLOAD}`).digest("hex");
    const header = `t=${ts},v1=deadbeef${"0".repeat(56)},v1=${validSig}`;
    expect(
      verifyWebhookSignature({ payload: PAYLOAD, signatureHeader: header, secret: SECRET }),
    ).toBe(ts);
  });

  it("rejects an expired timestamp", () => {
    const ts = Math.floor(Date.now() / 1000) - 1000;
    const header = stripeHeader(PAYLOAD, SECRET, ts);
    expect(() =>
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: header,
        secret: SECRET,
        toleranceSec: 300,
      }),
    ).toThrow(NayaxWebhookSignatureError);
  });

  it("ignores timestamp check when toleranceSec=0", () => {
    const ts = Math.floor(Date.now() / 1000) - 10_000;
    const header = stripeHeader(PAYLOAD, SECRET, ts);
    expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: header,
        secret: SECRET,
        toleranceSec: 0,
      }),
    ).toBe(ts);
  });

  it("rejects a tampered payload", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = stripeHeader(PAYLOAD, SECRET, ts);
    expect(() =>
      verifyWebhookSignature({
        payload: PAYLOAD + " ",
        signatureHeader: header,
        secret: SECRET,
      }),
    ).toThrow(/mismatch/);
  });

  it("rejects a header without t=", () => {
    const sig = createHmac("sha256", SECRET).update(`0.${PAYLOAD}`).digest("hex");
    expect(() =>
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: `v1=${sig}`,
        secret: SECRET,
      }),
    ).toThrow(/timestamp/);
  });

  it("rejects a header without v1", () => {
    const ts = Math.floor(Date.now() / 1000);
    expect(() =>
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: `t=${ts}`,
        secret: SECRET,
      }),
    ).toThrow(/v1 entries/);
  });

  it("rejects an empty header", () => {
    expect(() =>
      verifyWebhookSignature({ payload: PAYLOAD, signatureHeader: "", secret: SECRET }),
    ).toThrow(/Missing signature/);
  });

  it("rejects an empty secret", () => {
    expect(() =>
      verifyWebhookSignature({ payload: PAYLOAD, signatureHeader: "t=1,v1=00", secret: "" }),
    ).toThrow(/Missing webhook secret/);
  });
});

describe("verifyWebhookSignature — raw-hex scheme", () => {
  it("verifies the hex digest", () => {
    const sig = createHmac("sha256", SECRET).update(PAYLOAD).digest("hex");
    expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: sig,
        secret: SECRET,
        scheme: "raw-hex",
      }),
    ).toBeNull();
  });

  it("rejects a bad hex digest", () => {
    expect(() =>
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: "00".repeat(32),
        secret: SECRET,
        scheme: "raw-hex",
      }),
    ).toThrow(/mismatch/);
  });
});

describe("verifyWebhookSignature — raw-base64 scheme", () => {
  it("verifies the base64 digest", () => {
    const sig = createHmac("sha256", SECRET).update(PAYLOAD).digest("base64");
    expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: sig,
        secret: SECRET,
        scheme: "raw-base64",
      }),
    ).toBeNull();
  });
});

describe("verifyWebhookSignature — algorithm override", () => {
  it("works with sha512", () => {
    const sig = createHmac("sha512", SECRET).update(PAYLOAD).digest("hex");
    expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signatureHeader: sig,
        secret: SECRET,
        scheme: "raw-hex",
        algorithm: "sha512",
      }),
    ).toBeNull();
  });
});
