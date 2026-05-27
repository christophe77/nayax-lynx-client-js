/**
 * Types for the `Cards` group (20 endpoints, v1 + v2 surfaces).
 * Source: https://devzone.nayax.com/reference/lynx/cards
 *
 * v1 endpoints use the flat `Cards` schema; v2 endpoints (POST/PUT /v2/cards)
 * use the nested `CardCreateDto`/`CardUpdateDto`/`CardGetDto` shapes.
 */

// ─── Simple value types ────────────────────────────────────────────────────

/** Returned by any GET endpoint that gives a single numeric balance. */
export interface CardValue {
  value: number;
}

/** Returned row from POST /v1/cards/query (latest credit card transactions). */
export interface CardLastTransaction {
  AmountValue: number;
  MachineName: string | null;
  AuthorizationDate: string;
}

/** Card-group association used by GET/PUT /v1/cards/{cardId}/cardGroups. */
export interface CardGroup {
  CardGroupEnabledBit: boolean | null;
  GroupName: string | null;
  CardGroupId: number | null;
  GroupDailyLimit: number | null;
  UpdatedBy: number | null;
  LastUpdated: string | null;
}

// ─── v1 flat schemas ───────────────────────────────────────────────────────

/** Flat card row (v1). Same fields as CardsDbEntity. */
export interface Cards {
  MobileNumber?: string | null;
  CardID?: number | null;
  ActorID?: number | null;
  CardUniqueIdentifier?: string | null;
  CardDisplayNumber?: string | null;
  CardHolderName?: string | null;
  CardStatus?: number | null;
  CardType?: number | null;
  CardUserIdentity?: string | null;
  UpdatedDt?: string | null;
  CreatedDt?: string | null;
  CreatedBy?: number | null;
  UpdatedBy?: number | null;
  CountryID?: number | null;
  Email?: string | null;
  CardPhysicalType?: number | null;
  MemberType?: number | null;
  CardActivationDate?: string | null;
  CardExpirationDate?: string | null;
  CardImageUrl?: string | null;
  CardNote?: string | null;
  wd_limits_money?: string | null;
  wd_limits_trans?: string | null;
  use_wd_limit?: boolean | null;
  CardExternalApplicationUserID?: string | null;
  Refs?: Record<string, string> | null;
}

/** Same fields as `Cards`; used inside the nested PrepaidCard envelope. */
export type CardsDbEntity = Cards;

/**
 * v1 create-virtual-card body.
 * Note: `Currency` here is the field name, vs `CurrencyID` elsewhere.
 */
export interface CardsWithActorId {
  ActorID?: number | null;
  CardUniqueIdentifier?: string | null;
  CardDisplayNumber?: string | null;
  CardHolderName?: string | null;
  /** 1=Active, 2=Inactive. */
  CardStatus?: number | null;
  /** 31=Technician, 33=Prepaid, 34=Refund, 30000616=Discount. */
  CardType?: number | null;
  CardUserIdentity?: string | null;
  CountryID?: number | null;
  Currency?: number | null;
  MobileNumber?: string | null;
  Email?: string | null;
  CardPhysicalType?: number | null;
  MemberType?: number | null;
  CardActivationDate?: string | null;
  CardExpirationDate?: string | null;
  CardImageUrl?: string | null;
  CardNote?: string | null;
  wd_limits_money?: string | null;
  wd_limits_trans?: string | null;
  use_wd_limit?: boolean | null;
}

// ─── PrepaidCard + validation ──────────────────────────────────────────────

