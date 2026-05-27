import type { HttpClient } from "../http/http-client.js";
import type {
  EventRulesLynxModelResponse,
  UploadPictureRequest,
  UploadPictureResponse,
} from "../types/metadata.js";

/**
 * `Metadata` resource (confirmed against Nayax devzone docs).
 */
export class MetadataResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * `GET /v1/metadata/v1/event-rules` — list configured event rules.
   * (Yes, the path contains `/v1/.../v1/...` — that's the upstream spec.)
   */
  getEventRules(): Promise<EventRulesLynxModelResponse[]> {
    return this.http.request<EventRulesLynxModelResponse[]>({
      method: "GET",
      path: "/v1/metadata/v1/event-rules",
    });
  }

  /**
   * `POST /v1/metadata/upload-picture` — upload a base64-encoded image and
   * receive a key + URL map.
   */
  uploadPicture(body: UploadPictureRequest): Promise<UploadPictureResponse> {
    return this.http.request<UploadPictureResponse>({
      method: "POST",
      path: "/v1/metadata/upload-picture",
      body,
    });
  }
}
