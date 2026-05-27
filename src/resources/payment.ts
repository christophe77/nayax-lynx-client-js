import type { HttpClient } from "../http/http-client.js";
import type {
  PaymentRefundApproveLynxModel,
  PaymentRefundDeclineLynxModel,
  PaymentRefundRequestLynxModel,
  PaymentUploadFileRequestLynxModel,
  RefundPaymentLynxModelResponse,
  UploadFileLynxModelResponse,
} from "../types/payment.js";

/**
 * `Payment` resource (4 endpoints — refund workflow, confirmed against devzone).
 */
export class PaymentResource {
  constructor(private readonly http: HttpClient) {}

  /** `POST /v1/payment/refund-request`. */
  requestRefund(
    body: PaymentRefundRequestLynxModel,
  ): Promise<RefundPaymentLynxModelResponse> {
    return this.http.request<RefundPaymentLynxModelResponse>({
      method: "POST",
      path: "/v1/payment/refund-request",
      body,
    });
  }

  /** `POST /v1/payment/refund-approve`. */
  approveRefund(
    body: PaymentRefundApproveLynxModel,
  ): Promise<RefundPaymentLynxModelResponse> {
    return this.http.request<RefundPaymentLynxModelResponse>({
      method: "POST",
      path: "/v1/payment/refund-approve",
      body,
    });
  }

  /** `POST /v1/payment/refund-decline`. */
  declineRefund(
    body: PaymentRefundDeclineLynxModel,
  ): Promise<RefundPaymentLynxModelResponse> {
    return this.http.request<RefundPaymentLynxModelResponse>({
      method: "POST",
      path: "/v1/payment/refund-decline",
      body,
    });
  }

  /** `POST /v1/payment/upload-refund` — base64 file content. */
  uploadRefundDocumentation(
    body: PaymentUploadFileRequestLynxModel,
  ): Promise<UploadFileLynxModelResponse> {
    return this.http.request<UploadFileLynxModelResponse>({
      method: "POST",
      path: "/v1/payment/upload-refund",
      body,
    });
  }
}
