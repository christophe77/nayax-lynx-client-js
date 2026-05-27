/**
 * Types for the `Machine Inventory` group (pick lists, bins).
 * Source: https://devzone.nayax.com/reference/lynx/machine-inventory
 */

/** One row in a pick list (response of GET .../pickList). */
export interface PickListItem {
  NayaxProductID: number | null;
  ProductID: string | null;
  MachineID: number | null;
  MDBCode: number | null;
  PACode: string | null;
  SelectionID: string | null;
  OperatorButtonCode: string | null;
  PAR: number | null;
  MissingStock: number | null;
  OnHandStock: number | null;
  VendOutAlertThreshold: number | null;
  MachinePrice: number | null;
  CreditCardPrice: number | null;
  RetailPrice: number | null;
  DEXPrice: number | null;
  LastPickQTY: number | null;
  PrePaidCardPrice: number | null;
  CashPrice: number | null;
  DEXProductName: string | null;
  ProductName: string | null;
  SalesSourceID: number | null;
  /** Read-only ref. */
  MachineInventoryRef?: string | null;
  MachineRef?: string | null;
  ProductRef?: string | null;
}

/** Optional query params for `POST /v1/machines/{MachineID}/pickList`. */
export interface CreatePickListOptions {
  /** Use minimum picklist logic. */
  UseMinPick?: boolean;
  /** Adjust the pick list by considering online transactions. */
  AddOnlineSales?: boolean;
  /** Incorporate sales forecasts for a specified visit date (ISO 8601). */
  AddEstimatedSales?: string;
}

/** Item nested under `PickListLynxModelRequest.Products`. */
export interface PickListProductLynxModelRequest {
  MachineProductId: number;
  PickQty?: number | null;
}

/** Body item for `PUT /v1/machines/inventory/picklists/update`. */
export interface PickListLynxModelRequest {
  MachineId: number;
  Products?: PickListProductLynxModelRequest[];
}

/** Item nested under `PickListLynxModelResponse.Products`. */
export interface PickListProductLynxModelResponse {
  NayaxProductID: number | null;
  MachineProductID: number | null;
  ProductID: string | null;
  MDBCode: number | null;
  PACode: string | null;
  SelectionID: string | null;
  OperatorButtonCode: string | null;
  PAR: number | null;
  MissingStock: number | null;
  OnHandStock: number | null;
  VendOutAlertThreshold: number | null;
  MachinePrice: number | null;
  CreditCardPrice: number | null;
  RetailPrice: number | null;
  DEXPrice: number | null;
  LastPickQTY: number | null;
  PrePaidCardPrice: number | null;
  CashPrice: number | null;
  DEXProductName: string | null;
  ProductName: string | null;
  SalesSourceID: number | null;
  AmountInTray: number | null;
  GroupId: number | null;
}

/** Response of `PUT /v1/machines/inventory/picklists/update`. */
export interface PickListLynxModelResponse {
  MachineID: number | null;
  Products: PickListProductLynxModelResponse[] | null;
}
