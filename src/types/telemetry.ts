export interface MachineTelemetry {
  machineId: number;
  collectedAt: string;
  /** Temperature in °C if the machine reports it. */
  temperatureC?: number;
  /** Door state if known. */
  door?: "open" | "closed" | "unknown";
  /** Network / link state. */
  connectivity?: "online" | "offline" | "degraded";
  /** Last vend success/failure code or string. */
  lastVendStatus?: string;
  /** Battery / power state for portable units. */
  battery?: {
    percent: number;
    charging?: boolean;
  };
  /** Free-form vendor diagnostics passed through as-is. */
  diagnostics?: Record<string, unknown>;
}
