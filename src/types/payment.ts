/**
 * Types for the `Payment` group (4 endpoints — refund flow).
 * Source: https://devzone.nayax.com/reference/lynx/payment
 */

export interface PaymentRefundRequestLynxModel {
  RefundAmount: number;
  /** Comma-separated email list. */
  RefundEmailList: string;
  RefundReason: string;
  TransactionId: number;
  SiteId: number;
  MachineAuTime: string;
}

export interface PaymentRefundApproveLynxModel {
  IsRefundedExternally: boolean;
  RefundDocumentUrl?: string | null;
  TransactionId: number;
  SiteId: number;
  MachineAuTime: string;
}

export interface PaymentRefundDeclineLynxModel {
  DeclineReason?: string | null;
  TransactionId: number;
  SiteId: number;
  MachineAuTime: string;
}

export interface PaymentUploadFileRequestLynxModel {
  FileName?: string | null;
  /** Base64-encoded file content. */
  FileData?: string | null;
  TransactionId: number;
  SiteId: number;
  MachineAuTime: string;
}

export interface RefundPaymentLynxModelResponse {
  Result: string | null;
  Status: string | null;
}

export interface UploadFileLynxModelResponse {
  FileURL: string | null;
}
