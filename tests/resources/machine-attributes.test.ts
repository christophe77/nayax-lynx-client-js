import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import type {
  BulkUpdateResponse,
  MachineAttribute,
} from "../../src/types/machine-attribute.js";
import type { ApiResult } from "../../src/types/machine-misc.js";
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

describe("machines.attributes", () => {
  it("is exposed as a sub-resource on machines", () => {
    const { client } = build([]);
    expect(client.machines.attributes).toBeDefined();
    expect(typeof client.machines.attributes.list).toBe("function");
  });

  it("list GETs /v1/machines/{id}/attributes and returns the array", async () => {
    const attrs: MachineAttribute[] = [
      {
        DeviceAttributeID: 10,
        MachineID: 12345,
        DeviceAttributeValue: "42",
        DeviceAttributeCodeID: 1,
        DeviceAttributeName: "Sensitivity",
        DeviceAttributeGroup: "vending",
        DeviceAttributeReadOnlyBit: false,
      },
    ];
    const { client, calls } = build([{ status: 200, body: attrs }]);
    const r = await client.machines.attributes.list(12345);
    expect(r).toEqual(attrs);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/attributes`);
  });

  it("bulkUpdate PUTs an array body and returns a BulkUpdateResponse", async () => {
    const response: BulkUpdateResponse = {
      isFullySuccess: false,
      failureItems: [{ id: "10", error: "out of range" }],
    };
    const { client, calls } = build([{ status: 200, body: response }]);
    const r = await client.machines.attributes.bulkUpdate(12345, [
      { DeviceAttributeID: 10, DeviceAttributeValue: "99" },
      { DeviceAttributeID: 11, DeviceAttributeValue: "1" },
    ]);
    expect(r).toEqual(response);
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/machines/12345/attributes`);
    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body).toHaveLength(2);
    expect(body[0].DeviceAttributeID).toBe(10);
  });

  it("resetToDefaults POSTs /attributes/defaults", async () => {
    const ok: ApiResult = { Ok: true, Message: null, SystemMessage: null, code: null };
    const { client, calls } = build([{ status: 200, body: ok }]);
    const r = await client.machines.attributes.resetToDefaults(12345);
    expect(r.Ok).toBe(true);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines/12345/attributes/defaults`,
    );
    // POST with no body — no Content-Type header expected
    expect((calls[0]!.init.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
  });

  it("resendConfig POSTs /attributes/resendConfig", async () => {
    const ok: ApiResult = { Ok: true, Message: "queued", SystemMessage: null, code: null };
    const { client, calls } = build([{ status: 200, body: ok }]);
    const r = await client.machines.attributes.resendConfig(12345);
    expect(r.Message).toBe("queued");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines/12345/attributes/resendConfig`,
    );
  });
});
