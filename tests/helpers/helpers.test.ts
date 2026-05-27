import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import type { MachineInfo, UpdateMachineInfoBody } from "../../src/types/machine.js";
import { makeFetchMock } from "./mock-fetch.js";

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

describe("client config", () => {
  it("uses the documented /operational/v1 base path on QA", async () => {
    const { client, calls } = build([{ status: 200, body: { MachineID: 12345, MachineStatusBit: 1 } }]);
    await client.machines.get(12345);
    expect(calls[0]!.url).toBe("https://qa-lynx.nayax.com/operational/v1/machines/12345");
  });

  it("uses prod base URL with the same documented path", async () => {
    const { fetch, calls } = makeFetchMock([{ status: 200, body: { MachineID: 1, MachineStatusBit: 1 } }]);
    const client = new NayaxLynxClient({
      environment: "prod",
      auth: { type: "static", token: "T" },
      fetch,
      retry: { maxRetries: 0, initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1 },
    });
    await client.machines.get(1);
    expect(calls[0]!.url).toBe("https://lynx.nayax.com/operational/v1/machines/1");
  });

  it("throws if neither baseUrl nor environment is provided", () => {
    expect(
      () =>
        new NayaxLynxClient({
          auth: { type: "static", token: "T" },
        }),
    ).toThrow();
  });
});

describe("machines resource — confirmed endpoints", () => {
  it("get returns the MachineInfo payload as-is", async () => {
    const sample: Partial<MachineInfo> = {
      MachineID: 12345,
      MachineName: "Vending Unit A",
      MachineNumber: "VU-2024-001",
      MachineStatusBit: 1,
      LanguageID: 7,
      GeoLatitude: 40.7128,
      GeoLongitude: -74.006,
      GeoCity: "New York",
    };
    const { client } = build([{ status: 200, body: sample }]);
    const m = await client.machines.get(12345);
    expect(m.MachineID).toBe(12345);
    expect(m.GeoCity).toBe("New York");
  });

  it("update sends PUT with the JSON body and returns the persisted record", async () => {
    const body: UpdateMachineInfoBody = {
      MachineStatusBit: 1,
      MachineName: "Renamed",
      Remarks: "Updated location",
    };
    const persisted = { ...body, MachineID: 12345, LastUpdated: "2024-01-15T10:30:00Z" };
    const { client, calls } = build([{ status: 200, body: persisted }]);
    const res = await client.machines.update(12345, body);
    expect(res.MachineID).toBe(12345);
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe("https://qa-lynx.nayax.com/operational/v1/machines/12345");
    expect((calls[0]!.init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(body);
  });
});

describe("helpers — inferred endpoints", () => {
  it("getTransactionsByMachine paginates and flattens", async () => {
    const { client, calls } = build([
      {
        status: 200,
        body: {
          items: [
            { id: "t1", machineId: 1, timestamp: "2026-05-01T00:00:00Z", amount: 1, currency: "USD" },
            { id: "t2", machineId: 1, timestamp: "2026-05-01T00:01:00Z", amount: 2, currency: "USD" },
          ],
          nextCursor: "c2",
        },
      },
      {
        status: 200,
        body: {
          items: [
            { id: "t3", machineId: 1, timestamp: "2026-05-01T00:02:00Z", amount: 3, currency: "USD" },
          ],
          nextCursor: null,
        },
      },
    ]);

    const txs = await client.getTransactionsByMachine(1, {
      from: "2026-05-01T00:00:00Z",
      to: "2026-05-02T00:00:00Z",
    });
    expect(txs.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
    expect(calls[0]!.url).toContain("machineId=1");
    expect(calls[0]!.url).toContain("from=2026-05-01T00%3A00%3A00Z");
    expect(calls[1]!.url).toContain("cursor=c2");
  });

  it("getTransactionsByMachine respects maxItems", async () => {
    const { client, calls } = build([
      {
        status: 200,
        body: { items: [{ id: "a" }, { id: "b" }, { id: "c" }], nextCursor: "x" },
      },
    ]);
    const out = await client.getTransactionsByMachine(
      1,
      { from: "x", to: "y" },
      { maxItems: 2 },
    );
    expect(out.map((t: { id: string }) => t.id)).toEqual(["a", "b"]);
    expect(calls).toHaveLength(1);
  });

  it("getMachineTelemetry calls the right path", async () => {
    const { client, calls } = build([
      {
        status: 200,
        body: { machineId: 1, collectedAt: "2026-05-24T08:00:00Z", temperatureC: 4 },
      },
    ]);
    const t = await client.getMachineTelemetry(1);
    expect(t.temperatureC).toBe(4);
    expect(calls[0]!.url).toBe(
      "https://qa-lynx.nayax.com/operational/v1/machines/1/telemetry",
    );
  });

  it("updateInventory PUTs the planogram", async () => {
    const { client, calls } = build([
      {
        status: 200,
        body: { machineId: 1, slots: [], revision: "r2" },
      },
    ]);
    const res = await client.updateInventory(1, {
      machineId: 1,
      slots: [{ selection: "A1", productId: "p1", capacity: 10, currentQty: 8 }],
    });
    expect(res.revision).toBe("r2");
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(
      "https://qa-lynx.nayax.com/operational/v1/machines/1/planogram",
    );
    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body.slots[0].selection).toBe("A1");
  });

  it("updateInventory rejects mismatched machineId", async () => {
    const { client } = build([]);
    await expect(
      client.updateInventory(1, { machineId: 999, slots: [] }),
    ).rejects.toThrow(/does not match/);
  });
});
