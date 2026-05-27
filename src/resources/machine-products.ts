import type { HttpClient } from "../http/http-client.js";
import type {
  MachineProduct,
  MachineProductEntity,
  MachineProductPostRequest,
} from "../types/machine-product.js";

/**
 * `Machine Products` resource (5 endpoints, confirmed against devzone).
 */
export class MachineProductsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /v1/machines/{MachineID}/machineProducts`. */
  list(machineId: number): Promise<MachineProduct[]> {
    return this.http.request<MachineProduct[]>({
      method: "GET",
      path: `/v1/machines/${machineId}/machineProducts`,
    });
  }

  /** `GET /v1/machines/{MachineID}/machineProducts/{MachineProductID}`. */
  get(machineId: number, machineProductId: number): Promise<MachineProduct> {
    return this.http.request<MachineProduct>({
      method: "GET",
      path: `/v1/machines/${machineId}/machineProducts/${machineProductId}`,
    });
  }

  /** `POST /v1/machines/{MachineID}/machineProducts` — bulk create. */
  create(
    machineId: number,
    body: MachineProductPostRequest[],
  ): Promise<MachineProduct[]> {
    return this.http.request<MachineProduct[]>({
      method: "POST",
      path: `/v1/machines/${machineId}/machineProducts`,
      body,
    });
  }

  /**
   * `PUT /v1/machines/{MachineID}/machineProducts` — bulk update.
   * Pass `avoidDelete: true` to keep machine products not present in the body.
   */
  bulkUpdate(
    machineId: number,
    body: MachineProductEntity[],
    options: { avoidDelete?: boolean } = {},
  ): Promise<MachineProduct[]> {
    const query: Record<string, boolean | undefined> = {};
    if (options.avoidDelete !== undefined) query.avoidDelete = options.avoidDelete;
    return this.http.request<MachineProduct[]>({
      method: "PUT",
      path: `/v1/machines/${machineId}/machineProducts`,
      query,
      body,
    });
  }

  /** `PUT /v1/machines/{MachineID}/machineProducts/{MachineProductID}` — single. */
  update(
    machineId: number,
    machineProductId: number,
    body: MachineProductEntity,
  ): Promise<MachineProduct> {
    return this.http.request<MachineProduct>({
      method: "PUT",
      path: `/v1/machines/${machineId}/machineProducts/${machineProductId}`,
      body,
    });
  }
}
