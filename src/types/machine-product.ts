/**
 * Types for the `Machine Products` group.
 * Source: https://devzone.nayax.com/reference/lynx/machine-products
 */

/** Full machine-product record (response shape). */
export interface MachineProduct {
  /** Read-only refs. */
  ProductRef?: string | null;
  MachineProductRef?: string | null;
  ProductGroupRef?: string | null;
  MachineRef?: string | null;
  /** Read-only computed price (from DEX). */
  DexPrice?: number | null;

  MachineProductID: number | null;
  NayaxProductID: number | null;
  MachineID: number | null;
  MDBCode: number | null;
  PAR: number | null;
  CashPrice: number | null;
  CreditCardPrice: number | null;
  MachinePrice: number | null;
  RetailPrice: number | null;
  DEXProductName: string | null;
  PACode: string | null;
  PCCode: string | null;
  ProductMinimumPickQTY: number | null;
  VendOutAlertThreshold: number | null;
  LastUpdated: string | null;
  MissingStockByDEX: number | null;
  DEXMissingStockLastUpdated: string | null;
  PrePaidCardPrice: number | null;
  OperatorButtonCode: string | null;
  LastUpdatedByMobile: string | null;
  ProductGroupID: number | null;
  MissingStockByMDB: number | null;
  MDBMissingStockLastUpdated: string | null;
  SelectionVendOutBit: boolean | null;
  CommissionValue: number | null;
  ExternalPrepaidPrice: number | null;
  /** snake_case in upstream spec. */
  product_mark_for_alerts: number | null;
  last_sale_dt: string | null;
  last_sale_mdb_dt: string | null;
  slow_mover: boolean | null;
}

/** Body for `POST /v1/machines/{MachineID}/machineProducts` (bulk create). */
export interface MachineProductPostRequest {
  NayaxProductID?: number | null;
  MDBCode?: number | null;
  PAR?: number | null;
  CashPrice?: number | null;
  CreditCardPrice?: number | null;
  MachinePrice?: number | null;
  RetailPrice?: number | null;
  DEXProductName?: string | null;
  PACode?: string | null;
  PCCode?: string | null;
  ProductMinimumPickQTY?: number | null;
  VendOutAlertThreshold?: number | null;
  PrePaidCardPrice?: number | null;
  OperatorButtonCode?: string | null;
  CommissionValue?: number | null;
  ExternalPrepaidPrice?: number | null;
}

/**
 * Body for `PUT /v1/machines/{MachineID}/machineProducts` (bulk update) and
 * `PUT /v1/machines/{MachineID}/machineProducts/{MachineProductID}` (single).
 */
export interface MachineProductEntity {
  MachineProductID?: number | null;
  NayaxProductID?: number | null;
  MachineID?: number | null;
  MDBCode?: number | null;
  PAR?: number | null;
  CashPrice?: number | null;
  CreditCardPrice?: number | null;
  MachinePrice?: number | null;
  RetailPrice?: number | null;
  DEXProductName?: string | null;
  PACode?: string | null;
  PCCode?: string | null;
  ProductMinimumPickQTY?: number | null;
  VendOutAlertThreshold?: number | null;
  LastUpdated?: string | null;
  MissingStockByDEX?: number | null;
  DEXMissingStockLastUpdated?: string | null;
  PrePaidCardPrice?: number | null;
  OperatorButtonCode?: string | null;
  LastUpdatedByMobile?: string | null;
  ProductGroupID?: number | null;
  MissingStockByMDB?: number | null;
  MDBMissingStockLastUpdated?: string | null;
  SelectionVendOutBit?: boolean | null;
  CommissionValue?: number | null;
  ExternalPrepaidPrice?: number | null;
  product_mark_for_alerts?: number | null;
  last_sale_dt?: string | null;
  last_sale_mdb_dt?: string | null;
  slow_mover?: boolean | null;
}
