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
  // List & v1 CRUD
  {
    name: "list (no filters)",
    call: (c) => c.cards.list(),
    expectedUrl: `${BASE}/v1/cards`,
  },
  {
    name: "list (with filters)",
    call: (c) => c.cards.list({ CardEmail: "a@b.c", CardHolderName: "John Doe" }),
    expectedUrl: `${BASE}/v1/cards?CardEmail=a%40b.c&CardHolderName=John+Doe`,
  },
  {
    name: "createVirtual",
    call: (c) => c.cards.createVirtual({ ActorID: 42, CardHolderName: "X" }),
    expectedUrl: `${BASE}/v1/cards`,
    expectedMethod: "POST",
    expectedBody: { ActorID: 42, CardHolderName: "X" },
  },
  {
    name: "update (v1 flat)",
    call: (c) => c.cards.update({ CardID: 1, CardHolderName: "Y" }),
    expectedUrl: `${BASE}/v1/cards`,
    expectedMethod: "PUT",
    expectedBody: { CardID: 1, CardHolderName: "Y" },
  },
  {
    name: "updateByDisplayNumber",
    call: (c) => c.cards.updateByDisplayNumber("12345", { CardHolderName: "Z" }),
    expectedUrl: `${BASE}/v1/cards/12345`,
    expectedMethod: "PUT",
    expectedBody: { CardHolderName: "Z" },
  },
  // Lookups
  {
    name: "getByUniqueIdentifier",
    call: (c) => c.cards.getByUniqueIdentifier("CUI-001"),
    expectedUrl: `${BASE}/v1/cards/uniqueIdentifier/CUI-001`,
  },
  {
    name: "getByDisplayNumber",
    call: (c) => c.cards.getByDisplayNumber("12345"),
    expectedUrl: `${BASE}/v1/cards/displayNumber/12345`,
  },
  // Credit & revalue (GETs)
  {
    name: "getCredit",
    call: (c) => c.cards.getCredit("CUI-001"),
    expectedUrl: `${BASE}/v1/cards/CUI-001/credit`,
  },
  {
    name: "getRevalue",
    call: (c) => c.cards.getRevalue("CUI-001"),
    expectedUrl: `${BASE}/v1/cards/CUI-001/revalue`,
  },
  // Credit & revalue (POSTs with query)
  {
    name: "addCredit",
    call: (c) =>
      c.cards.addCredit("CUI-001", { CardCredit: 10, CreditChangeRemarks: "manual" }),
    expectedUrl: `${BASE}/v1/cards/CUI-001/credit/add?CardCredit=10&CreditChangeRemarks=manual`,
    expectedMethod: "POST",
  },
  {
    name: "addRevalue",
    call: (c) => c.cards.addRevalue("CUI-001", { CardCredit: 5 }),
    expectedUrl: `${BASE}/v1/cards/CUI-001/revalue/add?CardCredit=5`,
    expectedMethod: "POST",
  },
  {
    name: "transferRevalue",
    call: (c) =>
      c.cards.transferRevalue("CUI-A", "CUI-B", { CardCredit: 3, CreditChangeRemarks: "gift" }),
    expectedUrl: `${BASE}/v1/cards/CUI-A/revalue/send/CUI-B?CardCredit=3&CreditChangeRemarks=gift`,
    expectedMethod: "POST",
  },
  // Status & groups
  {
    name: "updateStatus 1=Active",
    call: (c) => c.cards.updateStatus("CUI-001", 1),
    expectedUrl: `${BASE}/v1/cards/CUI-001/status/1`,
    expectedMethod: "POST",
  },
  {
    name: "updateStatus 2=Inactive",
    call: (c) => c.cards.updateStatus("CUI-001", 2),
    expectedUrl: `${BASE}/v1/cards/CUI-001/status/2`,
    expectedMethod: "POST",
  },
  {
    name: "getCardGroups",
    call: (c) => c.cards.getCardGroups(99),
    expectedUrl: `${BASE}/v1/cards/99/cardGroups`,
  },
  {
    name: "updateCardGroups",
    call: (c) =>
      c.cards.updateCardGroups(99, [
        {
          CardGroupEnabledBit: true,
          GroupName: "VIPs",
          CardGroupId: 1,
          GroupDailyLimit: 100,
          UpdatedBy: null,
          LastUpdated: null,
        },
      ]),
    expectedUrl: `${BASE}/v1/cards/99/cardGroups`,
    expectedMethod: "PUT",
  },
  // Prepaid + validation + latest tx
  {
    name: "getPrepaid",
    call: (c) => c.cards.getPrepaid(99),
    expectedUrl: `${BASE}/v1/cards/99/prepaid`,
  },
  {
    name: "updatePrepaid",
    call: (c) => c.cards.updatePrepaid(99, { CardID: 99, CardCredit: 50 }),
    expectedUrl: `${BASE}/v1/cards/99/prepaid`,
    expectedMethod: "PUT",
    expectedBody: { CardID: 99, CardCredit: 50 },
  },
  {
    name: "validateForMachine with cardId",
    call: (c) => c.cards.validateForMachine(12345, { cardId: 99 }),
    expectedUrl: `${BASE}/v1/cards/validate-machine/12345?cardId=99`,
  },
  {
    name: "validateForMachine with cardUniqueIdentifier",
    call: (c) => c.cards.validateForMachine(12345, { cardUniqueIdentifier: "CUI-1" }),
    expectedUrl: `${BASE}/v1/cards/validate-machine/12345?cardUniqueIdentifier=CUI-1`,
  },
  {
    name: "getLatestCreditCardTransactions sends string body",
    call: (c) =>
      c.cards.getLatestCreditCardTransactions("abc123base64==", { minutes: 60 }),
    expectedUrl: `${BASE}/v1/cards/query?minutes=60`,
    expectedMethod: "POST",
    expectedBody: "abc123base64==",
  },
  // v2 nested CRUD
  {
    name: "createV2",
    call: (c) =>
      c.cards.createV2({
        CardDetails: { ActorID: 42, CardUniqueIdentifier: "CUI-NEW", Status: 1 },
      }),
    expectedUrl: `${BASE}/v2/cards`,
    expectedMethod: "POST",
    expectedBody: {
      CardDetails: { ActorID: 42, CardUniqueIdentifier: "CUI-NEW", Status: 1 },
    },
  },
  {
    name: "updateById",
    call: (c) =>
      c.cards.updateById(99, {
        CardDetails: { Notes: "VIP" },
        CardCreditAttributes: { Credit: 100 },
      }),
    expectedUrl: `${BASE}/v2/cards/99`,
    expectedMethod: "PUT",
    expectedBody: {
      CardDetails: { Notes: "VIP" },
      CardCreditAttributes: { Credit: 100 },
    },
  },
];

describe("cards resource — 20 endpoints", () => {
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
