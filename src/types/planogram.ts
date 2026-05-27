/**
 * A planogram = the map of selections/slots in a machine to products + par
 * levels. Pushed to Lynx via {@link Resources.inventory.updatePlanogram}.
 */
export interface Planogram {
  machineId: number;
  slots: PlanogramSlot[];
  /** Optional human label / version used to track sync state. */
  revision?: string;
}

export interface PlanogramSlot {
  /** Vending coil/selection identifier, e.g. "A1", "12", "B07". */
  selection: string;
  productId: string;
  productName?: string;
  /** Current count, if known. */
  currentQty?: number;
  /** Slot capacity. */
  capacity: number;
  /** Reorder threshold — when currentQty drops below, mark for refill. */
  parLevel?: number;
  /** Unit price in the machine's currency. */
  price?: number | string;
}
