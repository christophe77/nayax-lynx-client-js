/**
 * `MachineInfo` — the wire schema returned by
 * `GET /operational/v1/machines/{MachineID}` and accepted by the matching PUT.
 *
 * Field names are PascalCase to mirror the Nayax docs exactly (no camelCase
 * translation), so what you read here matches what you read at
 * https://devzone.nayax.com/reference/lynx/machines/get-specific-machine-basic-info.md
 *
 * Nearly every field is nullable per the spec — modeled as `<T> | null` rather
 * than optional so consumers see explicitly that the server may send null.
 * `MachineStatusBit` is the one non-nullable field.
 */
export interface MachineInfo {
  MachineID: number | null;
  ActorID: number | null;
  CountryID: number | null;
  CurrencyID: number | null;
  InstituteID: number | null;
  LocationID: number | null;
  MachineGroupID: number | null;
  MachineModelID: number | null;
  MachineName: string | null;
  MachineNumber: string | null;
  /** Non-nullable status bit field. */
  MachineStatusBit: number;
  LanguageID: MachineLanguageID | null;
  OperatorActorID: number | null;
  DistributorActorID: number | null;
  AreaActorID: number | null;
  SalesSourceID: number | null;
  MachineTypeID: number | null;
  SerialNumber: string | null;
  VPOSSerialNumber: string | null;
  DeviceSerialNumber: string | null;
  VPOSID: number | null;
  DeviceID: number | null;
  UseLocationFrom: number | null;
  GeoCountry: number | null;
  GeoState: string | null;
  GeoCity: string | null;
  GeoAddress: string | null;
  GeoStreetNumber: string | null;
  GeoLongitude: number | null;
  GeoLatitude: number | null;
  GeoZoom: number | null;
  GeoZipCode: string | null;
  SearchAddress: string | null;
  Remarks: string | null;
  DexType: number | null;
  DexMidnightReadsEnableBit: boolean | null;
  DexG85CheckEnableBit: boolean | null;
  DexDivideBillsBy: number | null;
  DexG85CheckParsingFilterEnableBit: boolean | null;
  UseCardPriceCorrectCashPriceBit: boolean | null;
  MachineTimeZoneOffset: number | null;
  DexReadInterval: number | null;
  LocationType: number | null;
  ApplyDisplayPickListSelectionsToReportsBit: boolean | null;
  DisplayPickListSelectionsAs: number | null;
  LastUpdated: string | null;
  MachineProfile: number | null;
  CityID: number | null;
  RegionID: number | null;
  CountryDialingCode: number | null;
  DexIgnoreCRCCheckBit: boolean | null;
  DexParseLABit: boolean | null;
  ProductMapID: number | null;
  Longitude: number | null;
  Latitude: number | null;
  DexTotalSalesMinusCardSalesBit: boolean | null;
  RouteActorID: number | null;
  MachineLogicAlertEnableBit: boolean | null;
  AlertRuleSetId: number | null;
  MachineMemberTypePricingEnableBit: boolean | null;
  DexMultiplyCoinsBy: number | null;
  DexMultiplyTubesBy: number | null;
  CustomerID: number | null;
  CommissionType: number | null;
  CommissionDefaultValue: number | null;
  CreatedBy: number | null;
  CreatedOn: string | null;
  UpdateBy: number | null;
  TubeSource: number | null;
  BillSource: number | null;
  SmartStickerId: number | null;
  EnableRemoveVendBit: boolean | null;
  EnableEreceiptBit: boolean | null;
  ProductMapAutomaticCreationBit: boolean | null;
  Refs: Record<string, string> | null;
}

/**
 * `LanguageID` enum from the Nayax docs. Numeric codes returned by the API.
 */
export const MachineLanguageID = {
  Turkish: 2,
  Hebrew: 4,
  English: 7,
  French: 8,
  Romanian: 9,
  Swedish: 10,
  Norwegian: 11,
  Russian: 12,
  Iceland: 13,
  Portuguese: 14,
  Spanish: 15,
  Italian: 16,
  Danish: 17,
  Polish: 18,
  Dutch: 21,
  Chinese: 22,
  Hungarian: 23,
  Thai: 27,
  German: 28,
  Japanese: 29,
  Greek: 30,
  EnglishUK: 31,
  Latvian: 34,
  Slovenian: 41,
  Estonian: 42,
  Vietnamese: 51,
  Czech: 52,
  Finnish: 54,
  Arabic: 62,
  Lithuanian: 64,
  Bulgarian: 81,
} as const;
export type MachineLanguageID =
  (typeof MachineLanguageID)[keyof typeof MachineLanguageID];

/**
 * Body for `PUT /operational/v1/machines/{MachineID}`. All fields are
 * optional (server merges over the existing record) **except** MachineStatusBit
 * which the spec marks as required.
 */
export type UpdateMachineInfoBody = Partial<Omit<MachineInfo, "MachineStatusBit">> & {
  MachineStatusBit: number;
};

/**
 * Back-compat alias — the original generic `Machine` type. Kept as an alias
 * over `MachineInfo` so older code keeps compiling.
 */
export type Machine = MachineInfo;
