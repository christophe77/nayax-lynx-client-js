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
}

const cases: Case[] = [
  // Actor types
  {
    name: "getActorTypes (no filter)",
    call: (c) => c.lookups.getActorTypes(),
    expectedUrl: `${BASE}/v1/actorTypes`,
  },
  {
    name: "getActorTypes (with filter)",
    call: (c) => c.lookups.getActorTypes({ ActorTypeID: 5 }),
    expectedUrl: `${BASE}/v1/actorTypes?ActorTypeID=5`,
  },
  // Lookup types / values
  {
    name: "getLookupTypes",
    call: (c) => c.lookups.getLookupTypes({ LutTypeID: 1 }),
    expectedUrl: `${BASE}/v1/lookupTypes?LutTypeID=1`,
  },
  {
    name: "getMachineModels",
    call: (c) => c.lookups.getMachineModels(),
    expectedUrl: `${BASE}/v1/lookupTypes/machineModels`,
  },
  {
    name: "getLookupValues by LutTypeID",
    call: (c) => c.lookups.getLookupValues(7),
    expectedUrl: `${BASE}/v1/lookupTypes/7/values`,
  },
  {
    name: "getLookupValue single",
    call: (c) => c.lookups.getLookupValue(99),
    expectedUrl: `${BASE}/v1/lookups/values/99`,
  },
  // Time zones
  {
    name: "getTimeZones",
    call: (c) => c.lookups.getTimeZones({ TimeZoneOffset: -5 }),
    expectedUrl: `${BASE}/v1/timeZones?TimeZoneOffset=-5`,
  },
  {
    name: "getTimeZoneByKey",
    call: (c) => c.lookups.getTimeZoneByKey(42),
    expectedUrl: `${BASE}/v1/timeZones/42`,
  },
  // Countries
  {
    name: "getCountries with filters",
    call: (c) => c.lookups.getCountries({ CountryID: 1, DialCode: 1 }),
    expectedUrl: `${BASE}/v1/countries?CountryID=1&DialCode=1`,
  },
  {
    name: "getCountryByCode",
    call: (c) => c.lookups.getCountryByCode("US"),
    expectedUrl: `${BASE}/v1/countries/US`,
  },
  // Currencies
  {
    name: "getCurrencies",
    call: (c) => c.lookups.getCurrencies(),
    expectedUrl: `${BASE}/v1/currencies`,
  },
  {
    name: "getCurrencyByCode",
    call: (c) => c.lookups.getCurrencyByCode("EUR"),
    expectedUrl: `${BASE}/v1/currencies/EUR`,
  },
  // Providers
  {
    name: "getBillingProviders",
    call: (c) => c.lookups.getBillingProviders({ BillingProviderID: 3 }),
    expectedUrl: `${BASE}/v1/billingProviders?BillingProviderID=3`,
  },
  {
    name: "getPaymentMethods",
    call: (c) => c.lookups.getPaymentMethods(),
    expectedUrl: `${BASE}/v1/paymentMethods`,
  },
  // Geography
  {
    name: "getStates filtered",
    call: (c) => c.lookups.getStates({ CountryID: 1 }),
    expectedUrl: `${BASE}/v1/states?CountryID=1`,
  },
  {
    name: "getRegions",
    call: (c) => c.lookups.getRegions(),
    expectedUrl: `${BASE}/v1/regions`,
  },
  {
    name: "getCities filtered",
    call: (c) => c.lookups.getCities({ CountryID: 250 }),
    expectedUrl: `${BASE}/v1/cities?CountryID=250`,
  },
  // Groups & roles
  {
    name: "getGroups",
    call: (c) => c.lookups.getGroups(),
    expectedUrl: `${BASE}/v1/groups`,
  },
  {
    name: "getGroupRoles (singular `group` path)",
    call: (c) => c.lookups.getGroupRoles(11),
    expectedUrl: `${BASE}/v1/group/11/roles`,
  },
];

describe("lookups resource — 18 endpoints", () => {
  for (const tc of cases) {
    it(tc.name, async () => {
      const { client, calls } = build([{ status: 200, body: [] }]);
      await tc.call(client);
      expect(calls).toHaveLength(1);
      expect(calls[0]!.url).toBe(tc.expectedUrl);
      expect(calls[0]!.init.method ?? "GET").toBe(tc.expectedMethod ?? "GET");
    });
  }

  it("decodes a sample CountryCodes payload through the type", async () => {
    const { client } = build([
      {
        status: 200,
        body: [
          {
            CountryID: 250,
            CountryCode: "US",
            CountryName: "United States",
            CountryDialingCode: 1,
            CountryReference: null,
            CountryISONumericCode: 840,
          },
        ],
      },
    ]);
    const [first] = await client.lookups.getCountries();
    expect(first?.CountryCode).toBe("US");
  });
});
