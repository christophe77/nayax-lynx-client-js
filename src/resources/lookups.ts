import type { HttpClient } from "../http/http-client.js";
import type {
  ActorType,
  BillingProvidersDbEntity,
  CitiesDbEntity,
  CountryCodes,
  Currency,
  GroupsDbEntity,
  Lookup,
  LookupType,
  MachineModelsDbEntity,
  PaymentMethodDbEntity,
  RegionsDbEntity,
  RolesDbEntity,
  TimeZoneInfo,
} from "../types/lookups.js";

/**
 * `Lookups` resource (18 endpoints, all confirmed against the Nayax devzone docs).
 *
 * Convention: every list method accepts an optional filter param matching the
 * upstream query-string name. Detail methods (e.g. `getCountryByCode`) take
 * the path parameter directly.
 */
export class LookupsResource {
  constructor(private readonly http: HttpClient) {}

  // ─── Actor types ─────────────────────────────────────────────────────────

  /** `GET /v1/actorTypes` — filter optionally by `ActorTypeID`. */
  getActorTypes(params: { ActorTypeID?: number } = {}): Promise<ActorType[]> {
    const query: Record<string, number | undefined> = {};
    if (params.ActorTypeID !== undefined) query.ActorTypeID = params.ActorTypeID;
    return this.http.request<ActorType[]>({
      method: "GET",
      path: "/v1/actorTypes",
      query,
    });
  }

  // ─── Lookup types & values ───────────────────────────────────────────────

  /** `GET /v1/lookupTypes` — list (or filter by `LutTypeID`). */
  getLookupTypes(params: { LutTypeID?: number } = {}): Promise<LookupType[]> {
    const query: Record<string, number | undefined> = {};
    if (params.LutTypeID !== undefined) query.LutTypeID = params.LutTypeID;
    return this.http.request<LookupType[]>({
      method: "GET",
      path: "/v1/lookupTypes",
      query,
    });
  }