/** Heavy prepaid-card details + usage counters. */
export interface PrepaidCardDbEntity {
  CardID?: number | null;
  CardDiscountTypeBit?: number | null;
  CardDiscountAmount?: number | null;
  CardCreditTypeMoneyBit?: boolean | null;
  CardCreditAccumulateBit?: boolean | null;
  CardCreditSingleUseBit?: boolean | null;
  CardRevalueCashBit?: boolean | null;
  CardRevalueCreditCardBit?: boolean | null;
  CardCredit?: number | null;
  CardRevalueCredit?: number | null;
  CardMaxRevalueAmountLimit?: number | null;
  CreditAmountDailyLimit?: number | null;
  CreditAmountWeeklyLimit?: number | null;
  CreditAmountMonthlyLimit?: number | null;
  CreditTransactionsDailyLimit?: number | null;
  CreditTransactionsWeeklyLimit?: number | null;
  CreditTransactionsMonthlyLimit?: number | null;
  CreditTransactionsMonthlyReload?: number | null;
  CreditAmountCapture?: number | null;
  CreditTransactionsCapture?: number | null;
  CreditCaptureDate?: string | null;
  CreditAmountDailyUsage?: number | null;
  CreditAmountWeeklyUsage?: number | null;
  CreditAmountMonthlyUsage?: number | null;
  CreditAmountTotalUsage?: number | null;
  CreditTransactionsDailyUsage?: number | null;
  CreditTransactionsWeeklyUsage?: number | null;
  CreditTransactionsMonthlyUsage?: number | null;
  TransactionsTotalUsage?: number | null;
  CardRevalueExpirationDate?: string | null;
  CardSetSingleUseDate?: string | null;
  RemoveSingleUseDate?: string | null;
  CreditAmountMonthlyReload?: number | null;
  CreditTransactionsTotalUsage?: number | null;
  CardCustomerTypeID?: number | null;
  CardLastUpdatedBy?: number | null;
  CardLastUpdatedDate?: string | null;
  final_wd_limit_money?: number | null;
}

/** Envelope returned by GET/PUT /v1/cards/{CardId}/prepaid. */
export interface PrepaidCard {
  PrepaidCard: PrepaidCardDbEntity;
  Card: CardsDbEntity;
}

/** Machine-side details inside the validate-card response. */
export interface MachineForCardResponseModel {
  ActorID: number;
  MachineID: number;
  PurchaseAllowed: boolean;
}

/** Response of GET /v1/cards/validate-machine/{machineId}. */
export interface CardsMachineResponseModel {
  Machine: MachineForCardResponseModel;
  PrepaidCard: PrepaidCardDbEntity;
  Card: CardsDbEntity;
}

// ─── v2 nested schemas ─────────────────────────────────────────────────────

export interface CardDetailsGet {
  CardID: number;
  ActorID: number;
  CardUniqueIdentifier: string | null;
  CardDisplayNumber: string | null;
  CardTypeID: number | null;
  PhysicalTypeID: number | null;
  Notes: string | null;
  Status: number | null;
  ExternalApplicationUserID: string | null;
  CreatedBy: number | null;
  CreatedDT: string | null;
  UpdatedBy: number | null;
  UpdatedDT: string;
}

export interface CardDetailsCreate {
  ActorID: number;
  CardUniqueIdentifier?: string | null;
  CardDisplayNumber?: string | null;
  /** 31=Technician, 33=Prepaid, 34=Refund, 30000616=Discount. */
  CardTypeID?: number | null;
  PhysicalTypeID?: number | null;
  Notes?: string | null;
  /** 1=Active, 2=Inactive. */
  Status?: number | null;
  ExternalApplicationUserID?: string | null;
}

export interface CardDetailsUpdate {
  ActorID?: number | null;
  CardDisplayNumber?: string | null;
  PhysicalTypeID?: number | null;
  Notes?: string | null;
  Status?: number | null;
  ExternalApplicationUserID?: string | null;
}

export interface CardHolderDetailsGet {
  CardHolderName: string | null;
  UserIdentity: string | null;
  CountryID: number | null;
  MobileNumber: string | null;
  Email: string | null;
  /** 800-805 / 812. */
  MemberTypeID: number | null;
  ImageUrl: string | null;
}

export interface CardHolderDetailsUpdate {
  CardHolderName?: string | null;
  UserIdentity?: string | null;
  CountryID?: number | null;
  MobileNumber?: string | null;
  Email?: string | null;
  MemberTypeID?: number | null;
}

export interface CardCreditAttributes {
  CurrencyID?: number | null;
  Credit?: number | null;
  RevalueCredit?: number | null;
  CreditTypeMoneyBit?: boolean | null;
  CreditAccumulateBit?: boolean | null;
  CreditSingleUseBit?: boolean | null;
  RevalueCashBit?: boolean | null;
  RevalueCreditCardBit?: boolean | null;
  AmountMonthlyReload?: number | null;
  TransactionsMonthlyReload?: number | null;
  DiscountTypeBit?: number | null;
  DiscountValue?: number | null;
}

