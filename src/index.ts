export { NayaxLynxClient } from "./client.js";
export {
  ENVIRONMENTS,
  DEFAULT_RETRY,
  resolveConfig,
} from "./config.js";
export type {
  AuthConfig,
  NayaxEnvironment,
  NayaxLynxConfig,
  ResolvedConfig,
  RetryConfig,
} from "./config.js";

export { HttpClient } from "./http/http-client.js";
export type { RequestOptions } from "./http/http-client.js";

export {
  NayaxError,
  NayaxAuthError,
  NayaxRateLimitError,
  NayaxNetworkError,
  NayaxTimeoutError,
  NayaxWebhookSignatureError,
} from "./http/errors.js";

export { TokenManager } from "./auth/index.js";
export type { BearerToken } from "./auth/index.js";

export { Paginator } from "./pagination/paginator.js";
export type { PaginateOptions } from "./pagination/paginator.js";
export { OffsetPaginator } from "./pagination/offset-paginator.js";
export type { OffsetPaginatorOptions } from "./pagination/offset-paginator.js";
export { PagePaginator } from "./pagination/page-paginator.js";
export type { PagePaginatorOptions } from "./pagination/page-paginator.js";

export {
  MachinesResource,
  MachineAttributesResource,
  CardsResource,
  DevicesResource,
  EReceiptResource,
  LookupsResource,
  MachineInventoryResource,
  MachineProductsResource,
  MetadataResource,
  ProductsResource,
  ProductGroupsResource,
  SignInResource,
  TransactionsResource,
  TelemetryResource,
  InventoryResource,
} from "./resources/index.js";
export type {
  ListMachinesFilters,
  ListMachinesOptions,
  ListDevicesOptions,
} from "./resources/index.js";

export {
  getTransactionsByMachine,
  getMachineTelemetry,
  updateInventory,
  iterateAllMachines,
} from "./helpers/index.js";
export type {
  GetTransactionsByMachineOptions,
  ResourcesBundle,
} from "./helpers/index.js";

export { parseWebhook, verifyWebhookSignature } from "./webhooks/index.js";
export type {
  ParseWebhookOptions,
  VerifySignatureOptions,
} from "./webhooks/index.js";

export * from "./types/index.js";
