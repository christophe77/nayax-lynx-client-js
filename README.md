# nayax-lynx-client-js

Fully-typed TypeScript client for the **Nayax Operational Lynx API**.

- **135 documented endpoints** across **16 resources** — all mirroring the [Nayax devzone docs](https://devzone.nayax.com/reference/lynx/) 1:1 (PascalCase field names preserved, upstream typos preserved).
- **OAuth2** bearer with **auto-refresh + single-flight** to dedup concurrent refreshes. Supports `client_credentials`, `password`+`refresh_token`, and static API-key.
- **3 auto-pagination strategies** as `AsyncIterable`:
  - `OffsetPaginator` (`ResultsLimit` / `ResultsOffset`) — used by `machines.list()`
  - `PagePaginator` (`pageNumber` / `pageSize` 1-indexed) — used by `devices.list()`
  - `Paginator` (cursor or page/totalPages) — generic
- **Retry** with exponential backoff + symmetric jitter on `408` / `425` / `429` / `5xx` + network/timeout; honors `Retry-After`.
- **Typed errors**: `NayaxError`, `NayaxAuthError`, `NayaxRateLimitError`, `NayaxNetworkError`, `NayaxTimeoutError`, `NayaxWebhookSignatureError`.
- **Webhook** parsing + signature verification (HMAC-SHA256, Stripe-style or raw hex/base64), timing-safe comparison.
- Environment presets: **prod** (`lynx.nayax.com`) / **qa** (`qa-lynx.nayax.com`).
- **Node 20+, ESM only**, native `fetch`, zero runtime dependencies.
- **230 unit tests**, strict TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` off).

## Install

```bash
npm install nayax-lynx-client-js
```

## Resources covered

Every endpoint listed at `https://devzone.nayax.com/reference/lynx/` is implemented and typed.

| Resource | Endpoints | Access |
|---|---:|---|
| **Machines** | 15 | `client.machines.*` |
| **Machine Attributes** (sub-resource) | 7 | `client.machines.attributes.*` |
| **Devices** | 4 | `client.devices.*` |
| **EReceipt** | 1 | `client.ereceipt.*` |
| **Lookups** | 18 | `client.lookups.*` |
| **Metadata** | 2 | `client.metadata.*` |
| **Sign In** | 2 | `client.signIn.*` |
| **Machine Inventory** | 6 | `client.machineInventory.*` |
| **Machine Products** | 5 | `client.machineProducts.*` |
| **Products** | 4 | `client.products.*` |
| **Product Groups** | 9 | `client.productGroups.*` |
| **Cards** | 20 | `client.cards.*` |
| **Actors** | 20 | `client.actors.*` |
| **Scheduling** | 16 | `client.scheduling.*` |
| **Payment** (refund flow) | 4 | `client.payment.*` |
| **Reports** (dashboard widgets) | 2 | `client.reports.*` |

> **Confirmed vs inferred.** All 135 documented endpoints listed above are confirmed against
> devzone. The library also exposes legacy *inferred* helpers (`client.getTransactionsByMachine`,
> `client.getMachineTelemetry`, `client.updateInventory`) and *inferred* placeholder resources
> (`client.transactions`, `client.telemetry`, `client.inventory`) that pre-date the doc-driven
> implementation. Prefer the documented equivalents:
> - `getTransactionsByMachine` → `machines.getLastSales(id)`
> - `getMachineTelemetry` → `machines.getStatistics(id)`
> - `updateInventory` → `machineInventory.*` / `machineProducts.*`

## Quickstart

```ts
import { NayaxLynxClient } from "nayax-lynx-client-js";

const lynx = new NayaxLynxClient({
  environment: "qa", // or "prod", or pass baseUrl directly
  auth: {
    type: "client_credentials",
    clientId: process.env.NAYAX_CLIENT_ID!,
    clientSecret: process.env.NAYAX_CLIENT_SECRET!,
  },
});

// Single machine
const m = await lynx.machines.get(12345);
await lynx.machines.update(12345, {
  MachineStatusBit: 1,       // required by the spec
  MachineName: "Renamed",
  Remarks: "Moved to lobby",
});

// Paginated list (offset/limit, server returns a bare array)
for await (const m of lynx.machines.list({ MachineName: "Lobby", pageSize: 200 })) {
  console.log(m.MachineID, m.MachineName);
}
```

## Examples

### Machines

```ts
// Get / create / update
const machine = await lynx.machines.get(12345);
const created = await lynx.machines.create({ MachineStatusBit: 1, MachineName: "New" });
await lynx.machines.update(12345, { MachineStatusBit: 1, Remarks: "Updated" });

// Lookup by alternate identifier
await lynx.machines.getByDeviceSerial("DEV-001");
await lynx.machines.getByVposSerial("VPOS-42");

// Search, change logs, stats, alerts, sales
await lynx.machines.search({ Search: "lobby" });
await lynx.machines.getChangeLogs({ MachineID: 12345, StartDate: "2026-05-01T00:00:00Z" });
const stats  = await lynx.machines.getStatistics(12345); // MachineStatusInfo
const alerts = await lynx.machines.getLastAlerts(12345);
const sales  = await lynx.machines.getLastSales(12345);

// Payment methods (bulk array bodies)
await lynx.machines.getPaymentMethods(12345);
await lynx.machines.createPaymentMethods(12345, [/* MachinePayment[] */]);
await lynx.machines.deletePaymentMethod(12345, 1);
```

### Machine attributes (sub-resource)

```ts
const attrs = await lynx.machines.attributes.list(12345);
const bulk  = await lynx.machines.attributes.bulkUpdate(12345, [
  { DeviceAttributeID: 10, DeviceAttributeValue: "42" },
]);
if (!bulk.isFullySuccess) console.warn(bulk.failureItems);
await lynx.machines.attributes.resetToDefaults(12345);
await lynx.machines.attributes.resendConfig(12345);
await lynx.machines.attributes.insertOrUpdate([
  { MachineIds: [12345, 67890], Attributes: [{ Id: 10, Value: "42" }] },
]);
```

### Devices

```ts
// Page-based pagination (pageNumber/pageSize, 1-indexed, default page size 1000 server-side)
const all = await lynx.devices.list({ ActorId: 42, isConnected: true }).collect();
const dev = await lynx.devices.get(7);
await lynx.devices.update(7, { ActorID: 100, StatusID: 1 /* 1=Active, 2=Inactive */ });
await lynx.devices.moveToActor(555, ["DEV-001", "DEV-002"]);
```

### Cards

```ts
// v1 surface
const v1 = await lynx.cards.list({ CardEmail: "x@y.z" });
await lynx.cards.getByUniqueIdentifier("CUI-001");
const credit = await lynx.cards.getCredit("CUI-001");          // { value }
await lynx.cards.addCredit("CUI-001", { CardCredit: 10, CreditChangeRemarks: "manual" });
await lynx.cards.transferRevalue("CUI-A", "CUI-B", { CardCredit: 5 });
await lynx.cards.updateStatus("CUI-001", 1);                    // 1=Active, 2=Inactive
const txs = await lynx.cards.getLatestCreditCardTransactions("sha1Base64==", { minutes: 60 });

// v2 nested DTO surface
const card = await lynx.cards.createV2({
  CardDetails: { ActorID: 42, CardUniqueIdentifier: "CUI-NEW", Status: 1 },
  CardCreditAttributes: { Credit: 100 },
});
```

### Actors

```ts
const actor = await lynx.actors.get(42);
await lynx.actors.update(42, { ActorDescription: "Renamed" });
await lynx.actors.create(1, { ActorDescription: "Child", ActorCode: 1234 });
const v2 = await lynx.actors.createV2(1, {
  ActorDetails: {
    ActorCode: 12345, ActorTypeID: 7, StatusID: 1, CurrencyID: 1,
    TimeZoneKey: 35, CountryID: 250, CultureID: 6,
    GeoOverrideInheritanceBit: false, GeoZoom: 12, LanguageID: 8,
  },
});

// Hierarchy (recursive)
const tree = await lynx.actors.getHierarchy({ HierarchyLevelLimit: 3 });

// EV dashboard
const dashboard = await lynx.actors.getEvDashboard(42, { TimePeriod: 24 });

// Encryption keys (note the upstream typo "GenarateEncKey")
await lynx.actors.generateEncryptionKey(42);
const ok = await lynx.actors.decryptMessageByVersion(42, 3, "encrypted-blob");
```

### Lookups

```ts
const countries = await lynx.lookups.getCountries();
const usa       = await lynx.lookups.getCountryByCode("US");
const currencies = await lynx.lookups.getCurrencies();
const tzs       = await lynx.lookups.getTimeZones({ TimeZoneOffset: -5 });
const models    = await lynx.lookups.getMachineModels();
const states    = await lynx.lookups.getStates({ CountryID: 250 });
const cities    = await lynx.lookups.getCities({ CountryID: 250 });
const roles     = await lynx.lookups.getGroupRoles(11);
```

### Machine inventory & products

```ts
// Pick lists
const list = await lynx.machineInventory.getPickList(12345);
await lynx.machineInventory.createPickList(12345, {
  UseMinPick: true,
  AddEstimatedSales: "2026-06-01T00:00:00Z",
}); // returns 204
await lynx.machineInventory.setAllBinsFull(12345);
await lynx.machineInventory.emptyInventory(12345);

// Machine product CRUD
await lynx.machineProducts.list(12345);
await lynx.machineProducts.create(12345, [{ NayaxProductID: 1, CashPrice: 1.5 }]);
await lynx.machineProducts.bulkUpdate(12345, [/* MachineProductEntity[] */], { avoidDelete: true });
```

### Product catalog

```ts
// Products
await lynx.products.listByOperator(7);
const p = await lynx.products.get(999);
await lynx.products.update(999, { ProductName: "Renamed" });

// Product groups + VAT/tax rows
await lynx.productGroups.list();
await lynx.productGroups.listByActor(42);
const group = await lynx.productGroups.create({ ActorID: 42, ProductGroupName: "Snacks" });
await lynx.productGroups.createTax(group.ProductGroupID!, [{ CountryID: 250, TaxValue: 20 }]);
```

### Scheduling

```ts
// Drivers
const drivers = await lynx.scheduling.listDrivers({ ActorId: 42, Search: "Jane" });
const drv = await lynx.scheduling.addDriver({
  UserId: 100, OperatorId: 42, DriverLicense: "ABC123",
});

// Routes & route-machines
await lynx.scheduling.listRoutes({ OperatorId: 42 });
const route = await lynx.scheduling.createRoute(42, {
  RouteName: "Downtown", RouteCode: "DT-1",
  DriverId: drv.Id, RouteStatusId: 1,
});
await lynx.scheduling.assignMachinesToRoute(route.RouteId, {
  MachineIds: [12345, 67890],
});

// Visit orders + tasks
await lynx.scheduling.createVisitOrders([
  { MachineId: 12345, VisitDate: "2026-06-01T00:00:00Z", OrderKey: 1 },
]);
await lynx.scheduling.createMachineTasks([{
  MachineId: 12345, StatusId: 1,
  GeneratePickList: false, ScheduleNextWorkingDay: false,
  TimezoneOffset: 1.0,
}]);
```

### Payment (refund workflow)

```ts
await lynx.payment.requestRefund({
  RefundAmount: 3.5,
  RefundEmailList: "ops@example.com",
  RefundReason: "wrong item",
  TransactionId: 999, SiteId: 12,
  MachineAuTime: "2026-05-27T08:00:00Z",
});
await lynx.payment.uploadRefundDocumentation({
  FileName: "receipt.pdf",
  FileData: base64File,
  TransactionId: 999, SiteId: 12,
  MachineAuTime: "2026-05-27T08:00:00Z",
});
await lynx.payment.approveRefund({ /* … */ });
await lynx.payment.declineRefund({ /* … */ });
```

### Reports

```ts
const widgets = await lynx.reports.getAvailableWidgets({ screenTypeId: 1 });
const data = await lynx.reports.retrieveWidgetData({
  ScreenTypeId: 1, WidgetTypeId: 100, EntityId: 42,
  Filters: [{ Name: "startDate", Value: "2026-05-01", Type: "Date" }],
});
```

### EReceipt / Metadata / Sign In

```ts
await lynx.ereceipt.generate({
  TrasactionID: 999,  // (sic — typo'd in upstream spec)
  TransactionDateTime: "2026-05-27T08:00:00Z",
  TrasactionSiteID: 12, MachineID: 12345,
  Email: "buyer@example.com",
});

await lynx.metadata.getEventRules();
await lynx.metadata.uploadPicture({
  ImageTypeLutId: 5, Image: "data:image/png;base64,…", IsMonyx: false,
});

await lynx.signIn.userSignIn({ usr: "alice", pwd: "s3cret" });
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

The token is fetched lazily, cached, and refreshed `tokenRefreshLeewaySec` seconds before
expiry (default 30 s). Concurrent calls during a refresh share the same in-flight request
(single-flight). A 401 response triggers exactly one forced refresh + retry per call.

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
  timeoutMs: 30_000,        // per-request timeout (default)
});
```

Retries fire on `408`, `425`, `429`, and `5xx`, plus network/timeout errors. When the server
returns `Retry-After`, the delay is the **max** of the computed backoff and the suggested wait.

## Pagination

Three strategies, all implementing `AsyncIterable<T>` with `.collect()` and `.pages()`:

```ts
// Offset (used by machines.list)
for await (const m of lynx.machines.list({ MachineName: "x", pageSize: 200 })) { /* … */ }
const all = await lynx.machines.list({}).collect();

// Page-number (used by devices.list)
for await (const d of lynx.devices.list({ ActorId: 42, pageSize: 500 })) { /* … */ }

// Hard cap with maxItems on either
const top10 = await lynx.machines.list({ maxItems: 10 }).collect();
```

## Webhooks

```ts
import express from "express";
import { parseWebhook } from "nayax-lynx-client-js/webhooks";

app.post(
  "/webhooks/nayax",
  express.raw({ type: "application/json" }), // raw body is required for signature
  (req, res) => {
    try {
      const event = parseWebhook({
        payload: req.body.toString("utf8"),
        verify: {
          secret: process.env.NAYAX_WEBHOOK_SECRET!,
          signatureHeader: req.header("x-nayax-signature") ?? "",
          // scheme: "stripe" (default) | "raw-hex" | "raw-base64"
          // algorithm: "sha256" (default) | "sha1" | "sha512"
          // toleranceSec: 300 (default) — set 0 to disable timestamp check
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

`parseWebhook` returns a normalised envelope: `{ id, type, createdAt, machineId?, data }`.
Signature verification is timing-safe.

> The exact webhook signature scheme used by your Nayax tenant is not documented on devzone —
> defaults to Stripe-style `t=<unix>,v1=<hex>`. Switch `scheme` to `raw-hex` or `raw-base64` if
> needed.

## Errors

All thrown errors extend `NayaxError`. Discriminate with `instanceof`:

```ts
import {
  NayaxError, NayaxAuthError, NayaxRateLimitError,
  NayaxNetworkError, NayaxTimeoutError,
} from "nayax-lynx-client-js";

try {
  await lynx.machines.get(12345);
} catch (err) {
  if (err instanceof NayaxRateLimitError) {
    console.warn("retry after", err.retryAfterSec);
  } else if (err instanceof NayaxAuthError) {
    // 401/403
  } else if (err instanceof NayaxError) {
    console.error(err.status, err.requestId, err.body);
  }
}
```

## Escape hatch

For any endpoint not yet wrapped:

```ts
const data = await lynx.request<MyType>({
  method: "GET",
  path: "/v1/some/new/endpoint",   // joined onto baseUrl + basePath
  query: { foo: "bar" },
  headers: { "X-Custom": "1" },
  body: { /* JSON, auto-serialised */ },
});
```

You can also pass an absolute URL as `path` — it bypasses `basePath`.

## Configuration reference

```ts
new NayaxLynxClient({
  environment?: "prod" | "qa",     // sets baseUrl to lynx.nayax.com or qa-lynx.nayax.com
  baseUrl?: string,                // overrides environment
  basePath?: string,               // default: "/operational" (resources prefix /v1/...)
  auth: AuthConfig,                // required (see Authentication)
  retry?: Partial<RetryConfig>,
  timeoutMs?: number,              // default: 30000
  tokenRefreshLeewaySec?: number,  // default: 30
  userAgent?: string,              // default: "nayax-lynx-client-js/<version>"
  fetch?: typeof fetch,            // inject a custom fetch (proxy, mocks, etc.)
});
```

## Conformance notes

The wire format intentionally preserves several upstream quirks (do not "fix" them client-side):

- Typo'd field names: `TrasactionID`, `TrasactionSiteID` (ereceipt), `EvetnCategoryId` (metadata),
  `Hirarchy` (actors), `OverrideGeoInherritcanceBit`, `GeoLogitude`, `CreatedBT` (lookups).
- Typo'd endpoint paths: `GenarateEncKey`, `DecryptionMessageByVer` (actors).
- Double-prefixed path `/v1/metadata/v1/event-rules`.
- `Scheduling` capitalised in URLs vs lowercase elsewhere.
- `/v1/actor/{ActorID}/machineGroups` (singular) vs `/v1/actors/{ActorID}/roleGroups` (plural).
- `GET /signin` sits at `/operational/signin` (no `/v1/`).
- Cards expose both a flat v1 schema (`Cards`) and a nested v2 schema (`CardCreateDto` /
  `CardGetDto`).
- `Lookup.Ckey` (lowercase k) vs `CKey` everywhere else.
- `RegionsDbEntity` is shared between `/v1/states` and `/v1/regions`.

## Scripts

```
npm run build       # tsup -> dist/
npm run typecheck   # tsc --noEmit
npm test            # vitest run (230 tests)
npm run test:coverage
```

## License

MIT
