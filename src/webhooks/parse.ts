import { NayaxWebhookSignatureError } from "../http/errors.js";
import type { NayaxWebhookEvent } from "../types/webhook.js";
import { verifyWebhookSignature, type VerifySignatureOptions } from "./signature.js";

export interface ParseWebhookOptions {
  /** Raw request body as a string. MUST be the exact bytes used to sign. */
  payload: string;
  /** Optional signature verification — pass to enforce it before parsing. */
  verify?: Omit<VerifySignatureOptions, "payload">;
}

/**
 * Parse + (optionally) verify a Nayax webhook. Returns a typed event envelope.
 *
 * If `verify` is provided, signature is checked first and a
 * {@link NayaxWebhookSignatureError} is thrown on failure.
 */
export function parseWebhook<T = unknown>(
  opts: ParseWebhookOptions,
): NayaxWebhookEvent<T> {
  if (opts.verify) {
    verifyWebhookSignature({ ...opts.verify, payload: opts.payload });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(opts.payload);
  } catch (cause) {
    throw new NayaxWebhookSignatureError(
      `Webhook payload is not valid JSON: ${(cause as Error).message}`,
    );
  }
  return normaliseEvent<T>(raw);
}

/**
 * Best-effort normalisation: Nayax events come in slightly different shapes
 * depending on the subscription type, so we map a few common keys into our
 * canonical envelope while preserving the original payload under `data`.
 */
function normaliseEvent<T>(raw: unknown): NayaxWebhookEvent<T> {
  if (!raw || typeof raw !== "object") {
    throw new NayaxWebhookSignatureError("Webhook payload must be a JSON object");
  }
  const r = raw as Record<string, unknown>;

  const id = pickString(r, ["id", "eventId", "event_id", "uuid"]);
  const type = pickString(r, ["type", "eventType", "event_type", "event"]);
  const createdAt =
    pickString(r, ["createdAt", "created_at", "timestamp", "eventTime"]) ??
    new Date().toISOString();
  const machineId =
    pickString(r, ["machineId", "machine_id", "midId", "mid", "deviceId"]);

  const data = (r.data ?? r.payload ?? r) as T;

  if (!id) {
    throw new NayaxWebhookSignatureError("Webhook payload missing event id");
  }
  if (!type) {
    throw new NayaxWebhookSignatureError("Webhook payload missing event type");
  }

  const out: NayaxWebhookEvent<T> = {
    id,
    type,
    createdAt,
    data,
  };
  if (machineId !== undefined) out.machineId = machineId;
  return out;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}
