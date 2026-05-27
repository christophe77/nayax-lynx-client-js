/**
 * Types for the `Actors` group (20 endpoints, v1 + v2).
 * Source: https://devzone.nayax.com/reference/lynx/actors
 *
 * Several upstream typos are preserved on the wire:
 * - `Hirarchy` (instead of Hierarchy) in `ActorHirarchyDto`
 * - `OverrideGeoInherritcanceBit` (instead of Inheritance)
 * - `GeoLogitude` (instead of Longitude) in `ActorDetailsRequest`
 * - `GenarateEncKey` / `DecryptionMessageByVer` endpoint paths
 */

import type { WorkDay } from "./machine-misc.js";

// ─── v1 actor (flat) ───────────────────────────────────────────────────────

export interface Actors {
  ParentActorID: number | null;
  ActorID: number | null;
  ActorDescription: string | null;
  ActorCode: number | null;
  ActorAddress: string | null;
  ActorContact: string | null;
  ActorTypeID: number | null;
  ActorStatus: number | null;
  ActorHierarchyLevel: number | null;
  CurrencyID: number | null;
  LastUpdated: string | null;
  RouteManagerName: string | null;
  RouteManagerMobile: string | null;
  TimeZoneKey: number | null;
  DayLightSavingsBit: boolean | null;
  CountryID: number | null;
  DailyCCTransLimitPerCard: number | null;
  DailyPPTransLimitPerCard: number | null;
  DailyExternalPPTransLimitPerCard: number | null;
  DailyCCTransLimitPerCardPerOperator: number | null;
  OperatorActorID: number | null;
  DistributorActorID: number | null;
  AreaActorID: number | null;
  RouteActorID: number | null;
  ActorHierarchy: string | null;
  ActorHasChildrenBit: boolean | null;
  ActorHasMachinesBit: boolean | null;
  ActorImageURL: string | null;
  ActorContractInfo: string | null;
  ActorSQSID: number | null;
  UseProductGroupVATBit: boolean | null;
  EreceiptTransactionEndEnableBit: boolean | null;
  MaximumRevalueAmountLimit: number | null;
  ActorCreatedBy: number | null;
  ActorCreationDate: string | null;
  UpdateBy: number | null;
  CultureID: number | null;
  RevaluePayoutByDistributor: boolean | null;
  FiscalizationBit: boolean | null;
  GeoCountryID: number | null;
  GeoState: string | null;
  GeoCity: string | null;
  GeoAddress: string | null;
  GeoStreetNumber: string | null;
  GeoLongitude: number | null;
  GeoLatitude: number | null;
  GeoZipCode: string | null;
  GeoZoom: number | null;
  ActorLanguageID: number | null;
  /** Upstream marks this as string, not boolean. */
  ActorMerchantBit: string | null;
  ActorMerchantNameForDescriptor: string | null;
  /** Typo'd in upstream spec. */
  OverrideGeoInherritcanceBit: boolean | null;
  AirportID: number | null;
  VerticalCustomJSON: string | null;
  FiscalizationActorID: number | null;
  SupportIncrementalAuth: boolean | null;
  MaximumDefaultCredit: number | null;
  Refs: Record<string, string> | null;
}

/** Body for PUT /v1/actors/{ActorID} and POST /v1/actors/{ParentActorID}. */
export type ActorsDbEntity = Partial<Actors>;

// ─── v2 actor (nested) ─────────────────────────────────────────────────────

export interface ActorDetailsRequest {
  ActorDescription?: string | null;
  ActorCode: number;
  ActorContact?: string | null;
  ActorTypeID: number;
  StatusID: number;
  CurrencyID: number;
  TimeZoneKey: number;
  CountryID: number;
  CultureID: number;
  GeoOverrideInheritanceBit: boolean;
  GeoSearchAddress?: string | null;
  GeoCountryID?: number | null;
  GeoStateName?: string | null;
  GeoCityName?: string | null;
  GeoStreetName?: string | null;
  GeoStreetNumber?: string | null;
  /** Typo'd in upstream spec — should be `GeoLongitude`. */
  GeoLogitude?: number | null;
  GeoLatitude?: number | null;
  GeoZoom: number;
  GeoZipCode?: string | null;
  LanguageID: number;
  MCCCode?: string | null;
}

export interface ActorBillingGatewaysRequest {
  BillingProviderID: number;
  TerminalID: number;
  ShvaZField?: string | null;
  TransactionKey?: string | null;
  ZFieldAllowedBit: boolean;
  MerchantID?: string | null;
  SubMerchantID?: string | null;
  Username?: string | null;
  Password?: string | null;
  WithZipCodeBit: boolean;
  SupportForcedTransactionsBit: boolean;
  ForcedTransactionTerminalID?: number | null;
  AVSOnlyBit: boolean;
  PartialConfirmationBit: boolean;
  DisableDebitCards: boolean;
  DebitCardPrefix?: string | null;
  DisableMagStripeBit: boolean;
  FiscalBit: boolean;
  OverrideURL?: string | null;
  RemoteStartID: number;
  EnableMultiBillingProvidersBit: boolean;
  RuleSetID: number;
  CustomData?: Record<string, unknown> | null;
}

export interface ActorCreateRequest {
  ActorDetails: ActorDetailsRequest;
  ActorBillingGateways?: ActorBillingGatewaysRequest[];
  ActorBillingPlanID?: number;
}

