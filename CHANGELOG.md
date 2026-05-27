# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-05-27

Initial release.

### Added

- **135 documented Lynx endpoints** across 16 resources, all mirroring the
  [Nayax devzone docs](https://devzone.nayax.com/reference/lynx/) 1:1
  (PascalCase field names + upstream typos preserved):
  - `machines` (15 endpoints) + sub-resource `machines.attributes` (7 endpoints)
  - `devices` (4)
  - `ereceipt` (1)
  - `lookups` (18)
  - `metadata` (2)
  - `signIn` (2)
  - `machineInventory` (6) — pick lists, bins
  - `machineProducts` (5)
  - `products` (4)
  - `productGroups` (9) — incl. VAT/tax rows
  - `cards` (20) — v1 flat + v2 nested DTOs
  - `actors` (20) — v1 + v2, hierarchy, EV dashboard, encryption keys, machine groups, role groups
  - `scheduling` (16) — drivers, routes, route-machines, visit orders, machine tasks
  - `payment` (4) — refund workflow
  - `reports` (2) — dashboard widgets
- **OAuth2** auto-refresh `TokenManager` with single-flight de-duplication,
  supporting `client_credentials`, `password`+`refresh_token`, and static API-key.
- **3 pagination strategies** as `AsyncIterable<T>`:
  - `OffsetPaginator` (`ResultsLimit` / `ResultsOffset`) — used by `machines.list()`
  - `PagePaginator` (`pageNumber` / `pageSize` 1-indexed) — used by `devices.list()`
  - `Paginator` (cursor or page/totalPages) — generic
- **Retry** with exponential backoff + symmetric jitter on `408` / `425` / `429` /
  `5xx` + network/timeout errors. Honors `Retry-After` (delta-seconds and HTTP-date).
- **Forced refresh on 401** — exactly one retry with a fresh token per call.
- **Typed errors**: `NayaxError`, `NayaxAuthError`, `NayaxRateLimitError`,
  `NayaxNetworkError`, `NayaxTimeoutError`.
- Environment presets: `prod` (`lynx.nayax.com`) / `qa` (`qa-lynx.nayax.com`).
- Generic HMAC webhook helper (`nayax-lynx-client-js/webhooks`) shipping a
  timing-safe verifier with `stripe` / `raw-hex` / `raw-base64` signature schemes.
  Not tied to a Lynx feature — Lynx delivers events via Amazon SQS, not webhooks.
- **230 unit tests**, strict TypeScript (`noUncheckedIndexedAccess`).

### Notes

- Node 20+, ESM only, native `fetch`, zero runtime dependencies.
- `basePath` defaults to `/operational`; resource methods prefix paths with `/v1/...`.
