# nayax-lynx

TypeScript client for the **Nayax Lynx** API.

- Fully-typed surface — `MachineInfo` (~80 fields), `MachineStatusInfo`, `MachinePayment`, `MachineLastSale`, `MachineAlert`, `MachineChangeLog`, `MachineSearchResult`, `ApiResult` — all mirror the [Nayax devzone docs](https://devzone.nayax.com/reference/lynx/machines/get-specific-machine-basic-info.md) 1:1.
- 15 documented `machines` endpoints implemented (list, create, get/update by ID, lookup by device-serial / VPOS-serial, search, change logs, statistics, last alerts, last sales, payment-methods CRUD).
- 4 documented `machines.attributes` sub-resource endpoints (list, bulk update, reset to model defaults, resend current config).
- OAuth2 bearer with **auto-refresh + single-flight** to dedup concurrent refreshes.
- **Auto-pagination** as `AsyncIterable` (cursor or page/pageSize).
- **Retry** with exponential backoff + jitter on `429`/`5xx`/network; honors `Retry-After`.
- High-level helpers: `getTransactionsByMachine`, `getMachineTelemetry`, `updateInventory`.
- **Webhook** parsing + signature verification (HMAC-SHA256, Stripe-style or raw hex/base64).
- Environment presets: **prod** (`lynx.nayax.com`) / **qa** (`qa-lynx.nayax.com`).
- Node 20+, ESM only.

> **Confirmed vs inferred.**
> - **Confirmed** against the Nayax devzone docs: the entire `machines` surface (15 endpoints,
>   all schemas) plus the offset/limit pagination contract on `GET /v1/machines`.
> - **Inferred** (not yet validated): the `transactions`, `telemetry`, `inventory` resources
>   and the webhook signature scheme. They follow common Nayax patterns but the exact
>   paths/payloads may need adjustment when the matching docs are available.

## Install

```bash
npm install nayax-lynx
```

## Quickstart

```ts
import { NayaxLynxClient } from "nayax-lynx";

const lynx = new NayaxLynxClient({
  environment: "qa", // or "prod", or pass baseUrl directly
  auth: {
    type: "client_credentials",
    clientId: process.env.NAYAX_CLIENT_ID!,
    clientSecret: process.env.NAYAX_CLIENT_SECRET!,
  },
});

// Machines — fully-typed, confirmed against the docs.
const machine = await lynx.machines.get(12345);
await lynx.machines.update(12345, {
  MachineStatusBit: 1,          // required by the spec
  MachineName: "Renamed",
  Remarks: "Moved to lobby",
});

// Paginated list (offset/limit, server returns a bare array):
const allLobby = await lynx.machines.list({ MachineName: "Lobby", pageSize: 200 }).collect();
for await (const m of lynx.machines.list({})) {
  console.log(m.MachineID, m.MachineName);
}

// Lookups by alternate identifier:
await lynx.machines.getByDeviceSerial("DEV-001");
await lynx.machines.getByVposSerial("VPOS-42");

// Search / change logs / status / alerts / last sales:
await lynx.machines.search({ Search: "lobby" });
await lynx.machines.getChangeLogs({ MachineID: 12345, StartDate: "2026-05-01T00:00:00Z" });
const stats   = await lynx.machines.getStatistics(12345);
const alerts  = await lynx.machines.getLastAlerts(12345);
const sales   = await lynx.machines.getLastSales(12345);

// Machine attributes — sub-resource on machines:
const attrs = await lynx.machines.attributes.list(12345);
const bulk  = await lynx.machines.attributes.bulkUpdate(12345, [
  { DeviceAttributeID: 10, DeviceAttributeValue: "42" },
]);
if (!bulk.isFullySuccess) console.warn(bulk.failureItems);
await lynx.machines.attributes.resetToDefaults(12345);
await lynx.machines.attributes.resendConfig(12345);

// Payment methods (bulk array bodies):
await lynx.machines.getPaymentMethods(12345);
await lynx.machines.createPaymentMethods(12345, [{
  MachineID: 12345, PaymentMethodID: 1,
  ConvenienceFeeValue: 2.5, ConvenienceFeeBackupValue: 2.5,
  /* …rest nullable… */
} as any]);
await lynx.machines.deletePaymentMethod(12345, 1);

// Helper (inferred endpoint): all transactions for one machine in a date range, auto-paginated.
const txs = await lynx.getTransactionsByMachine(12345, {
  from: "2026-05-01T00:00:00Z",
  to:   "2026-05-24T00:00:00Z",
});

// Streaming with for-await (inferred — adjust if/when list spec arrives):
for await (const m of lynx.machines.list({ pageSize: 100 })) {
  console.log(m.MachineID, m.MachineName);
}

// Telemetry + planogram update (inferred endpoints):
const telemetry = await lynx.getMachineTelemetry(12345);
await lynx.updateInventory(12345, {
  machineId: 12345,
  slots: [
    { selection: "A1", productId: "p-cola-33", capacity: 12, currentQty: 8, price: "3.50" },
  ],
});
```

## Authentication

Three auth modes are supported:

```ts
// 1. OAuth2 client_credentials (machine-to-machine)
auth: { type: "client_credentials", clientId: "...", clientSecret: "..." }

// 2. OAuth2 password grant (uses refresh_token automatically after first call)
auth: { type: "password", clientId: "...", username: "...", password: "..." }

// 3. Static bearer / API key (no refresh)
auth: { type: "static", token: "..." }                            // sends "Authorization: Bearer ..."
auth: { type: "static", token: "...", raw: true, headerName: "X-API-Key" }
```

The token is fetched lazily, cached, and refreshed `tokenRefreshLeewaySec` seconds before expiry
(default 30 s). Concurrent calls during a refresh share the same in-flight request.

## Retry

```ts
new NayaxLynxClient({
  // ...
  retry: {
    maxRetries:    3,       // default
    initialDelayMs: 300,    // default
    maxDelayMs:    10_000,  // default
    factor:        2,       // default
    jitter:        0.25,    // ±25% jitter (default)
  },
});
```

Retries fire on `408`, `425`, `429`, and `5xx`, plus network/timeout errors. When the server
returns `Retry-After`, the delay is the **max** of the computed backoff and the suggested wait.

## Webhooks

```ts
import express from "express";
import { parseWebhook } from "nayax-lynx/webhooks";

app.post(
  "/webhooks/nayax",
  express.raw({ type: "application/json" }), // we need the raw body for signature
  (req, res) => {
    try {
      const event = parseWebhook({
        payload: req.body.toString("utf8"),
        verify: {
          secret: process.env.NAYAX_WEBHOOK_SECRET!,
          signatureHeader: req.header("x-nayax-signature") ?? "",
          // scheme: "stripe" (default) | "raw-hex" | "raw-base64"
        },
      });
      // dispatch on event.type ...
      res.sendStatus(202);
    } catch (err) {
      res.sendStatus(400);
    }
  },
);
```

`parseWebhook` returns a normalised envelope:

```ts
{ id, type, createdAt, machineId?, data }
```

The signature header format defaults to Stripe-style (`t=<unix>,v1=<hex>`); switch `scheme` if
your Nayax tenant publishes a raw hex/base64 HMAC instead.

## Escape hatch

Anything not covered by a resource module:

```ts
const data = await lynx.request<MyType>({
  method: "GET",
  path: "/some/new/endpoint",
  query: { foo: "bar" },
});
```

## Scripts

```
npm run build       # tsup -> dist/
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run test:coverage
```

## License

MIT
