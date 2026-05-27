/**
 * `EReceipt` schemas.
 * Source: https://devzone.nayax.com/reference/lynx/ereceipt/generate-ereceipt-for-your-transaction.md
 *
 * NOTE: the field names `TrasactionID` and `TrasactionSiteID` are typos in the
 * upstream spec — preserved as-is so the wire format matches.
 */

export interface EReceiptRequest {
  /** `TrasactionID` (typo'd in upstream spec). */
  TrasactionID: number;
  TransactionDateTime: string;
  /** `TrasactionSiteID` (typo'd in upstream spec). */
  TrasactionSiteID: number;
  MachineID: number;
  FullName?: string | null;
  Email?: string | null;
}

export interface EReceiptResponse {
  ReceiptURL: string | null;
  EmailSent: boolean;
  EreceiptID: number;
}
