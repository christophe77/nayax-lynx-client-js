import { TokenManager } from "./auth/token-manager.js";
import { resolveConfig, type NayaxLynxConfig, type ResolvedConfig } from "./config.js";
import { HttpClient, type RequestOptions } from "./http/http-client.js";
import {
  getMachineTelemetry,
  getTransactionsByMachine,
  iterateAllMachines,
  updateInventory,
  type GetTransactionsByMachineOptions,
  type ResourcesBundle,
} from "./helpers/index.js";
import { CardsResource } from "./resources/cards.js";
import { DevicesResource } from "./resources/devices.js";
import { EReceiptResource } from "./resources/ereceipt.js";
import { InventoryResource } from "./resources/inventory.js";
import { LookupsResource } from "./resources/lookups.js";
import { MachineInventoryResource } from "./resources/machine-inventory.js";
import { MachineProductsResource } from "./resources/machine-products.js";
import { MachinesResource } from "./resources/machines.js";
import { MetadataResource } from "./resources/metadata.js";
import { ProductsResource } from "./resources/products.js";
import { ProductGroupsResource } from "./resources/product-groups.js";
import { SignInResource } from "./resources/sign-in.js";
import { TelemetryResource } from "./resources/telemetry.js";
import { TransactionsResource } from "./resources/transactions.js";
import type { DateRange } from "./types/common.js";
import type { Planogram } from "./types/planogram.js";

/**
 * Top-level Nayax Lynx client. Holds the auth/token state and exposes the
 * resource modules + high-level helpers.
 *
 * ```ts
 * const lynx = new NayaxLynxClient({
 *   environment: "qa",
 *   auth: {
 *     type: "client_credentials",
 *     clientId: process.env.NAYAX_CLIENT_ID!,
 *     clientSecret: process.env.NAYAX_CLIENT_SECRET!,
 *   },
 * });
 * const machine = await lynx.machines.get(12345);
 * await lynx.machines.update(12345, { MachineStatusBit: 1, Remarks: "Updated" });
 * ```
 */
export class NayaxLynxClient {
  readonly config: ResolvedConfig;
  readonly http: HttpClient;
  readonly tokens: TokenManager;
  readonly resources: ResourcesBundle;

  /** `Cards` resource (documented — 20 endpoints, v1+v2). */
  readonly cards: CardsResource;
  /** `Devices` resource (documented). */
  readonly devices: DevicesResource;
  /** `EReceipt` resource (documented). */
  readonly ereceipt: EReceiptResource;
  /** `Lookups` resource (documented — 18 endpoints). */
  readonly lookups: LookupsResource;
  /** `Machine Inventory` resource (documented — pick lists, bins). */
  readonly machineInventory: MachineInventoryResource;
  /** `Machine Products` resource (documented). */
  readonly machineProducts: MachineProductsResource;
  /** `Metadata` resource (documented). */
  readonly metadata: MetadataResource;
  /** `Products` resource (documented). */
  readonly products: ProductsResource;
  /** `Product Groups` resource (documented). */
  readonly productGroups: ProductGroupsResource;
  /** `Sign In` resource (documented). */
  readonly signIn: SignInResource;

  constructor(config: NayaxLynxConfig) {
    this.config = resolveConfig(config);
    this.tokens = new TokenManager(this.config);
    this.http = new HttpClient(this.config, this.tokens);
    this.resources = {
      machines: new MachinesResource(this.http),
      transactions: new TransactionsResource(this.http),
      telemetry: new TelemetryResource(this.http),
      inventory: new InventoryResource(this.http),
    };
    this.cards = new CardsResource(this.http);
    this.devices = new DevicesResource(this.http);
    this.ereceipt = new EReceiptResource(this.http);
    this.lookups = new LookupsResource(this.http);
    this.machineInventory = new MachineInventoryResource(this.http);
    this.machineProducts = new MachineProductsResource(this.http);
    this.metadata = new MetadataResource(this.http);
    this.products = new ProductsResource(this.http);
    this.productGroups = new ProductGroupsResource(this.http);
    this.signIn = new SignInResource(this.http);
  }

  /** Resource shortcut: `client.machines === client.resources.machines`. */
  get machines(): MachinesResource {
    return this.resources.machines;
  }
  get transactions(): TransactionsResource {
    return this.resources.transactions;
  }
  get telemetry(): TelemetryResource {
    return this.resources.telemetry;
  }
  get inventory(): InventoryResource {
    return this.resources.inventory;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  getTransactionsByMachine(
    machineId: number,
    range: DateRange,
    options?: GetTransactionsByMachineOptions,
  ) {
    return getTransactionsByMachine(this.resources, machineId, range, options);
  }

  getMachineTelemetry(machineId: number) {
    return getMachineTelemetry(this.resources, machineId);
  }

  updateInventory(machineId: number, planogram: Planogram) {
    return updateInventory(this.resources, machineId, planogram);
  }

  iterateAllMachines(pageSize?: number) {
    return iterateAllMachines(this.resources, pageSize);
  }

  /** Escape hatch for endpoints not yet covered by a resource. */
  request<T = unknown>(opts: RequestOptions): Promise<T> {
    return this.http.request<T>(opts);
  }
}
