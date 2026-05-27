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
}

const cases: Case[] = [
  // Basic CRUD
  {
    name: "get",
    call: (c) => c.actors.get(42),
    expectedUrl: `${BASE}/v1/actors/42`,
  },
  {
    name: "update",
    call: (c) => c.actors.update(42, { ActorDescription: "Renamed" }),
    expectedUrl: `${BASE}/v1/actors/42`,
    expectedMethod: "PUT",
    expectedBody: { ActorDescription: "Renamed" },
  },
  {
    name: "getByActorCode",
    call: (c) => c.actors.getByActorCode(99999),
    expectedUrl: `${BASE}/v1/actors?ActorCode=99999`,
  },
  {
    name: "create (v1, under parent)",
    call: (c) => c.actors.create(1, { ActorDescription: "Child", ActorCode: 1234 }),
    expectedUrl: `${BASE}/v1/actors/1`,
    expectedMethod: "POST",
    expectedBody: { ActorDescription: "Child", ActorCode: 1234 },
  },
  {
    name: "createV2 (nested DTO)",
    call: (c) =>
      c.actors.createV2(1, {
        ActorDetails: {
          ActorCode: 12345,
          ActorTypeID: 7,
          StatusID: 1,
          CurrencyID: 1,
          TimeZoneKey: 35,
          CountryID: 250,
          CultureID: 6,
          GeoOverrideInheritanceBit: false,
          GeoZoom: 12,
          LanguageID: 8,
        },
      }),
    expectedUrl: `${BASE}/v2/actors/1`,
    expectedMethod: "POST",
  },
  // Payment methods
  {
    name: "getPaymentMethods",
    call: (c) => c.actors.getPaymentMethods(42),
    expectedUrl: `${BASE}/v1/actors/42/paymentMethods`,
  },
  {
    name: "createPaymentMethods",
    call: (c) =>
      c.actors.createPaymentMethods(42, [
        {
          ActorID: 42,
          PaymentMethodID: 1,
          ExtraChargePercentageBit: true,
          ExtraChargeValue: 1.5,
          LastUpdated: null,
          ExternalPaymentProviderURL: null,
          ExternalPaymentProviderID: null,
          ExternalPaymentProviderModeID: null,
          ExternalPaymentProviderUsername: null,
          ExternalPaymentProviderPassword: null,
          ExternalPaymentProviderMerchantID: null,
          ExternalPaymentProviderKey: null,
          ExternalPaymentProviderAppID: null,
          ExternalPaymentProviderCertificatePath: null,
          ExternalPaymentProviderCertificatePassword: null,
          ExternalPaymentProviderApiKey: null,
          ExternalPaymentProviderLocationIdentifier: null,
          PaymentMethodWorkingDays: null,
          PaymentMethodCustomData: null,
          ExtraChargeBackupValue: 1.0,
          ChargeMachineID: null,
        },
      ]),
    expectedUrl: `${BASE}/v1/actors/42/paymentMethods`,
    expectedMethod: "POST",
  },
  {
    name: "updatePaymentMethods (PUT array)",
    call: (c) => c.actors.updatePaymentMethods(42, []),
    expectedUrl: `${BASE}/v1/actors/42/paymentMethods`,
    expectedMethod: "PUT",
    expectedBody: [],
  },
  {
    name: "deletePaymentMethod",
    call: (c) => c.actors.deletePaymentMethod(42, 1),
    expectedUrl: `${BASE}/v1/actors/42/paymentMethods/1`,
    expectedMethod: "DELETE",
  },
  // EV dashboard
  {
    name: "getEvDashboard (no filters)",
    call: (c) => c.actors.getEvDashboard(42),
    expectedUrl: `${BASE}/v1/actors/42/evDashboard`,
  },
  {
    name: "getEvDashboard (filtered)",
    call: (c) =>
      c.actors.getEvDashboard(42, {
        StartDate: "2026-05-01T00:00:00Z",
        EndDate: "2026-05-27T00:00:00Z",
        MachineID: 12345,
        TimePeriod: 24,
      }),
    expectedUrl: `${BASE}/v1/actors/42/evDashboard?StartDate=2026-05-01T00%3A00%3A00Z&EndDate=2026-05-27T00%3A00%3A00Z&MachineID=12345&TimePeriod=24`,
  },
  // Hierarchy
  {
    name: "getHierarchy (no filter)",
    call: (c) => c.actors.getHierarchy(),
    expectedUrl: `${BASE}/v1/actors/hierarchy`,
  },
  {
    name: "getHierarchy (with filters)",
    call: (c) => c.actors.getHierarchy({ ActorID: 1, StatusID: 1, HierarchyLevelLimit: 3 }),
    expectedUrl: `${BASE}/v1/actors/hierarchy?ActorID=1&StatusID=1&HierarchyLevelLimit=3`,
  },
  // Encryption keys (typo'd paths preserved)
  {
    name: "getEncryptionKeys",
    call: (c) => c.actors.getEncryptionKeys(42),
    expectedUrl: `${BASE}/v1/actors/GetEncKeys?actorID=42`,
  },
  {
    name: "generateEncryptionKey (typo'd 'GenarateEncKey')",
    call: (c) => c.actors.generateEncryptionKey(42),
    expectedUrl: `${BASE}/v1/actors/GenarateEncKey?actorID=42`,
    expectedMethod: "PUT",
  },
  {
    name: "decryptMessageByVersion sends string body + query params",
    call: (c) => c.actors.decryptMessageByVersion(42, 3, "encrypted-blob"),
    expectedUrl: `${BASE}/v1/actors/DecryptionMessageByVer?actorID=42&encVer=3`,
    expectedMethod: "PUT",
    expectedBody: "encrypted-blob",
  },
  // Machine groups (singular `actor` in path)
  {
    name: "listMachineGroups (singular `actor` in path)",
    call: (c) => c.actors.listMachineGroups(42),
    expectedUrl: `${BASE}/v1/actor/42/machineGroups`,
  },
  {
    name: "addMachineGroup",
    call: (c) =>
      c.actors.addMachineGroup(42, { MachineGroupName: "Lobbies", MachineGroupStatus: 1 }),
    expectedUrl: `${BASE}/v1/actor/42/machineGroups`,
    expectedMethod: "POST",
    expectedBody: { MachineGroupName: "Lobbies", MachineGroupStatus: 1 },
  },
  {
    name: "updateMachineGroup",
    call: (c) =>
      c.actors.updateMachineGroup(42, {
        MachineGroupId: 7,
        MachineGroupName: "Renamed",
        MachineGroupStatus: 1,
      }),
    expectedUrl: `${BASE}/v1/actor/42/machineGroups`,
    expectedMethod: "PUT",
  },
  // Role groups (plural `actors` in path)
  {
    name: "listRoleGroups",
    call: (c) => c.actors.listRoleGroups(42),
    expectedUrl: `${BASE}/v1/actors/42/roleGroups`,
  },
  {
    name: "addRoleGroups",
    call: (c) => c.actors.addRoleGroups(42, [{ RoleGroupId: 1 }, { RoleGroupId: 2 }]),
    expectedUrl: `${BASE}/v1/actors/42/roleGroups`,
    expectedMethod: "POST",
    expectedBody: [{ RoleGroupId: 1 }, { RoleGroupId: 2 }],
  },
  {
    name: "deleteRoleGroups (DELETE with JSON body)",
    call: (c) => c.actors.deleteRoleGroups(42, [{ RoleGroupId: 1 }]),
    expectedUrl: `${BASE}/v1/actors/42/roleGroups`,
    expectedMethod: "DELETE",
    expectedBody: [{ RoleGroupId: 1 }],
  },
];

describe("actors resource — 20 endpoints", () => {
  for (const tc of cases) {
    it(tc.name, async () => {
      const { client, calls } = build([{ status: 200, body: [] }]);
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
