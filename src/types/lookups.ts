/**
 * Types for the Lynx `Lookups` group (18 endpoints).
 * Source: https://devzone.nayax.com/reference/lynx/lookups
 */

export interface ActorType {
  ActorTypeID: number | null;
  ActorTypeName: string | null;
  LastUpdated: string | null;
  DefaultBit: boolean | null;
  CKey: string | null;
}

export interface LookupType {
  LutTypeID: number | null;
  LutTypeDescription: string | null;
  LastUpdated: string | null;
  LutTypeCode: string | null;
  CKey: string | null;
  RequiredLutCodeBit: boolean | null;
  LutStatus: number | null;
  LinkedLutTypeId: number | null;
}

export interface MachineModelsDbEntity {
  MachineModelID: number | null;
  MachineTypeID: number | null;
  ProviderID: number | null;
  ProtocolTypeID: number | null;
  LastUpdated: string | null;
  MachineModelName: string | null;
  ActorID: number | null;
  CreationDateTime: string | null;
  CreatedBy: number | null;
  UpdatedBy: number | null;
  MachineModelStatus: number | null;
}

export interface Lookup {
  /** Read-only reference string. */
  LutTypeRef?: string | null;
  LutID: number | null;
  LutTypeID: number | null;
  LutValue: string | null;
  LastUpdated: string | null;
  OrderKey: number | null;
  LutCode: number | null;
  /** Note casing: `Ckey` (lowercase k) here vs `CKey` on most other types. */
  Ckey: string | null;
  ServiceLutId: number | null;
  CreatedDT: string | null;
  /** Field name from upstream (likely a typo for `CreatedBy`). */
  CreatedBT: number | null;
  UpdatedBy: number | null;
  LinkedLutId: number | null;
}

export interface TimeZoneInfo {
  TimeZoneKey: number | null;
  TimeZoneID: string | null;
  TimeZoneDisplayName: string | null;
  TimeZoneStandardName: string | null;
  TimeZoneDayLightName: string | null;
  TimeZoneOffset: number | null;
  CreatedDate: string | null;
  LastUpdated: string | null;
  DaylightSavingsBit: boolean | null;
  Latitude: number | null;
  Longitude: number | null;
}

export interface CountryCodes {
  CountryID: number | null;
  CountryCode: string | null;
  CountryName: string | null;
  CountryDialingCode: number | null;
  CountryReference: number | null;
  CountryISONumericCode: number | null;
}

export interface Currency {
  CurrencyID: number | null;
  CurrencyCode: string | null;
  CurrencySign: string | null;
  LastUpdated: string | null;
  ShvaValue: string | null;
  ShvaCode: number | null;
  CurrencyISONumerical: string | null;
}

export interface BillingProvidersDbEntity {
  BillingProviderID: number | null;
  BillingProviderName: string | null;
  TerminalIDLength: number | null;
  BillingProviderComments: string | null;
  LastUpdated: string | null;
  /** Decimal as string per spec. */
  MinimumTransactionAmount: string | null;
  RegularAuthorizationBit: boolean | null;
  CancelAuthorizationBit: boolean | null;
  PreSelectionBit: boolean | null;
  TransactionVoidBit: boolean | null;
  ECommerceTransactionsBit: boolean | null;
  ForcedTransactionsBit: boolean | null;
  ConstantPreAuthorizationBit: boolean | null;
  /** Per spec this is an int32, not a boolean. */
  EMVTransactionsBit: number | null;
  AutomaticTransactionVoidBit: boolean | null;
  ForceSettlementBit: boolean | null;
  OfflineEMVTransactionsBit: boolean | null;
  SettlementRetryBit: boolean | null;
  AutomaticRefund: boolean | null;
  PartialRefundSupport: boolean | null;
  CKey: string | null;
  SupportReconciliation: boolean | null;
  ReconciliationTimeZoneKey: number | null;
  ReconciliationSourceType: string | null;
  SupportIncrementalAuth: boolean | null;
}

export interface PaymentMethodDbEntity {
  PaymentMethodID: number | null;
  PaymentMethodDescription: string | null;
  LastUpdated: string | null;
  PrepaidPaymentBit: boolean | null;
  /** Per spec this is an int32, not a boolean. */
  PreselectionSupportBit: number | null;
  TransactionBlockDuration: number | null;
  AutomaticVoidBit: boolean | null;
  CKey: string | null;
  ExternalPrepaidBit: boolean | null;
  MobileApplicationBit: boolean | null;
  QRPaymentSupportBit: boolean | null;
  ForceSettlementSupportBit: boolean | null;
}

/** Used for both `/v1/states` and `/v1/regions`. */
export interface RegionsDbEntity {
  RegionID: number | null;
  RegionName: string | null;
  ShortRegion: string | null;
  CountryID: number | null;
}

export interface CitiesDbEntity {
  CityID: number | null;
  CityName: string | null;
  ShortCity: string | null;
  RegionID: number | null;
  CountryID: number | null;
}

export interface GroupsDbEntity {
  RoleGroupID: number | null;
  RoleGroupName: string | null;
  UpdatedDT: string | null;
  ManagedByAdminBit: boolean | null;
}

export interface RolesDbEntity {
  RoleID: number | null;
  RoleName: string | null;
  UpdatedDT: string | null;
  CKey: string | null;
  IsActive: boolean | null;
  IsAdminBit: boolean | null;
}
