import type { HttpClient } from "../http/http-client.js";
import type {
  WidgetDataResponseDto,
  WidgetRequestDto,
  WidgetResponseDto,
} from "../types/report.js";

/**
 * `Reports` resource (2 endpoints, confirmed against devzone).
 *
 * NOTE the upstream path is `/v1/dashboard/...` even though the OpenAPI tag
 * is `report`.
 */
export class ReportsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /v1/dashboard/widgets` — list available widgets. */
  getAvailableWidgets(
    options: { screenTypeId?: number } = {},
  ): Promise<WidgetResponseDto[]> {
    const query: Record<string, number | undefined> = {};
    if (options.screenTypeId !== undefined) query.screenTypeId = options.screenTypeId;
    return this.http.request<WidgetResponseDto[]>({
      method: "GET",
      path: "/v1/dashboard/widgets",
      query,
    });
  }

  /** `POST /v1/dashboard/get-widget-data` — fetch a widget's data. */
  retrieveWidgetData(body: WidgetRequestDto): Promise<WidgetDataResponseDto> {
    return this.http.request<WidgetDataResponseDto>({
      method: "POST",
      path: "/v1/dashboard/get-widget-data",
      body,
    });
  }
}
