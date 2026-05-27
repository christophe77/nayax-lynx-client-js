import type { HttpClient } from "../http/http-client.js";
import type { MachineTelemetry } from "../types/telemetry.js";

/**
 * NOT YET CONFIRMED against official docs — the path and response shape are
 * inferred. Adjust once the matching Lynx documentation is available.
 */
export class TelemetryResource {
  constructor(private readonly http: HttpClient) {}

  /** Latest telemetry snapshot for a machine. */
  async getLatest(machineId: number): Promise<MachineTelemetry> {
    return this.http.request<MachineTelemetry>({
      method: "GET",
      path: `/v1/machines/${machineId}/telemetry`,
    });
  }
}
