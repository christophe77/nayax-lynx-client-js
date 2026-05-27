import type { HttpClient } from "../http/http-client.js";
import { OffsetPaginator, type OffsetPaginatorOptions } from "../pagination/offset-paginator.js";
import type { MachineInfo, UpdateMachineInfoBody } from "../types/machine.js";
import type {
  ApiResult,
  MachineAlert,
  MachineChangeLog,
  MachineChangeLogsQuery,
  MachineLastSale,
  MachinePayment,
  MachineSearchRequest,
  MachineSearchResult,
} from "../types/machine-misc.js";
import type { MachineStatusInfo } from "../types/machine-status.js";
import { MachineAttributesResource } from "./machine-attributes.js";

/**
 * Filters accepted by `GET /v1/machines`. All optional. The `ResultsLimit`/
 * `ResultsOffset` pagination is handled automatically by the returned
 * {@link OffsetPaginator} — pass `pageSize` to control page size and use
 * `.collect()` to materialise everything.
 */
export interface ListMachinesFilters {
  ActorID?: number;
  OperatorIdentifier?: string;
  MachineID?: number;
  MachineSerialNumber?: string;
  MachineName?: string;
  DeviceID?: number;
  VposID?: number;
}

export type ListMachinesOptions = ListMachinesFilters & OffsetPaginatorOptions;

/**
 * All endpoints below are CONFIRMED against the Nayax devzone Lynx docs.
 */
export class MachinesResource {
  /** Sub-resource: machine attribute endpoints (`/v1/machines/{id}/attributes/...`). */
  readonly attributes: MachineAttributesResource;

  constructor(private readonly http: HttpClient) {
    this.attributes = new MachineAttributesResource(http);
  }

  // ─── List + CRUD ─────────────────────────────────────────────────────────

  /**
   * `GET /v1/machines` — paginated list with offset/limit semantics.
   *
   * ```ts
   * const all = await machines.list({ MachineName: "Lobby" }).collect();
   * for await (const m of machines.list({ pageSize: 200 })) { ... }
   * ```
   */
  list(options: ListMachinesOptions = {}): OffsetPaginator<MachineInfo> {
    const { pageSize, startOffset, limitParam, offsetParam, maxItems, ...filters } = options;
    const query: Record<string, string | number | undefined> = {};
    if (filters.ActorID !== undefined) query.ActorID = filters.ActorID;
    if (filters.OperatorIdentifier !== undefined) query.OperatorIdentifier = filters.OperatorIdentifier;
    if (filters.MachineID !== undefined) query.MachineID = filters.MachineID;
    if (filters.MachineSerialNumber !== undefined) query.MachineSerialNumber = filters.MachineSerialNumber;
    if (filters.MachineName !== undefined) query.MachineName = filters.MachineName;
    if (filters.DeviceID !== undefined) query.DeviceID = filters.DeviceID;
    if (filters.VposID !== undefined) query.VposID = filters.VposID;
    const paginatorOpts: OffsetPaginatorOptions = {};
    if (pageSize !== undefined) paginatorOpts.pageSize = pageSize;
    if (startOffset !== undefined) paginatorOpts.startOffset = startOffset;
    if (limitParam !== undefined) paginatorOpts.limitParam = limitParam;
    if (offsetParam !== undefined) paginatorOpts.offsetParam = offsetParam;
    if (maxItems !== undefined) paginatorOpts.maxItems = maxItems;
    return new OffsetPaginator<MachineInfo>(
      this.http,
      { method: "GET", path: "/v1/machines", query },
      paginatorOpts,
    );
  }

  /** `POST /v1/machines` — create. */
  create(body: UpdateMachineInfoBody): Promise<MachineInfo> {
    return this.http.request<MachineInfo>({
      method: "POST",
      path: "/v1/machines",
      body,
    });
  }

  /** `GET /v1/machines/{MachineID}`. */
  get(machineId: number): Promise<MachineInfo> {
    return this.http.request<MachineInfo>({
      method: "GET",
      path: `/v1/machines/${machineId}`,
    });
  }

  /** `PUT /v1/machines/{MachineID}`. */
  update(machineId: number, body: UpdateMachineInfoBody): Promise<MachineInfo> {
    return this.http.request<MachineInfo>({
      method: "PUT",
      path: `/v1/machines/${machineId}`,
      body,
    });
  }