export interface ActorCreateResponse {
  ParentActorID: number | null;
  ActorID: number;
  ActorDescription: string | null;
  ActorCode: number;
  ActorContact: string | null;
  ActorTypeID: number;
  ActorStatus: number;
  ActorHierarchyLevel: number;
  CurrencyID: number;
  LastUpdated: string;
  TimeZoneKey: number;
  CountryID: number;
  OperatorActorID: number | null;
  DistributorActorID: number | null;
  ActorHierarchy: string | null;
  ActorCreatedBy: number;
  ActorCreationDate: string;
  UpdateBy: number;
  CultureID: number;
  GeoCountryID: number | null;
  GeoState: string | null;
  GeoCity: string | null;
  GeoAddress: string | null;
  GeoStreetNumber: string | null;
  GeoLongitude: number | null;
  GeoLatitude: number | null;
  GeoZipCode: string | null;
  GeoZoom: number | null;
  ActorLanguageID: number;
  OverrideGeoInherritcanceBit: boolean | null;
}

// ─── Payment methods (actor-scoped) ────────────────────────────────────────

/** Returned by GET/PUT/POST /v1/actors/{ActorID}/paymentMethods. */
export interface ActorPaymentResponse {
  ActorID: number;
  PaymentMethodID: number;
  ExtraChargePercentageBit: boolean | null;
  ExtraChargeValue: number;
  LastUpdated: string | null;
  ExternalPaymentProviderURL: string | null;
  ExternalPaymentProviderID: number | null;
  ExternalPaymentProviderModeID: number | null;
  ExternalPaymentProviderUsername: string | null;
  ExternalPaymentProviderPassword: string | null;
  ExternalPaymentProviderMerchantID: string | null;
  ExternalPaymentProviderKey: string | null;
  ExternalPaymentProviderAppID: string | null;
  ExternalPaymentProviderCertificatePath: string | null;
  ExternalPaymentProviderCertificatePassword: string | null;
  ExternalPaymentProviderApiKey: string | null;
  ExternalPaymentProviderLocationIdentifier: string | null;
  PaymentMethodWorkingDays: WorkDay[] | null;
  PaymentMethodCustomData: string | null;
  ExtraChargeBackupValue: number;
  ChargeMachineID: number | null;
}

// ─── EV dashboard ──────────────────────────────────────────────────────────

export interface OperatorLevelAggregation {
  TotalOperatorMachines: number;
  TotalCommunicatingMachines: number;
  TotalActiveMachines: number;
  TotalSilentMachines: number;
}

export interface MachineLevelAggregation {
  UnitOfMeasure: string | null;
  UnitOfMeasureSymbol: string | null;
  NumberOfChargingSessions: number;
  NumberOfTransactionsForTimeInterval: number;
  SalesAmountForTimeInterval: number;
  TotalChargingSessionsDuration: number;
  TotalEnergyConsumption: number;
}

export interface EvMeterDashBoard {
  OperatorDashboard: OperatorLevelAggregation;
  MachineDashboard: MachineLevelAggregation;
  TimePeriod: number | null;
}

export interface EvDashboardQuery {
  StartDate?: string;
  EndDate?: string;
  MachineID?: number;
  TimePeriod?: number;
  MachineNumber?: string;
}

// ─── Encryption keys ───────────────────────────────────────────────────────

export interface DispatchActorEncKeysDbEntity {
  actor_id: number | null;
  enc_ver: number | null;
  enc_key: string | null;
  created_dt: string | null;
}

// ─── Hierarchy ─────────────────────────────────────────────────────────────

/** Recursive hierarchy DTO. Typo'd `Hirarchy` is preserved on the wire. */
export interface ActorHirarchyDto {
  ParentActorID: number | null;
  ActorID: number;
  ActorDescription: string | null;
  ActorTypeID: number;
  ActorStatus: number;
  ActorHierarchyLevel: number;
  ActorChildren: ActorHirarchyDto[] | null;
}

export interface ActorHierarchyQuery {
  ActorID?: number;
  StatusID?: number;
  HierarchyLevelLimit?: number;
}

// ─── Machine groups (actor-scoped, singular `actor` in path) ───────────────

/** Body for POST / PUT /v1/actor/{ActorID}/machineGroups. */
export interface MachineGroupRequestDTO {
  MachineGroupId?: number | null;
  MachineGroupName?: string | null;
  MachineGroupCode?: number | null;
  /** 1=Active, 2=Inactive. */
  MachineGroupStatus: number;
  /** LanguageIdEnum 2..81. */
  LanguageId?: number | null;
}

export interface MachineGroupResponseDTO {
  MachineGroupId: number | null;
  ActorId: number | null;
  MachineGroupName: string | null;
  MachineGroupCode: number | null;
  /** Non-nullable per spec. */
  MachineGroupStatus: number;
  CreatedBy: number | null;
  CreatedOn: string | null;
  UpdatedOn: string | null;
  UpdatedBy: number | null;
}

// ─── Role groups (actor-scoped) ────────────────────────────────────────────

/** Body item for POST / DELETE /v1/actors/{ActorID}/roleGroups. */
export interface ActorGroupRequestDTO {
  RoleGroupId?: number | null;
}

export interface ActorGroupResponseDTO {
  RoleGroupId: number | null;
  RoleGroupName: string | null;
  UpdatedDT: string | null;
}
