import type { HttpClient } from "../http/http-client.js";
import type { Planogram } from "../types/planogram.js";

/**
 * NOT YET CONFIRMED against official docs — the path and request/response
 * shape are inferred. Adjust once the matching Lynx documentation is available.
 */
export class InventoryResource {
  constructor(private readonly http: HttpClient) {}

  async getPlanogram(machineId: number): Promise<Planogram> {
    return this.http.request<Planogram>({
      method: "GET",
      path: `/v1/machines/${machineId}/planogram`,
    });
  }

  async updatePlanogram(
    machineId: number,
    planogram: Planogram,
  ): Promise<Planogram> {
    if (planogram.machineId !== undefined && planogram.machineId !== machineId) {
      throw new Error(
        `updatePlanogram: planogram.machineId (${planogram.machineId}) does not match machineId argument (${machineId})`,
      );
    }
    const body: Planogram = { ...planogram, machineId };
    return this.http.request<Planogram>({
      method: "PUT",
      path: `/v1/machines/${machineId}/planogram`,
      body,
    });
  }
}
