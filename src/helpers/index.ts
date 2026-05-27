import type { InventoryResource } from "../resources/inventory.js";
import type { MachinesResource } from "../resources/machines.js";
import type { TelemetryResource } from "../resources/telemetry.js";
import type { TransactionsResource } from "../resources/transactions.js";
import type { DateRange } from "../types/common.js";
import type { Machine } from "../types/machine.js";
import type { Planogram } from "../types/planogram.js";
import type { MachineTelemetry } from "../types/telemetry.js";
import type { Transaction } from "../types/transaction.js";

export interface ResourcesBundle {
  machines: MachinesResource;
  transactions: TransactionsResource;
  telemetry: TelemetryResource;
  inventory: InventoryResource;
}

export interface GetTransactionsByMachineOptions {
  status?: Transaction["status"];
  pageSize?: number;
  /** Hard cap on total returned items. */
  maxItems?: number;
}

/**
 * Fetch all transactions for a single machine in the given date range.
 * Auto-paginates and returns a flat array. Pass `maxItems` to cap the result.
 */
export async function getTransactionsByMachine(
  resources: ResourcesBundle,
  machineId: number,
  range: DateRange,
  options: GetTransactionsByMachineOptions = {},
): Promise<Transaction[]> {
  const query: Parameters<TransactionsResource["list"]>[0] = {
    machineId,
    from: range.from,
    to: range.to,
  };
  if (options.status !== undefined) query.status = options.status;
  if (options.pageSize !== undefined) query.pageSize = options.pageSize;
  const paginator = resources.transactions.list(query);
  if (options.maxItems !== undefined) {
    const out: Transaction[] = [];
    for await (const t of paginator) {
      out.push(t);
      if (out.length >= options.maxItems) break;
    }
    return out;
  }
  return paginator.collect();
}

/** Fetch the latest telemetry for a machine. Thin convenience wrapper. */
export function getMachineTelemetry(
  resources: ResourcesBundle,
  machineId: number,
): Promise<MachineTelemetry> {
  return resources.telemetry.getLatest(machineId);
}

/** Update a machine's planogram. Returns the persisted planogram. */
export function updateInventory(
  resources: ResourcesBundle,
  machineId: number,
  planogram: Planogram,
): Promise<Planogram> {
  return resources.inventory.updatePlanogram(machineId, planogram);
}

/** Iterate every machine in the tenant. Useful for batch jobs. */
export async function* iterateAllMachines(
  resources: ResourcesBundle,
  pageSize = 100,
): AsyncGenerator<Machine, void, void> {
  for await (const m of resources.machines.list({ pageSize })) {
    yield m;
  }
}
