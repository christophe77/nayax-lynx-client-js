import type { HttpClient } from "../http/http-client.js";
import type {
  ProductGroup,
  ProductGroupCreateRequest,
  ProductGroupUpdateRequest,
  VatDTO,
  VatRequest,
  VatRequestExt,
} from "../types/product-group.js";

/**
 * `Product Groups` resource (9 endpoints, confirmed against devzone).
 */
export class ProductGroupsResource {
  constructor(private readonly http: HttpClient) {}

  // ─── Groups ──────────────────────────────────────────────────────────────

  /** `GET /v1/productGroups`. */
  list(): Promise<ProductGroup[]> {
    return this.http.request<ProductGroup[]>({
      method: "GET",
      path: "/v1/productGroups",
    });
  }

  /** `GET /v1/operators/{ActorID}/productGroups`. */
  listByActor(actorId: number): Promise<ProductGroup[]> {
    return this.http.request<ProductGroup[]>({
      method: "GET",
      path: `/v1/operators/${actorId}/productGroups`,
    });
  }

  /** `GET /v1/productGroups/{ProductGroupID}`. */
  get(productGroupId: number): Promise<ProductGroup> {
    return this.http.request<ProductGroup>({
      method: "GET",
      path: `/v1/productGroups/${productGroupId}`,
    });
  }

  /** `POST /v1/productGroups`. */
  create(body: ProductGroupCreateRequest): Promise<ProductGroup> {
    return this.http.request<ProductGroup>({
      method: "POST",
      path: "/v1/productGroups",
      body,
    });
  }

  /** `PUT /v1/productGroups/{ProductGroupID}`. */
  update(
    productGroupId: number,
    body: ProductGroupUpdateRequest,
  ): Promise<ProductGroup> {
    return this.http.request<ProductGroup>({
      method: "PUT",
      path: `/v1/productGroups/${productGroupId}`,
      body,
    });
  }

  // ─── Tax rows (nested) ───────────────────────────────────────────────────

  /** `GET /v1/productGroups/{ProductGroupID}/tax` (filter by `TaxRowID` optional). */
  getTax(
    productGroupId: number,
    options: { TaxRowID?: number } = {},
  ): Promise<VatDTO[]> {
    const query: Record<string, number | undefined> = {};
    if (options.TaxRowID !== undefined) query.TaxRowID = options.TaxRowID;
    return this.http.request<VatDTO[]>({
      method: "GET",
      path: `/v1/productGroups/${productGroupId}/tax`,
      query,
    });
  }

  /** `POST /v1/productGroups/{ProductGroupID}/tax` — bulk create tax rows. */
  createTax(productGroupId: number, body: VatRequest[]): Promise<VatDTO[]> {
    return this.http.request<VatDTO[]>({
      method: "POST",
      path: `/v1/productGroups/${productGroupId}/tax`,
      body,
    });
  }

  /** `PUT /v1/productGroups/{ProductGroupID}/tax` — bulk update tax rows. */
  updateTax(productGroupId: number, body: VatRequestExt[]): Promise<VatDTO[]> {
    return this.http.request<VatDTO[]>({
      method: "PUT",
      path: `/v1/productGroups/${productGroupId}/tax`,
      body,
    });
  }

  /** `DELETE /v1/productGroups/{ProductGroupID}/tax/{TaxRowID}`. */
  deleteTax(productGroupId: number, taxRowId: number): Promise<VatDTO[]> {
    return this.http.request<VatDTO[]>({
      method: "DELETE",
      path: `/v1/productGroups/${productGroupId}/tax/${taxRowId}`,
    });
  }
}
