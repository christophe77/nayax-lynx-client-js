import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import type { DeviceExtra, DevicesMoveResponse } from "../../src/types/device.js";
import type { EReceiptRequest, EReceiptResponse } from "../../src/types/ereceipt.js";
import type {
  EventRulesLynxModelResponse,
  UploadPictureResponse,
} from "../../src/types/metadata.js";
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

// ──────────────────────────────────────────────────────────────────────────
// Machine Attribute — the 3 newly-added endpoints
// ──────────────────────────────────────────────────────────────────────────

describe("machines.attributes — newly-added endpoints", () => {
  it("getSpecific hits /v1/machines/{id}/attributes/{attrId}", async () => {
    const attr = {
      DeviceAttributeID: 7,
      MachineID: 12345,
      DeviceAttributeValue: "v",
      DeviceAttributeCodeID: 1,
      DeviceAttributeName: "x",
      DeviceAttributeGroup: "g",
      DeviceAttributeReadOnlyBit: false,
    };
    const { client, calls } = build([{ status: 200, body: attr }]);
    const r = await client.machines.attributes.getSpecific(12345, 7);
    expect(r.DeviceAttributeID).toBe(7);
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines/12345/attributes/7`,
    );
  });

  it("updateSpecific PUTs body to /v1/machines/{id}/attributes/{attrId}", async () => {
    const { client, calls } = build([
      { status: 200, body: { DeviceAttributeID: 7, MachineID: 12345, DeviceAttributeReadOnlyBit: false } },
    ]);
    await client.machines.attributes.updateSpecific(12345, 7, {
      DeviceAttributeID: 7,
      DeviceAttributeValue: "new",
    });
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/machines/12345/attributes/7`,
    );
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      DeviceAttributeID: 7,
      DeviceAttributeValue: "new",
    });
  });

  it("insertOrUpdate POSTs the array body to /v2/machines/attributes", async () => {
    const result: ApiResult = { Ok: true, Message: null, SystemMessage: null, code: null };
    const { client, calls } = build([{ status: 200, body: result }]);
    const r = await client.machines.attributes.insertOrUpdate([
      { MachineIds: [1, 2, 3], Attributes: [{ Id: 10, Value: "42" }], UpdateValues: true },
    ]);
    expect(r.Ok).toBe(true);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v2/machines/attributes`);
    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body[0].MachineIds).toEqual([1, 2, 3]);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Devices — 4 endpoints
// ──────────────────────────────────────────────────────────────────────────

describe("devices resource", () => {
  it("list paginates via pageNumber/pageSize 1-indexed", async () => {
    const page = (start: number, count: number): Partial<DeviceExtra>[] =>
      Array.from({ length: count }, (_, i) => ({ DeviceID: start + i, IsDeviceExists: true }));
    const { client, calls } = build([
      { status: 200, body: page(1, 100) },
      { status: 200, body: page(101, 30) }, // partial → stop
    ]);
    const all = await client.devices.list({ ActorId: 42 }).collect();
    expect(all).toHaveLength(130);
    expect(calls[0]!.url).toBe(
      `${BASE}/operational/v1/devices?ActorId=42&pageSize=100&pageNumber=1`,
    );
    expect(calls[1]!.url).toContain("pageNumber=2");
  });

  it("list passes optional filters and respects pageSize", async () => {
    const { client, calls } = build([{ status: 200, body: [] }]);
    await client.devices.list({
      pageSize: 50,
      isConnected: true,
      imei: "356938035643809",
    }).collect();
    const url = calls[0]!.url;
    expect(url).toContain("isConnected=true");
    expect(url).toContain("imei=356938035643809");
    expect(url).toContain("pageSize=50");
    expect(url).toContain("pageNumber=1");
  });

  it("get hits /v1/devices/{id}", async () => {
    const { client, calls } = build([{ status: 200, body: { DeviceID: 7, IsDeviceExists: true } }]);
    const r = await client.devices.get(7);
    expect(r.DeviceID).toBe(7);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/devices/7`);
  });

  it("update PUTs the DevicesUpdateDto body", async () => {
    const { client, calls } = build([{ status: 200, body: { DeviceID: 7, IsDeviceExists: true } }]);
    await client.devices.update(7, { ActorID: 100, StatusID: 1 });
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/devices/7`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ ActorID: 100, StatusID: 1 });
  });

  it("moveToActor PUTs the array of serials to /v1/devices/move/{actorId}", async () => {
    const result: DevicesMoveResponse[] = [
      { HW_serial: "DEV-001", actor_id: 555, is_connected: true },
    ];
    const { client, calls } = build([{ status: 200, body: result }]);
    const r = await client.devices.moveToActor(555, ["DEV-001", "DEV-002"]);
    expect(r).toEqual(result);
    expect(calls[0]!.init.method).toBe("PUT");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/devices/move/555`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(["DEV-001", "DEV-002"]);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// EReceipt
// ──────────────────────────────────────────────────────────────────────────

describe("ereceipt resource", () => {
  it("generate POSTs the request and returns the response", async () => {
    const body: EReceiptRequest = {
      TrasactionID: 999,
      TransactionDateTime: "2026-05-27T08:00:00Z",
      TrasactionSiteID: 12,
      MachineID: 12345,
      Email: "buyer@example.com",
    };
    const response: EReceiptResponse = {
      ReceiptURL: "https://r.nayax.com/abc",
      EmailSent: true,
      EreceiptID: 1,
    };
    const { client, calls } = build([{ status: 200, body: response }]);
    const r = await client.ereceipt.generate(body);
    expect(r.EreceiptID).toBe(1);
    expect(r.EmailSent).toBe(true);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/ereceipt/generate`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(body);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────────────────────────────────

describe("metadata resource", () => {
  it("getEventRules hits the documented (oddly-prefixed) /v1/metadata/v1/event-rules", async () => {
    const rules: EventRulesLynxModelResponse[] = [
      {
        EventRuleId: 1,
        EventRuleName: "Door opened",
        EventCode: 42,
        EventSource: 1,
        EvetnCategoryId: 7,
        GroupCategoryId: 2,
        EventRuleStatusId: 1,
        EventDescription: null,
      },
    ];
    const { client, calls } = build([{ status: 200, body: rules }]);
    const r = await client.metadata.getEventRules();
    expect(r).toEqual(rules);
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/metadata/v1/event-rules`);
  });

  it("uploadPicture POSTs the request and returns the URLs map", async () => {
    const response: UploadPictureResponse = {
      ImageTypeLutId: 5,
      Key: "abc",
      KeyName: "logo.png",
      Urls: { thumb: "https://x/y.png", full: "https://x/y_full.png" },
    };
    const { client, calls } = build([{ status: 200, body: response }]);
    const r = await client.metadata.uploadPicture({
      ImageTypeLutId: 5,
      Image: "data:image/png;base64,iVBORw0...",
      IsMonyx: false,
    });
    expect(r.Urls?.thumb).toBe("https://x/y.png");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/metadata/upload-picture`);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Sign In
// ──────────────────────────────────────────────────────────────────────────

describe("signIn resource", () => {
  it("signin GETs /signin (NOT /v1/signin)", async () => {
    const { client, calls } = build([{ status: 200, body: { ok: true } }]);
    await client.signIn.signin();
    // Note: NO /v1/ in the path — this endpoint sits directly on /operational
    expect(calls[0]!.url).toBe(`${BASE}/operational/signin`);
  });

  it("userSignIn POSTs /v1/signin with usr/pwd", async () => {
    const { client, calls } = build([{ status: 200, body: { ok: true } }]);
    await client.signIn.userSignIn({ usr: "alice", pwd: "s3cret" });
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toBe(`${BASE}/operational/v1/signin`);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ usr: "alice", pwd: "s3cret" });
  });
});
