import type { HttpClient } from "../http/http-client.js";
import type {
  CreatePickListOptions,
  PickListItem,
  PickListLynxModelRequest,
  PickListLynxModelResponse,
} from "../types/machine-inventory.js";
import type { ApiResult } from "../types/machine-misc.js";

/**
 * `Machine Inventory` resource (6 endpoints, confirmed against devzone).
 */
export class MachineInventoryResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /v1/machines/{MachineID}/pickList`. */
  getPickList(machineId: number): Promise<PickListItem[]> {
    return this.http.request<PickListItem[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/pickList`,
    });
  }

  /**
   * `POST /v1/machines/{MachineID}/pickList` — generate a new pick list.
   * Returns 204 (no body) on success.
   */
  async createPickList(
    machineId: number,
    options: CreatePickListOptions = {},
  ): Promise<void> {
    const query: Record<string, string | boolean | undefined> = {};
    if (options.UseMinPick !== undefined) query.UseMinPick = options.UseMinPick;
    if (options.AddOnlineSales !== undefined) query.AddOnlineSales = options.AddOnlineSales;
    if (options.AddEstimatedSales !== undefined) query.AddEstimatedSales = options.AddEstimatedSales;
    await this.http.request<void>({
      method: "POST",
      path: `/v1/machines/${machineId}/pickList`,
      query,
    });
  }

  /** `DELETE /v1/machines/{MachineID}/pickList`. */
  deletePickList(machineId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "DELETE",
      path: `/v1/machines/${machineId}/pickList`,
    });
  }

  /** `POST /v1/machines/{MachineID}/inventory/full` — mark all bins full. */
  setAllBinsFull(machineId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: `/v1/machines/${machineId}/inventory/full`,
    });
  }

  /** `POST /v1/machines/{MachineID}/inventory/empty` — zero the inventory. */
  emptyInventory(machineId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: `/v1/machines/${machineId}/inventory/empty`,
    });
  }

  /**
   * `PUT /v1/machines/inventory/picklists/update` — bulk update across many
   * machines (the body is an array of per-machine product changes).
   */
  updatePickLists(
    body: PickListLynxModelRequest[],
  ): Promise<PickListLynxModelResponse[]> {
    return this.http.request<PickListLynxModelResponse[]>({
      method: "PUT",
      path: "/v1/machines/inventory/picklists/update",
      body,
    });
  }
}
