import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import type {
  ApiResult,
  MachineAlert,
  MachineChangeLog,
  MachineLastSale,
  MachinePayment,
  MachineSearchResult,
} from "../../src/types/machine-misc.js";
import type { MachineInfo } from "../../src/types/machine.js";
import type { MachineStatusInfo } from "../../src/types/machine-status.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

const BASE = "https://qa-lynx.nayax.com";

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

describe("machines.list — offset pagination over a bare array", () => {
  it("walks pages until a partial page is returned", async () => {
    const page = (start: number, count: number): Partial<MachineInfo>[] =>
      Array.from({ length: count }, (_, i) => ({ MachineID: start + i, MachineStatusBit: 1 }));
    const { client, calls } = build([
      { status: 200, body: page(1, 100) },
      { status: 200, body: page(101, 100) },
      { status: 200, body: page(201, 17) }, // partial → stop
    ]);
    const all = await client.machines.list({}).collect();
    expect(all).toHaveLength(217);
    expect(calls).toHaveLength(3);
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines?ResultsLimit=100&ResultsOffset=0`,
    );
    expect(calls[1]!.url).toContain("ResultsOffset=100");
    expect(calls[2]!.url).toContain("ResultsOffset=200");
  });

  it("respects pageSize and propagates filters as query params", async () => {
    const { client, calls } = build([
      { status: 200, body: [{ MachineID: 1, MachineStatusBit: 1 }] },
    ]);
    await client.machines.list({ pageSize: 50, MachineName: "Lobby", VposID: 99 }).collect();
    const url = calls[0]!.url;
    expect(url).toContain("ResultsLimit=50");
    expect(url).toContain("MachineName=Lobby");
    expect(url).toContain("VposID=99");
  });

  it("supports maxItems cap", async () => {
    const { client, calls } = build([
      { status: 200, body: Array.from({ length: 100 }, (_, i) => ({ MachineID: i, MachineStatusBit: 1 })) },
    ]);
    const out: Partial<MachineInfo>[] = [];
    for await (const m of client.machines.list({ maxItems: 3 })) out.push(m);
    expect(out).toHaveLength(3);
    expect(calls).toHaveLength(1);
  });
});

describe("machines.create / get / update", () => {
  it("create POSTs to /v1/machines with the body", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 9999, MachineStatusBit: 1 } }]);
    const res = await client.machines.create({ MachineStatusBit: 1, MachineName: "X" });
    expect(res.MachineID).toBe(9999);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      MachineStatusBit: 1,
      MachineName: "X",
    });
  });

  it("get hits /v1/machines/{id}", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 12345, MachineStatusBit: 1 } }]);
    const m = await client.machines.get(12345);
    expect(m.MachineID).toBe(12345);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345`);
  });

  it("update PUTs /v1/machines/{id}", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 12345, MachineStatusBit: 1 } }]);
    await client.machines.update(12345, { MachineStatusBit: 1, Remarks: "test" });
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345`);
  });
});

describe("machines lookup by alternate identifier", () => {
  it("getByDeviceSerial hits /v1/devices/{serial}/machine", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 1, MachineStatusBit: 1 } }]);
    await client.machines.getByDeviceSerial("DEV-001/A");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/devices/DEV-001%2FA/machine`);
  });

  it("getByVposSerial hits /v1/vpos/{serial}/machine", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 1, MachineStatusBit: 1 } }]);
    await client.machines.getByVposSerial("VPOS-42");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/vpos/VPOS-42/machine`);
  });
});

describe("machines.search", () => {
  it("POSTs /v1/machines/search and returns the array", async () => {
    const results: MachineSearchResult[] = [
      { typeID: 1, ID: "x", parentID: null, Disabled: 0, Name: "Lobby" },
    ];
    const { client, calls } = build([{ status: 200, body: results }]);
    const r = await client.machines.search({ Search: "lob" });
    expect(r).toEqual(results);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/search`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ Search: "lob" });
  });
});

describe("machines.getChangeLogs", () => {
  it("GETs /v1/machines/changeLogs with filter params", async () => {
    const logs: MachineChangeLog[] = [
      {
        MachineID: "1",
        ChangedItem: "Remarks",
        ChangedFrom: "a",
        ChangedTo: "b",
        Tab: "general",
        ChangedBy: "user@x",
        UpdatedDt: "2026-05-24T08:00:00Z",
      },
    ];
    const { client, calls } = build([{ status: 200, body: logs }]);
    const r = await client.machines.getChangeLogs({
      MachineID: 12345,
      StartDate: "2026-05-01T00:00:00Z",
      EndDate: "2026-05-24T00:00:00Z",
    });
    expect(r).toEqual(logs);
    const url = calls[0]!.url;
    expect(url).toContain("/operational/v1/machines/changeLogs?");
    expect(url).toContain("MachineID=12345");
    expect(url).toContain("StartDate=2026-05-01T00%3A00%3A00Z");
  });
});

