/**
 * Webhook envelope as published by Nayax Lynx.
 *
 * The Lynx webhook subscription system isn't documented with a single canonical
 * envelope across all event types — this shape is a sensible normalised form
 * the parser produces. The original `data` payload is preserved untouched.
 */
export type NayaxWebhookEventType =
  | "transaction.completed"
  | "transaction.refunded"
  | "machine.online"
  | "machine.offline"
  | "machine.alert"
  | "inventory.low"
  | string; // forward-compat: unknown event types pass through

export interface NayaxWebhookEvent<T = unknown> {
  /** Unique event id, used for idempotency on the consumer side. */
  id: string;
  type: NayaxWebhookEventType;
  /** ISO-8601 emission timestamp. */
  createdAt: string;
  /**
   * Machine id if the event is machine-scoped. Accepts string or number since
   * the wire format depends on the event source (Lynx int64 vs vendor strings).
   */
  machineId?: string | number;
  /** Vendor payload, kept as-is. */
  data: T;
}