  // ─── Lookups by alternate identifier ─────────────────────────────────────

  /** `GET /v1/devices/{DeviceSerialNumber}/machine`. */
  getByDeviceSerial(deviceSerialNumber: string): Promise<MachineInfo> {
    return this.http.request<MachineInfo>({
      method: "GET",
      path: `/v1/devices/${encodeURIComponent(deviceSerialNumber)}/machine`,
    });
  }

  /** `GET /v1/vpos/{VPOSSerial}/machine`. */
  getByVposSerial(vposSerial: string): Promise<MachineInfo> {
    return this.http.request<MachineInfo>({
      method: "GET",
      path: `/v1/vpos/${encodeURIComponent(vposSerial)}/machine`,
    });
  }

  // ─── Search + audit ──────────────────────────────────────────────────────

  /** `POST /v1/machines/search`. */
  search(body: MachineSearchRequest): Promise<MachineSearchResult[]> {
    return this.http.request<MachineSearchResult[]>({
      method: "POST",
      path: "/v1/machines/search",
      body,
    });
  }

  /** `GET /v1/machines/changeLogs`. */
  getChangeLogs(query: MachineChangeLogsQuery = {}): Promise<MachineChangeLog[]> {
    const q: Record<string, string | number | undefined> = {};
    if (query.ActorID !== undefined) q.ActorID = query.ActorID;
    if (query.StartDate !== undefined) q.StartDate = query.StartDate;
    if (query.EndDate !== undefined) q.EndDate = query.EndDate;
    if (query.MachineID !== undefined) q.MachineID = query.MachineID;
    if (query.TimePeriod !== undefined) q.TimePeriod = query.TimePeriod;
    if (query.MachineNumber !== undefined) q.MachineNumber = query.MachineNumber;
    return this.http.request<MachineChangeLog[]>({
      method: "GET",
      path: "/v1/machines/changeLogs",
      query: q,
    });
  }

  // ─── Status / alerts / sales ─────────────────────────────────────────────

  /** `GET /v1/machines/{MachineID}/status` — real-time stats snapshot. */
  getStatistics(machineId: number): Promise<MachineStatusInfo> {
    return this.http.request<MachineStatusInfo>({
      method: "GET",
      path: `/v1/machines/${machineId}/status`,
    });
  }

  /** `GET /v1/machines/{MachineID}/lastAlerts`. */
  getLastAlerts(machineId: number): Promise<MachineAlert[]> {
    return this.http.request<MachineAlert[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/lastAlerts`,
    });
  }

  /** `GET /v1/machines/{MachineID}/lastSales`. */
  getLastSales(machineId: number): Promise<MachineLastSale[]> {
    return this.http.request<MachineLastSale[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/lastSales`,
    });
  }

  // ─── Payment methods ─────────────────────────────────────────────────────

  /** `GET /v1/machines/{MachineID}/paymentMethods`. */
  getPaymentMethods(machineId: number): Promise<MachinePayment[]> {
    return this.http.request<MachinePayment[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/paymentMethods`,
    });
  }

  /** `POST /v1/machines/{MachineID}/paymentMethods` — bulk create. */
  createPaymentMethods(
    machineId: number,
    body: MachinePayment[],
  ): Promise<MachinePayment[]> {
    return this.http.request<MachinePayment[]>({
      method: "POST",
      path: `/v1/machines/${machineId}/paymentMethods`,
      body,
    });
  }

  /** `PUT /v1/machines/{MachineID}/paymentMethods` — bulk update. */
  updatePaymentMethods(
    machineId: number,
    body: MachinePayment[],
  ): Promise<MachinePayment[]> {
    return this.http.request<MachinePayment[]>({
      method: "PUT",
      path: `/v1/machines/${machineId}/paymentMethods`,
      body,
    });
  }

  /** `DELETE /v1/machines/{MachineID}/paymentMethods/{paymentMethodID}`. */
  deletePaymentMethod(
    machineId: number,
    paymentMethodId: number,
  ): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "DELETE",
      path: `/v1/machines/${machineId}/paymentMethods/${paymentMethodId}`,
    });
  }
}
