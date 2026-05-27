/**
 * `MachineStatusInfo` — response of `GET /v1/machines/{MachineID}/status`.
 * Real-time statistics + state snapshot for a machine.
 */
export interface MachineStatusInfo {
  MachineID: number | null;
  ActorID: number | null;
  CardSalesCounter: number | null;
  CoinTubesChangeSum: number | null;
  MachineCashBoxLevel: number | null;
  CancelledTransactionsCount: number | null;
  Machine24HEventCount: number | null;
  TemperatureFahrenheit: number | null;
  TemperatureCelcius: number | null;
  QTYSoldSinceLastVisitDEXSales: number | null;
  QTYSoldSinceLastVisitOnlineSales: number | null;
  LastCashlesstransactionID: number | null;
  LastGPRSFailureCount: number | null;
  /** Doc field is `LastReceptionLevel(RSSI)` — exposed with the original key. */
  ["LastReceptionLevel(RSSI)"]: number | null;
  MachineMQTTStatus: boolean | null;

  MachineInstallationDate: string | null;
  PickListGeneratedDateTime: string | null;
  InventoryCountDateTime: string | null;
  LastCashSaleDateTime: string | null;
  LastCashlessSaleDateTime: string | null;
  LastDEXReadDateTime: string | null;
  LastKeepAliveDateTime: string | null;
  LastPowerDownDateTime: string | null;
  LastPowerUpDateTime: string | null;
  LastTransactionDateTime: string | null;
  LastVisitDateTime: string | null;
  ReaderStateErrorDateTime: string | null;
  ReaderStateEnableDateTime: string | null;
  MachineStockRefilDateTime: string | null;
  MachineRemarksUpdateDateTime: string | null;
  MachineStatusUpdateDateTime: string | null;
  /** Doc field is `LastCashCollectionDateTime(UTC)`. */
  ["LastCashCollectionDateTime(UTC)"]: string | null;

  /** Doc field is `LastLCDMSISDN(CLI)`. */
  ["LastLCDMSISDN(CLI)"]: string | null;
  DeviceLastIPAddress: string | null;
  MachineRemarks: string | null;
  Href: string | null;
}
