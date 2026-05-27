import type { HttpClient } from "../http/http-client.js";
import type { EReceiptRequest, EReceiptResponse } from "../types/ereceipt.js";

/**
 * `EReceipt` resource (confirmed against Nayax devzone docs).
 */
export class EReceiptResource {
  constructor(private readonly http: HttpClient) {}

  /** `POST /v1/ereceipt/generate` — generate an eReceipt for a transaction. */
  generate(body: EReceiptRequest): Promise<EReceiptResponse> {
    return this.http.request<EReceiptResponse>({
      method: "POST",
      path: "/v1/ereceipt/generate",
      body,
    });
  }
}
