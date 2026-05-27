import type { HttpClient } from "../http/http-client.js";
import type { Product, ProductEntity } from "../types/product.js";

/**
 * `Products` resource (4 endpoints, confirmed against devzone).
 *
 * Two of these live under `/v1/operators/{OperatorID}/...` (scoped) and two
 * under `/v1/products/{NayaxProductID}` (global by product id).
 */
export class ProductsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /v1/operators/{OperatorID}/products` — all products for an operator. */
  listByOperator(operatorId: number): Promise<Product[]> {
    return this.http.request<Product[]>({
      method: "GET",
      path: `/v1/operators/${operatorId}/products`,
    });
  }

  /** `POST /v1/operators/{OperatorID}/products` — create one product for an operator. */
  createForOperator(operatorId: number, body: ProductEntity): Promise<Product> {
    return this.http.request<Product>({
      method: "POST",
      path: `/v1/operators/${operatorId}/products`,
      body,
    });
  }

  /** `GET /v1/products/{NayaxProductID}`. */
  get(nayaxProductId: number): Promise<Product> {
    return this.http.request<Product>({
      method: "GET",
      path: `/v1/products/${nayaxProductId}`,
    });
  }

  /** `PUT /v1/products/{NayaxProductID}`. */
  update(nayaxProductId: number, body: ProductEntity): Promise<Product> {
    return this.http.request<Product>({
      method: "PUT",
      path: `/v1/products/${nayaxProductId}`,
      body,
    });
  }
}
