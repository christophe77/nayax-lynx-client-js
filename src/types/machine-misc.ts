/**
 * Auxiliary machine-related response shapes from the Lynx operational v1 surface.
 * Field names are PascalCase to mirror the docs 1:1.
 */

/** Body for `POST /v1/machines/search`. All fields optional. */
export interface MachineSearchRequest {
  MachineID?: number | null;
  StatusID?: number | null;
  /** Search query string filtering machines by name or number. */
  Search?: string | null;
}

/** Result of `POST /v1/machines/search`. Different from `MachineInfo`. */
export interface MachineSearchResult {
  typeID: number | null;
  ID: string | null;
  parentID: string | null;
  /** Status flag (1 = disabled, 0 = enabled). */
  Disabled: number | null;
  Name: string | null;
}

/** Query for `GET /v1/machines/changeLogs`. */
export interface MachineChangeLogsQuery {
  ActorID?: number;
  StartDate?: string;
  EndDate?: string;
  MachineID?: number;
  /** Search window duration in seconds. */
  TimePeriod?: number;
  MachineNumber?: string;
}

export interface MachineChangeLog {
  MachineID: string | null;
  ChangedItem: string | null;
  ChangedFrom: string | null;
  ChangedTo: string | null;
  Tab: string | null;
  ChangedBy: string | null;
  UpdatedDt: string | null;
}

/** One alert returned by `GET /v1/machines/{MachineID}/lastAlerts`. */
export interface MachineAlert {
  MachineID: number | null;
  EventDateTimeVMC: string | null;
  EventDateTimeGMT: string | null;
  EventCode: number | null;
  EventLogID: number | null;
  EventDescription: string | null;
  EventCategoryName: string | null;
  EventGroupName: string | null;
  EventSourceName: string | null;
  SiteID: number | null;
  TransactionID: number | null;
  EventData: string | null;
  JSONData: string | null;
}

/** Operating hours entry referenced from `MachinePayment.PaymentMethodWorkingDays`. */
export interface WorkDay {
  /** Pass-through — not documented in the machines section. */
  [k: string]: unknown;
}

/**
 * Payment method binding for a machine.
 * Used by GET / POST / PUT `/v1/machines/{MachineID}/paymentMethods`.
 */
export interface MachinePayment {
  MachineID: number | null;
  PaymentMethodID: number | null;
  ConvenienceFeePercentageBit: boolean | null;
  ConvenienceFeeValue: number | null;
  LastUpdated: string | null;
  ExternalPaymentProviderUsername: string | null;
  ExternalPaymentProviderPassword: string | null;
  ExternalPaymentProviderTerminalID: string | null;
  ExternalPaymentProviderLocationIdentifier: string | null;
  PaymentMethodWorkingDays: WorkDay[] | null;
  PaymentMethodCustomData: string | null;
  ConvenienceFeeBackupValue: number | null;
  PaymentMethodQRString: string | null;
}

/** Last sale entry from `GET /v1/machines/{MachineID}/lastSales`. */
export interface MachineLastSale {
  TransactionID: number | null;
  PaymentServiceTransactionID: string | null;
  PaymentServiceProviderName: string | null;
  MachineID: number | null;
  MachineName: string | null;
  MachineNumber: string | null;
  InstituteLocationName: string | null;
  AuthorizationValue: number | null;
  SettlementValue: number | null;
  CurrencyCode: string | null;
  PaymentMethod: string | null;
  RecognitionMethod: string | null;
  CardNumber: string | null;
  CardBrand: string | null;
  CLI: string | null;
  ProductName: string | null;
  MultivendTransactionBit: boolean | null;
  MultivendNumberOfProducts: number | null;
  UnitOfMeasurement: string | null;
  Quantity: number | null;
  EnergyConsumed: number | null;
  AuthorizationDateTimeGMT: string | null;
  MachineAuthorizationTime: string | null;
  SettlementDateTimeGMT: string | null;
  SiteID: number | null;
  SiteName: string | null;
}

/**
 * Generic envelope returned by mutating endpoints that don't echo a resource
 * (e.g. DELETE payment method).
 */
export interface ApiResult {
  Ok: boolean;
  Message: string | null;
  SystemMessage: string | null;
  code: string | null;
}