describe("machines status / alerts / sales", () => {
  it("getStatistics hits /v1/machines/{id}/status", async () => {
    const body: Partial<MachineStatusInfo> = { MachineID: 12345, MachineMQTTStatus: true };
    const { client, calls } = build([{ status: 200, body }]);
    const s = await client.machines.getStatistics(12345);
    expect(s.MachineMQTTStatus).toBe(true);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/status`);
  });

  it("getLastAlerts hits /v1/machines/{id}/lastAlerts", async () => {
    const alerts: MachineAlert[] = [
      {
        MachineID: 12345,
        EventDateTimeVMC: null,
        EventDateTimeGMT: "2026-05-24T08:00:00Z",
        EventCode: 42,
        EventLogID: 1,
        EventDescription: "Coil jam",
        EventCategoryName: null,
        EventGroupName: null,
        EventSourceName: null,
        SiteID: null,
        TransactionID: null,
        EventData: null,
        JSONData: null,
      },
    ];
    const { client, calls } = build([{ status: 200, body: alerts }]);
    const r = await client.machines.getLastAlerts(12345);
    expect(r).toEqual(alerts);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/lastAlerts`);
  });

  it("getLastSales hits /v1/machines/{id}/lastSales", async () => {
    const sales: MachineLastSale[] = [
      {
        TransactionID: 1,
        PaymentServiceTransactionID: null,
        PaymentServiceProviderName: null,
        MachineID: 12345,
        MachineName: null,
        MachineNumber: null,
        InstituteLocationName: null,
        AuthorizationValue: 3.5,
        SettlementValue: 3.5,
        CurrencyCode: "USD",
        PaymentMethod: "card",
        RecognitionMethod: null,
        CardNumber: null,
        CardBrand: null,
        CLI: null,
        ProductName: null,
        MultivendTransactionBit: false,
        MultivendNumberOfProducts: null,
        UnitOfMeasurement: null,
        Quantity: 1,
        EnergyConsumed: null,
        AuthorizationDateTimeGMT: null,
        MachineAuthorizationTime: null,
        SettlementDateTimeGMT: null,
        SiteID: null,
        SiteName: null,
      },
    ];
    const { client, calls } = build([{ status: 200, body: sales }]);
    const r = await client.machines.getLastSales(12345);
    expect(r[0]!.AuthorizationValue).toBe(3.5);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/lastSales`);
  });
});

describe("machines payment methods", () => {
  const sample: MachinePayment[] = [
    {
      MachineID: 12345,
      PaymentMethodID: 1,
      ConvenienceFeePercentageBit: true,
      ConvenienceFeeValue: 2.5,
      LastUpdated: null,
      ExternalPaymentProviderUsername: null,
      ExternalPaymentProviderPassword: null,
      ExternalPaymentProviderTerminalID: null,
      ExternalPaymentProviderLocationIdentifier: null,
      PaymentMethodWorkingDays: null,
      PaymentMethodCustomData: null,
      ConvenienceFeeBackupValue: 2.0,
      PaymentMethodQRString: null,
    },
  ];

  it("getPaymentMethods GETs /paymentMethods", async () => {
    const { client, calls } = build([{ status: 200, body: sample }]);
    const r = await client.machines.getPaymentMethods(12345);
    expect(r).toEqual(sample);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/paymentMethods`);
  });

  it("createPaymentMethods POSTs an array body", async () => {
    const { client, calls } = build([{ status: 200, body: sample }]);
    await client.machines.createPaymentMethods(12345, sample);
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(sample);
  });

  it("updatePaymentMethods PUTs an array body", async () => {
    const { client, calls } = build([{ status: 200, body: sample }]);
    await client.machines.updatePaymentMethods(12345, sample);
    expect(calls[0]!.init.method).toBe("PUT");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(sample);
  });

  it("deletePaymentMethod DELETEs the nested path and returns ApiResult", async () => {
    const result: ApiResult = { Ok: true, Message: "deleted", SystemMessage: null, code: null };
    const { client, calls } = build([{ status: 200, body: result }]);
    const r = await client.machines.deletePaymentMethod(12345, 1);
    expect(r.Ok).toBe(true);
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines/12345/paymentMethods/1`,
    );
  });
});
