import type { HttpClient } from "../http/http-client.js";
import { PagePaginator, type PagePaginatorOptions } from "../pagination/page-paginator.js";
import type {
  DeviceExtra,
  DevicesMoveResponse,
  DevicesUpdateDto,
  ListDevicesFilters,
} from "../types/device.js";

export type ListDevicesOptions = ListDevicesFilters & PagePaginatorOptions;

/**
 * `Devices` resource (confirmed against Nayax devzone docs).
 */
export class DevicesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * `GET /v1/devices` — page-based pagination (`pageNumber`/`pageSize`,
   * 1-indexed, default page size 1000 server-side). The returned object is
   * an `AsyncIterable<DeviceExtra>` that drives the paginator.
   */
  list(options: ListDevicesOptions = {}): PagePaginator<DeviceExtra> {
    const { pageSize, startPage, limitParam, pageParam, maxItems, ...filters } = options;
    const query: Record<string, string | number | boolean | undefined> = {};
    if (filters.ActorId !== undefined) query.ActorId = filters.ActorId;
    if (filters.isConnected !== undefined) query.isConnected = filters.isConnected;
    if (filters.nayaxDeviceSerial !== undefined) query.nayaxDeviceSerial = filters.nayaxDeviceSerial;
    if (filters.orderId !== undefined) query.orderId = filters.orderId;
    if (filters.statusId !== undefined) query.statusId = filters.statusId;
    if (filters.createdDt !== undefined) query.createdDt = filters.createdDt;
    if (filters.updatedDt !== undefined) query.updatedDt = filters.updatedDt;
    if (filters.boardSerial !== undefined) query.boardSerial = filters.boardSerial;
    if (filters.imei !== undefined) query.imei = filters.imei;
    if (filters.chipId !== undefined) query.chipId = filters.chipId;

    const opts: PagePaginatorOptions = {};
    if (pageSize !== undefined) opts.pageSize = pageSize;
    if (startPage !== undefined) opts.startPage = startPage;
    if (limitParam !== undefined) opts.limitParam = limitParam;
    if (pageParam !== undefined) opts.pageParam = pageParam;
    if (maxItems !== undefined) opts.maxItems = maxItems;

    return new PagePaginator<DeviceExtra>(
      this.http,
      { method: "GET", path: "/v1/devices", query },
      opts,
    );
  }

  /** `GET /v1/devices/{DeviceID}`. */
  get(deviceId: number): Promise<DeviceExtra> {
    return this.http.request<DeviceExtra>({
      method: "GET",
      path: `/v1/devices/${deviceId}`,
    });
  }

  /** `PUT /v1/devices/{DeviceID}`. */
  update(deviceId: number, body: DevicesUpdateDto): Promise<DeviceExtra> {
    return this.http.request<DeviceExtra>({
      method: "PUT",
      path: `/v1/devices/${deviceId}`,
      body,
    });
  }

  /**
   * `PUT /v1/devices/move/{actorId}` — move a batch of devices (identified
   * by serial) under a new actor.
   */
  moveToActor(actorId: number, deviceSerials: string[]): Promise<DevicesMoveResponse[]> {
    return this.http.request<DevicesMoveResponse[]>({
      method: "PUT",
      path: `/v1/devices/move/${actorId}`,
      body: deviceSerials,
    });
  }
}