export interface CardCreditLimits {
  AmountDailyLimit?: number | null;
  AmountWeeklyLimit?: number | null;
  TransactionsDailyLimit?: number | null;
  TransactionsWeeklyLimit?: number | null;
  AmountMonthlyLimit?: number | null;
  TransactionsMonthlyLimit?: number | null;
  DiscountTransactionsTotalLimit?: number | null;
  MaxRevalueAmountLimit?: number | null;
  WeekDayLimitEnabledBit?: boolean | null;
  WeekDayAmountLimit?: string | null;
  WeekDayTransactionLimit?: string | null;
}

export interface CardDateRules {
  ActivationDate?: string | null;
  ExpirationDate?: string | null;
  RevalueExpirationDate?: string | null;
  SetSingleUseDate?: string | null;
  RemoveSingleUseDate?: string | null;
}

export interface CardCreditUsageGet {
  AmountDailyUsage: number | null;
  AmountWeeklyUsage: number | null;
  TransactionsDailyUsage: number | null;
  TransactionsWeeklyUsage: number | null;
  AmountMonthlyUsage: number | null;
  TransactionsMonthlyUsage: number | null;
  AmountTotalUsage: number | null;
  TransactionsTotalUsage: number | null;
  AmountCapture: number | null;
  TransactionsCapture: number | null;
  CaptureDate: string | null;
}

export interface CardRevalueRewardRuleGet {
  RuleID: number;
  RewardActorID: number;
  Status: boolean;
  RevalueAmount: number;
  RewardValueTypeBit: boolean;
  RewardValue: number;
  UpdatedDT: string;
  UpdatedBy: number;
}

export interface CardRevalueRewardRuleUpdate {
  RuleID: number;
  RewardActorID: number;
  Status: boolean;
  RevalueAmount: number;
  RewardValueTypeBit: boolean;
  RewardValue: number;
}

export interface CardGroupLocationLimitGet {
  CardGroupEnabledBit: boolean;
  GroupName: string | null;
  CardGroupId: number;
  GroupDailyLimit: number | null;
  UpdatedBy: number | null;
  LastUpdated: string | null;
}

export interface CardGroupLocationLimitUpdate {
  CardGroupEnabledBit: boolean;
  GroupName?: string | null;
  CardGroupId: number;
  GroupDailyLimit?: number | null;
}

/** Response of v1/v2 list + POST/PUT /v2/cards. */
export interface CardGetDto {
  CardDetails: CardDetailsGet;
  CardHolderDetails: CardHolderDetailsGet;
  CardCreditAttributes: CardCreditAttributes;
  CardCreditLimits: CardCreditLimits;
  CardDateRules: CardDateRules;
  CardCreditUsage: CardCreditUsageGet;
  CardRevalueRewardRules: CardRevalueRewardRuleGet[] | null;
  GroupLocationLimits: CardGroupLocationLimitGet[] | null;
}

/** Body for POST /v2/cards. */
export interface CardCreateDto {
  CardDetails?: CardDetailsCreate;
  CardHolderDetails?: CardHolderDetailsUpdate;
  CardCreditAttributes?: CardCreditAttributes;
  CardCreditLimits?: CardCreditLimits;
  CardDateRules?: CardDateRules;
  CardRevalueRewardRules?: CardRevalueRewardRuleUpdate[];
  GroupLocationLimits?: CardGroupLocationLimitUpdate[];
}

/** Body for PUT /v2/cards/{CardID}. */
export interface CardUpdateDto {
  CardDetails?: CardDetailsUpdate;
  CardHolderDetails?: CardHolderDetailsUpdate;
  CardCreditAttributes?: CardCreditAttributes;
  CardCreditLimits?: CardCreditLimits;
  CardDateRules?: CardDateRules;
  CardRevalueRewardRules?: CardRevalueRewardRuleUpdate[];
  GroupLocationLimits?: CardGroupLocationLimitUpdate[];
}

// ─── Filters ───────────────────────────────────────────────────────────────

/** Query filters for GET /v1/cards. */
export interface ListCardsFilters {
  CardID?: number;
  CardUniqueIdentifier?: string;
  CardDisplayNumber?: string;
  CardMobileNumber?: string;
  ExternalApplicationUserID?: string;
  CardEmail?: string;
  CardHolderName?: string;
}