  /** `GET /v1/lookupTypes/machineModels` — filter optionally by `MachineModeID`. */
  getMachineModels(
    params: { MachineModeID?: number } = {},
  ): Promise<MachineModelsDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.MachineModeID !== undefined) query.MachineModeID = params.MachineModeID;
    return this.http.request<MachineModelsDbEntity[]>({
      method: "GET",
      path: "/v1/lookupTypes/machineModels",
      query,
    });
  }

  /** `GET /v1/lookupTypes/{LutTypeID}/values`. */
  getLookupValues(lutTypeId: number): Promise<Lookup[]> {
    return this.http.request<Lookup[]>({
      method: "GET",
      path: `/v1/lookupTypes/${lutTypeId}/values`,
    });
  }

  /** `GET /v1/lookups/values/{LutID}` — single lookup row. */
  getLookupValue(lutId: number): Promise<Lookup> {
    return this.http.request<Lookup>({
      method: "GET",
      path: `/v1/lookups/values/${lutId}`,
    });
  }

  // ─── Time zones ──────────────────────────────────────────────────────────

  /** `GET /v1/timeZones` — filter optionally by `TimeZoneOffset` (hours). */
  getTimeZones(params: { TimeZoneOffset?: number } = {}): Promise<TimeZoneInfo[]> {
    const query: Record<string, number | undefined> = {};
    if (params.TimeZoneOffset !== undefined) query.TimeZoneOffset = params.TimeZoneOffset;
    return this.http.request<TimeZoneInfo[]>({
      method: "GET",
      path: "/v1/timeZones",
      query,
    });
  }

  /** `GET /v1/timeZones/{TimeZoneKey}`. */
  getTimeZoneByKey(timeZoneKey: number): Promise<TimeZoneInfo> {
    return this.http.request<TimeZoneInfo>({
      method: "GET",
      path: `/v1/timeZones/${timeZoneKey}`,
    });
  }

  // ─── Countries & currencies ──────────────────────────────────────────────

  /** `GET /v1/countries` — filter optionally by `CountryID` or `DialCode`. */
  getCountries(
    params: { CountryID?: number; DialCode?: number } = {},
  ): Promise<CountryCodes[]> {
    const query: Record<string, number | undefined> = {};
    if (params.CountryID !== undefined) query.CountryID = params.CountryID;
    if (params.DialCode !== undefined) query.DialCode = params.DialCode;
    return this.http.request<CountryCodes[]>({
      method: "GET",
      path: "/v1/countries",
      query,
    });
  }

  /** `GET /v1/countries/{CountryCode}`. */
  getCountryByCode(countryCode: string): Promise<CountryCodes> {
    return this.http.request<CountryCodes>({
      method: "GET",
      path: `/v1/countries/${encodeURIComponent(countryCode)}`,
    });
  }

  /** `GET /v1/currencies` — filter optionally by `CurrencyID`. */
  getCurrencies(params: { CurrencyID?: number } = {}): Promise<Currency[]> {
    const query: Record<string, number | undefined> = {};
    if (params.CurrencyID !== undefined) query.CurrencyID = params.CurrencyID;
    return this.http.request<Currency[]>({
      method: "GET",
      path: "/v1/currencies",
      query,
    });
  }

  /** `GET /v1/currencies/{CurrencyCode}`. */
  getCurrencyByCode(currencyCode: string): Promise<Currency> {
    return this.http.request<Currency>({
      method: "GET",
      path: `/v1/currencies/${encodeURIComponent(currencyCode)}`,
    });
  }

  // ─── Providers / payment methods ─────────────────────────────────────────

  /** `GET /v1/billingProviders` — filter optionally by `BillingProviderID`. */
  getBillingProviders(
    params: { BillingProviderID?: number } = {},
  ): Promise<BillingProvidersDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.BillingProviderID !== undefined) query.BillingProviderID = params.BillingProviderID;
    return this.http.request<BillingProvidersDbEntity[]>({
      method: "GET",
      path: "/v1/billingProviders",
      query,
    });
  }

  /** `GET /v1/paymentMethods` — filter optionally by `PaymentMethodID`. */
  getPaymentMethods(
    params: { PaymentMethodID?: number } = {},
  ): Promise<PaymentMethodDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.PaymentMethodID !== undefined) query.PaymentMethodID = params.PaymentMethodID;
    return this.http.request<PaymentMethodDbEntity[]>({
      method: "GET",
      path: "/v1/paymentMethods",
      query,
    });
  }

  // ─── Geography ───────────────────────────────────────────────────────────

  /** `GET /v1/states` — filter optionally by `CountryID`. */
  getStates(params: { CountryID?: number } = {}): Promise<RegionsDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.CountryID !== undefined) query.CountryID = params.CountryID;
    return this.http.request<RegionsDbEntity[]>({
      method: "GET",
      path: "/v1/states",
      query,
    });
  }

  /** `GET /v1/regions` — same shape as `getStates`. */
  getRegions(params: { CountryID?: number } = {}): Promise<RegionsDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.CountryID !== undefined) query.CountryID = params.CountryID;
    return this.http.request<RegionsDbEntity[]>({
      method: "GET",
      path: "/v1/regions",
      query,
    });
  }

  /** `GET /v1/cities` — filter optionally by `CountryID`. */
  getCities(params: { CountryID?: number } = {}): Promise<CitiesDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.CountryID !== undefined) query.CountryID = params.CountryID;
    return this.http.request<CitiesDbEntity[]>({
      method: "GET",
      path: "/v1/cities",
      query,
    });
  }

  // ─── Groups & roles ──────────────────────────────────────────────────────

  /** `GET /v1/groups` — filter optionally by `GroupID`. */
  getGroups(params: { GroupID?: number } = {}): Promise<GroupsDbEntity[]> {
    const query: Record<string, number | undefined> = {};
    if (params.GroupID !== undefined) query.GroupID = params.GroupID;
    return this.http.request<GroupsDbEntity[]>({
      method: "GET",
      path: "/v1/groups",
      query,
    });
  }

  /** `GET /v1/group/{GroupID}/roles` — note singular `group` in the path. */
  getGroupRoles(groupId: number): Promise<RolesDbEntity[]> {
    return this.http.request<RolesDbEntity[]>({
      method: "GET",
      path: `/v1/group/${groupId}/roles`,
    });
  }
}
