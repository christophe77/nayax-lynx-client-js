import type { HttpClient } from "../http/http-client.js";
import type {
  BulkUpdateResponse,
  MachineAttribute,
  MachineAttributeUpdate,
  MachineAttributesInsertLynxRequest,
} from "../types/machine-attribute.js";
import type { ApiResult } from "../types/machine-misc.js";

/**
 * `Machine Attribute` endpoints (confirmed against the Nayax devzone OpenAPI).
 *
 * Exposed as `client.machines.attributes` rather than flattened onto the
 * machines resource, because the upstream docs tag them as a separate group
 * and the surface will likely grow.
 */
export class MachineAttributesResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /v1/machines/{MachineID}/attributes` — all attributes for one machine. */
  list(machineId: number): Promise<MachineAttribute[]> {
    return this.http.request<MachineAttribute[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/attributes`,
    });
  }

  /**
   * `PUT /v1/machines/{MachineID}/attributes` — bulk update.
   * Returns a {@link BulkUpdateResponse} with per-item failures (if any).
   */
  bulkUpdate(
    machineId: number,
    body: MachineAttributeUpdate[],
  ): Promise<BulkUpdateResponse> {
    return this.http.request<BulkUpdateResponse>({
      method: "PUT",
      path: `/v1/machines/${machineId}/attributes`,
      body,
    });
  }

  /**
   * `POST /v1/machines/{MachineID}/attributes/defaults` — reset to the
   * model-defined default attribute values.
   */
  resetToDefaults(machineId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: `/v1/machines/${machineId}/attributes/defaults`,
    });
  }

  /**
   * `POST /v1/machines/{MachineID}/attributes/resendConfig` — resend the
   * current configuration to the machine.
   */
  resendConfig(machineId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: `/v1/machines/${machineId}/attributes/resendConfig`,
    });
  }

  /** `GET /v1/machines/{MachineID}/attributes/{DeviceAttributeID}`. */
  getSpecific(machineId: number, deviceAttributeId: number): Promise<MachineAttribute> {
    return this.http.request<MachineAttribute>({
      method: "GET",
      path: `/v1/machines/${machineId}/attributes/${deviceAttributeId}`,
    });
  }

  /** `PUT /v1/machines/{MachineID}/attributes/{DeviceAttributeID}`. */
  updateSpecific(
    machineId: number,
    deviceAttributeId: number,
    body: MachineAttributeUpdate,
  ): Promise<MachineAttribute> {
    return this.http.request<MachineAttribute>({
      method: "PUT",
      path: `/v1/machines/${machineId}/attributes/${deviceAttributeId}`,
      body,
    });
  }

  /**
   * `POST /v2/machines/attributes` — fan out a batch of attribute changes
   * across one or more machines. Use this when you have a single
   * `Attributes[]` set to apply to many `MachineIds`.
   */
  insertOrUpdate(body: MachineAttributesInsertLynxRequest[]): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: "/v2/machines/attributes",
      body,
    });
  }
}
