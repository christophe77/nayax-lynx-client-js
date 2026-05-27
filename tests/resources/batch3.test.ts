import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

const BASE = "https://qa-lynx.nayax.com/operational";

function build(queue: Parameters<typeof makeFetchMock>[0]) {
  const { fetch, calls } = makeFetchMock(queue);
  const client = new NayaxLynxClient({
    environment: "qa",
    auth: { type: "static", token: "T" },
    fetch,
    retry: { maxRetries: 0, initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1 },
  });
  return { client, calls };
}

interface Case {
  name: string;
  call: (c: NayaxLynxClient) => Promise<unknown>;
  expectedUrl: string;
  expectedMethod?: string;
  expectedBody?: unknown;
  responseStatus?: number;
  responseBody?: unknown;
}

const machineProductCases: Case[] = [
  {
    name: "machineProducts.list",
    call: (c) => c.machineProducts.list(12345),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts`,
  },
  {
    name: "machineProducts.get",
    call: (c) => c.machineProducts.get(12345, 99),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts/99`,
  },
  {
    name: "machineProducts.create (bulk)",
    call: (c) =>
      c.machineProducts.create(12345, [{ NayaxProductID: 1, CashPrice: 1.5 }]),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts`,
    expectedMethod: "POST",
    expectedBody: [{ NayaxProductID: 1, CashPrice: 1.5 }],
  },
  {
    name: "machineProducts.bulkUpdate (default — no avoidDelete)",
    call: (c) => c.machineProducts.bulkUpdate(12345, [{ MachineProductID: 1 }]),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts`,
    expectedMethod: "PUT",
    expectedBody: [{ MachineProductID: 1 }],
  },
  {
    name: "machineProducts.bulkUpdate with avoidDelete=true",
    call: (c) =>
      c.machineProducts.bulkUpdate(12345, [{ MachineProductID: 1 }], { avoidDelete: true }),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts?avoidDelete=true`,
    expectedMethod: "PUT",
  },
  {
    name: "machineProducts.update single",
    call: (c) => c.machineProducts.update(12345, 99, { CashPrice: 2.5 }),
    expectedUrl: `${BASE}/v1/machines/12345/machineProducts/99`,
    expectedMethod: "PUT",
    expectedBody: { CashPrice: 2.5 },
  },
];

const machineInventoryCases: Case[] = [
  {
    name: "machineInventory.getPickList",
    call: (c) => c.machineInventory.getPickList(12345),
    expectedUrl: `${BASE}/v1/machines/12345/pickList`,
  },
  {
    name: "machineInventory.createPickList (default — no query params)",
    call: (c) => c.machineInventory.createPickList(12345),
    expectedUrl: `${BASE}/v1/machines/12345/pickList`,
    expectedMethod: "POST",
    responseStatus: 204,
  },
  {
    name: "machineInventory.createPickList with options",
    call: (c) =>
      c.machineInventory.createPickList(12345, {
        UseMinPick: true,
        AddOnlineSales: false,
        AddEstimatedSales: "2026-06-01T00:00:00Z",
      }),
    expectedUrl: `${BASE}/v1/machines/12345/pickList?UseMinPick=true&AddOnlineSales=false&AddEstimatedSales=2026-06-01T00%3A00%3A00Z`,
    expectedMethod: "POST",
    responseStatus: 204,
  },
  {
    name: "machineInventory.deletePickList",
    call: (c) => c.machineInventory.deletePickList(12345),
    expectedUrl: `${BASE}/v1/machines/12345/pickList`,
    expectedMethod: "DELETE",
    responseBody: { Ok: true, Message: null, SystemMessage: null, code: null },
  },
  {
    name: "machineInventory.setAllBinsFull",
    call: (c) => c.machineInventory.setAllBinsFull(12345),
    expectedUrl: `${BASE}/v1/machines/12345/inventory/full`,
    expectedMethod: "POST",
    responseBody: { Ok: true, Message: null, SystemMessage: null, code: null },
  },
  {
    name: "machineInventory.emptyInventory",
    call: (c) => c.machineInventory.emptyInventory(12345),
    expectedUrl: `${BASE}/v1/machines/12345/inventory/empty`,
    expectedMethod: "POST",
    responseBody: { Ok: true, Message: null, SystemMessage: null, code: null },
  },
  {
    name: "machineInventory.updatePickLists (bulk cross-machine)",
    call: (c) =>
      c.machineInventory.updatePickLists([
        { MachineId: 12345, Products: [{ MachineProductId: 1, PickQty: 5 }] },
      ]),
    expectedUrl: `${BASE}/v1/machines/inventory/picklists/update`,
    expectedMethod: "PUT",
    expectedBody: [
      { MachineId: 12345, Products: [{ MachineProductId: 1, PickQty: 5 }] },
    ],
  },
];

const productCases: Case[] = [
  {
    name: "products.listByOperator",
    call: (c) => c.products.listByOperator(7),
    expectedUrl: `${BASE}/v1/operators/7/products`,
  },
  {
    name: "products.createForOperator",
    call: (c) =>
      c.products.createForOperator(7, { ProductName: "Coke", ProductBarcode: "BC" }),
    expectedUrl: `${BASE}/v1/operators/7/products`,
    expectedMethod: "POST",
    expectedBody: { ProductName: "Coke", ProductBarcode: "BC" },
  },
  {
    name: "products.get",
    call: (c) => c.products.get(999),
    expectedUrl: `${BASE}/v1/products/999`,
  },
  {
    name: "products.update",
    call: (c) => c.products.update(999, { ProductName: "New" }),
    expectedUrl: `${BASE}/v1/products/999`,
    expectedMethod: "PUT",
    expectedBody: { ProductName: "New" },
  },
];

const productGroupCases: Case[] = [
  {
    name: "productGroups.list",
    call: (c) => c.productGroups.list(),
    expectedUrl: `${BASE}/v1/productGroups`,
  },
  {
    name: "productGroups.listByActor",
    call: (c) => c.productGroups.listByActor(42),
    expectedUrl: `${BASE}/v1/operators/42/productGroups`,
  },
  {
    name: "productGroups.get",
    call: (c) => c.productGroups.get(11),
    expectedUrl: `${BASE}/v1/productGroups/11`,
  },
  {
    name: "productGroups.create",
    call: (c) => c.productGroups.create({ ActorID: 42, ProductGroupName: "Snacks" }),
    expectedUrl: `${BASE}/v1/productGroups`,
    expectedMethod: "POST",
    expectedBody: { ActorID: 42, ProductGroupName: "Snacks" },
  },
  {
    name: "productGroups.update",
    call: (c) => c.productGroups.update(11, { ProductGroupName: "Renamed" }),
    expectedUrl: `${BASE}/v1/productGroups/11`,
    expectedMethod: "PUT",
    expectedBody: { ProductGroupName: "Renamed" },
  },
  {
    name: "productGroups.getTax (no filter)",
    call: (c) => c.productGroups.getTax(11),
    expectedUrl: `${BASE}/v1/productGroups/11/tax`,
  },
  {
    name: "productGroups.getTax (with TaxRowID)",
    call: (c) => c.productGroups.getTax(11, { TaxRowID: 5 }),
    expectedUrl: `${BASE}/v1/productGroups/11/tax?TaxRowID=5`,
  },
  {
    name: "productGroups.createTax",
    call: (c) => c.productGroups.createTax(11, [{ CountryID: 250, TaxValue: 20 }]),
    expectedUrl: `${BASE}/v1/productGroups/11/tax`,
    expectedMethod: "POST",
    expectedBody: [{ CountryID: 250, TaxValue: 20 }],
  },
  {
    name: "productGroups.updateTax",
    call: (c) => c.productGroups.updateTax(11, [{ TaxRowID: 1, CountryID: 250 }]),
    expectedUrl: `${BASE}/v1/productGroups/11/tax`,
    expectedMethod: "PUT",
    expectedBody: [{ TaxRowID: 1, CountryID: 250 }],
  },
  {
    name: "productGroups.deleteTax",
    call: (c) => c.productGroups.deleteTax(11, 1),
    expectedUrl: `${BASE}/v1/productGroups/11/tax/1`,
    expectedMethod: "DELETE",
  },
];

function runCases(group: string, cases: Case[]) {
  describe(group, () => {
    for (const tc of cases) {
      it(tc.name, async () => {
        const { client, calls } = build([
          { status: tc.responseStatus ?? 200, body: tc.responseBody ?? [] },
        ]);
        await tc.call(client);
        expect(calls).toHaveLength(1);
        expect(calls[0]!.url).toBe(tc.expectedUrl);
        expect(calls[0]!.init.method ?? "GET").toBe(tc.expectedMethod ?? "GET");
        if (tc.expectedBody !== undefined) {
          expect(JSON.parse(calls[0]!.init.body as string)).toEqual(tc.expectedBody);
        }
      });
    }
  });
}

runCases("machineProducts resource — 5 endpoints", machineProductCases);
runCases("machineInventory resource — 6 endpoints", machineInventoryCases);
runCases("products resource — 4 endpoints", productCases);
runCases("productGroups resource — 9 endpoints", productGroupCases);
