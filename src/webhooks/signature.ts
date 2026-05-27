import { createHmac, timingSafeEqual } from "node:crypto";
import { NayaxWebhookSignatureError } from "../http/errors.js";

export interface VerifySignatureOptions {
  /** Raw request body as received (exact bytes/string used by the sender). */
  payload: string | Uint8Array;
  /** Value of the signature header (e.g. `t=1700000000,v1=abcdef...`). */
  signatureHeader: string;
  /** Shared secret configured on the Nayax webhook subscription. */
  secret: string;
  /**
   * Allowed clock drift between the signed timestamp and `now`, in seconds.
   * Default: 300 (5 min). Set 0 to disable the timestamp check.
   */
  toleranceSec?: number;
  /** Override for the current time (ms epoch). */
  now?: number;
  /** HMAC algorithm. Default: sha256. */
  algorithm?: "sha256" | "sha1" | "sha512";
  /**
   * Header scheme:
   *  - `"stripe"` (default): comma-separated `t=<unix>,v1=<hex>` pairs.
   *  - `"raw-hex"`: header is the hex digest, no timestamp.
   *  - `"raw-base64"`: header is the base64 digest, no timestamp.
   */
  scheme?: "stripe" | "raw-hex" | "raw-base64";
}

/**
 * Verify a Nayax webhook signature.
 *
 * Throws {@link NayaxWebhookSignatureError} on any verification failure
 * (missing header, expired timestamp, bad signature).
 *
 * Returns the parsed timestamp (seconds, or null if scheme has none) on success.
 *
 * NOTE: the exact signature header format used by Lynx may differ — most Nayax
 * webhook integrations use either a raw hex digest of HMAC-SHA256(body, secret)
 * or a Stripe-style scheme. Pick the matching `scheme` for your tenant.
 */
export function verifyWebhookSignature(opts: VerifySignatureOptions): number | null {
  const scheme = opts.scheme ?? "stripe";
  const algorithm = opts.algorithm ?? "sha256";
  const tolerance = opts.toleranceSec ?? 300;
  const now = opts.now ?? Date.now();

  if (!opts.signatureHeader) {
    throw new NayaxWebhookSignatureError("Missing signature header");
  }
  if (!opts.secret) {
    throw new NayaxWebhookSignatureError("Missing webhook secret");
  }

  const payloadBuf =
    typeof opts.payload === "string"
      ? Buffer.from(opts.payload, "utf8")
      : Buffer.from(opts.payload);

  if (scheme === "stripe") {
    const parsed = parseStripeHeader(opts.signatureHeader);
    if (parsed.timestamp === null) {
      throw new NayaxWebhookSignatureError("Signature header missing timestamp");
    }
    if (parsed.signatures.length === 0) {
      throw new NayaxWebhookSignatureError("Signature header missing v1 entries");
    }
    if (tolerance > 0) {
      const ageSec = Math.abs(now / 1000 - parsed.timestamp);
      if (ageSec > tolerance) {
        throw new NayaxWebhookSignatureError(
          `Signature timestamp outside tolerance (${Math.round(ageSec)}s > ${tolerance}s)`,
        );
      }
    }
    const signedPayload = Buffer.concat([
      Buffer.from(`${parsed.timestamp}.`, "utf8"),
      payloadBuf,
    ]);
    const expected = createHmac(algorithm, opts.secret).update(signedPayload).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const ok = parsed.signatures.some((sig) => {
      const sigBuf = safeFromHex(sig);
      return sigBuf !== null && sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    });
    if (!ok) throw new NayaxWebhookSignatureError("Signature mismatch");
    return parsed.timestamp;
  }

  // raw-hex or raw-base64
  const digest = createHmac(algorithm, opts.secret).update(payloadBuf);
  const expectedBuf =
    scheme === "raw-hex"
      ? Buffer.from(digest.digest("hex"), "hex")
      : digest.digest();
  const providedBuf =
    scheme === "raw-hex"
      ? safeFromHex(opts.signatureHeader.trim())
      : safeFromBase64(opts.signatureHeader.trim());
  if (providedBuf === null || providedBuf.length !== expectedBuf.length) {
    throw new NayaxWebhookSignatureError("Signature mismatch");
  }
  if (!timingSafeEqual(providedBuf, expectedBuf)) {
    throw new NayaxWebhookSignatureError("Signature mismatch");
  }
  return null;
}

interface ParsedStripeHeader {
  timestamp: number | null;
  signatures: string[];
}

function parseStripeHeader(header: string): ParsedStripeHeader {
  const out: ParsedStripeHeader = { timestamp: null, signatures: [] };
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === "t") {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) out.timestamp = n;
    } else if (k === "v1") {
      out.signatures.push(v);
    }
  }
  return out;
}

function safeFromHex(s: string): Buffer | null {
  if (!/^[0-9a-fA-F]*$/.test(s) || s.length % 2 !== 0) return null;
  return Buffer.from(s, "hex");
}

function safeFromBase64(s: string): Buffer | null {
  try {
    const b = Buffer.from(s, "base64");
    // Round-trip check: base64 of buffer should be lossless.
    if (b.toString("base64").replace(/=+$/, "") !== s.replace(/=+$/, "")) return null;
    return b;
  } catch {
    return null;
  }
}
