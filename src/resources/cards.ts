import type { HttpClient } from "../http/http-client.js";
import type {
  CardCreateDto,
  CardGetDto,
  CardGroup,
  CardLastTransaction,
  CardUpdateDto,
  CardValue,
  Cards,
  CardsMachineResponseModel,
  CardsWithActorId,
  ListCardsFilters,
  PrepaidCard,
  PrepaidCardDbEntity,
} from "../types/card.js";
import type { ApiResult } from "../types/machine-misc.js";

/**
 * `Cards` resource (20 endpoints, confirmed against devzone).
 *
 * Mixes v1 flat schemas (`Cards`) with v2 nested schemas (`CardGetDto`,
 * `CardCreateDto`, `CardUpdateDto`).
 */
export class CardsResource {
  constructor(private readonly http: HttpClient) {}

  // ─── List & v1 CRUD ──────────────────────────────────────────────────────

  /** `GET /v1/cards` — list/filter; returns the v2-shaped `CardGetDto[]`. */
  list(filters: ListCardsFilters = {}): Promise<CardGetDto[]> {
    const query: Record<string, string | number | undefined> = {};
    if (filters.CardID !== undefined) query.CardID = filters.CardID;
    if (filters.CardUniqueIdentifier !== undefined) query.CardUniqueIdentifier = filters.CardUniqueIdentifier;
    if (filters.CardDisplayNumber !== undefined) query.CardDisplayNumber = filters.CardDisplayNumber;
    if (filters.CardMobileNumber !== undefined) query.CardMobileNumber = filters.CardMobileNumber;
    if (filters.ExternalApplicationUserID !== undefined) query.ExternalApplicationUserID = filters.ExternalApplicationUserID;
    if (filters.CardEmail !== undefined) query.CardEmail = filters.CardEmail;
    if (filters.CardHolderName !== undefined) query.CardHolderName = filters.CardHolderName;
    return this.http.request<CardGetDto[]>({
      method: "GET",
      path: "/v1/cards",
      query,
    });
  }

  /** `POST /v1/cards` — create a virtual card (v1 flat). */
  createVirtual(body: CardsWithActorId): Promise<Cards> {
    return this.http.request<Cards>({
      method: "POST",
      path: "/v1/cards",
      body,
    });
  }

  /** `PUT /v1/cards` — update card details (v1 flat). */
  update(body: Cards): Promise<Cards> {
    return this.http.request<Cards>({
      method: "PUT",
      path: "/v1/cards",
      body,
    });
  }

  /** `PUT /v1/cards/{CardDisplayNumber}` — update by display number. */
  updateByDisplayNumber(cardDisplayNumber: string, body: Cards): Promise<Cards> {
    return this.http.request<Cards>({
      method: "PUT",
      path: `/v1/cards/${encodeURIComponent(cardDisplayNumber)}`,
      body,
    });
  }

  // ─── Lookups by identifier ───────────────────────────────────────────────

  /** `GET /v1/cards/uniqueIdentifier/{CardUniqueIdentifier}`. */
  getByUniqueIdentifier(cardUniqueIdentifier: string): Promise<Cards> {
    return this.http.request<Cards>({
      method: "GET",
      path: `/v1/cards/uniqueIdentifier/${encodeURIComponent(cardUniqueIdentifier)}`,
    });
  }

  /** `GET /v1/cards/displayNumber/{CardDisplayNumber}`. */
  getByDisplayNumber(cardDisplayNumber: string): Promise<Cards> {
    return this.http.request<Cards>({
      method: "GET",
      path: `/v1/cards/displayNumber/${encodeURIComponent(cardDisplayNumber)}`,
    });
  }

  // ─── Credit & revalue ────────────────────────────────────────────────────

  /** `GET /v1/cards/{CardUniqueIdentifier}/credit`. */
  getCredit(cardUniqueIdentifier: string): Promise<CardValue> {
    return this.http.request<CardValue>({
      method: "GET",
      path: `/v1/cards/${encodeURIComponent(cardUniqueIdentifier)}/credit`,
    });
  }

  /** `GET /v1/cards/{CardUniqueIdentifier}/revalue`. */
  getRevalue(cardUniqueIdentifier: string): Promise<CardValue> {
    return this.http.request<CardValue>({
      method: "GET",
      path: `/v1/cards/${encodeURIComponent(cardUniqueIdentifier)}/revalue`,
    });
  }

  /** `POST /v1/cards/{CardUniqueIdentifier}/credit/add`. */
  addCredit(
    cardUniqueIdentifier: string,
    options: { CardCredit?: number; CreditChangeRemarks?: string } = {},
  ): Promise<CardValue> {
    const query: Record<string, string | number | undefined> = {};
    if (options.CardCredit !== undefined) query.CardCredit = options.CardCredit;
    if (options.CreditChangeRemarks !== undefined) query.CreditChangeRemarks = options.CreditChangeRemarks;
    return this.http.request<CardValue>({
      method: "POST",
      path: `/v1/cards/${encodeURIComponent(cardUniqueIdentifier)}/credit/add`,
      query,
    });
  }

  /** `POST /v1/cards/{CardUniqueIdentifier}/revalue/add`. */
  addRevalue(
    cardUniqueIdentifier: string,
    options: { CardCredit?: number; CreditChangeRemarks?: string } = {},
  ): Promise<CardValue> {
    const query: Record<string, string | number | undefined> = {};
    if (options.CardCredit !== undefined) query.CardCredit = options.CardCredit;
    if (options.CreditChangeRemarks !== undefined) query.CreditChangeRemarks = options.CreditChangeRemarks;
    return this.http.request<CardValue>({
      method: "POST",
      path: `/v1/cards/${encodeURIComponent(cardUniqueIdentifier)}/revalue/add`,
      query,
    });
  }

  /** `POST /v1/cards/{From}/revalue/send/{To}` — transfer revalue. */
  transferRevalue(
    fromCardUniqueIdentifier: string,
    toCardUniqueIdentifier: string,
    options: { CardCredit?: number; CreditChangeRemarks?: string } = {},
  ): Promise<CardValue> {
    const query: Record<string, string | number | undefined> = {};
    if (options.CardCredit !== undefined) query.CardCredit = options.CardCredit;
    if (options.CreditChangeRemarks !== undefined) query.CreditChangeRemarks = options.CreditChangeRemarks;
    return this.http.request<CardValue>({
      method: "POST",
      path: `/v1/cards/${encodeURIComponent(fromCardUniqueIdentifier)}/revalue/send/${encodeURIComponent(toCardUniqueIdentifier)}`,
      query,
    });
  }

  // ─── Status / groups ─────────────────────────────────────────────────────

  /** `POST /v1/cards/{CardUniqueIdentifier}/status/{CardStatus}` — 1=Active, 2=Inactive. */
  updateStatus(cardUniqueIdentifier: string, cardStatus: 1 | 2): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "POST",
      path: `/v1/cards/${encodeURIComponent(cardUniqueIdentifier)}/status/${cardStatus}`,
    });
  }

  /** `GET /v1/cards/{cardId}/cardGroups`. */
  getCardGroups(cardId: number): Promise<CardGroup[]> {
    return this.http.request<CardGroup[]>({
      method: "GET",
      path: `/v1/cards/${cardId}/cardGroups`,
    });
  }

  /** `PUT /v1/cards/{cardId}/cardGroups`. */
  updateCardGroups(cardId: number, body: CardGroup[]): Promise<CardGroup[]> {
    return this.http.request<CardGroup[]>({
      method: "PUT",
      path: `/v1/cards/${cardId}/cardGroups`,
      body,
    });
  }

  // ─── Prepaid / validation / latest tx ────────────────────────────────────

  /** `GET /v1/cards/{CardId}/prepaid`. */
  getPrepaid(cardId: number): Promise<PrepaidCard> {
    return this.http.request<PrepaidCard>({
      method: "GET",
      path: `/v1/cards/${cardId}/prepaid`,
    });
  }

  /** `PUT /v1/cards/{CardId}/prepaid`. */
  updatePrepaid(cardId: number, body: PrepaidCardDbEntity): Promise<PrepaidCard> {
    return this.http.request<PrepaidCard>({
      method: "PUT",
      path: `/v1/cards/${cardId}/prepaid`,
      body,
    });
  }

  /** `GET /v1/cards/validate-machine/{machineId}`. */
  validateForMachine(
    machineId: number,
    options: { cardId?: number; cardUniqueIdentifier?: string } = {},
  ): Promise<CardsMachineResponseModel> {
    const query: Record<string, string | number | undefined> = {};
    if (options.cardId !== undefined) query.cardId = options.cardId;
    if (options.cardUniqueIdentifier !== undefined) query.cardUniqueIdentifier = options.cardUniqueIdentifier;
    return this.http.request<CardsMachineResponseModel>({
      method: "GET",
      path: `/v1/cards/validate-machine/${machineId}`,
      query,
    });
  }

  /**
   * `POST /v1/cards/query` — last transactions for a credit card.
   * The body is a string: the SHA1 hash of the credit card number, base64-encoded.
   */
  getLatestCreditCardTransactions(
    sha1Base64: string,
    options: { minutes?: number } = {},
  ): Promise<CardLastTransaction[]> {
    const query: Record<string, number | undefined> = {};
    if (options.minutes !== undefined) query.minutes = options.minutes;
    return this.http.request<CardLastTransaction[]>({
      method: "POST",
      path: "/v1/cards/query",
      query,
      body: sha1Base64,
    });
  }

  // ─── v2 nested CRUD ──────────────────────────────────────────────────────

  /** `POST /v2/cards` — create with the nested DTO. */
  createV2(body: CardCreateDto): Promise<CardGetDto> {
    return this.http.request<CardGetDto>({
      method: "POST",
      path: "/v2/cards",
      body,
    });
  }

  /** `PUT /v2/cards/{CardID}` — update with the nested DTO. */
  updateById(cardId: number, body: CardUpdateDto): Promise<CardGetDto> {
    return this.http.request<CardGetDto>({
      method: "PUT",
      path: `/v2/cards/${cardId}`,
      body,
    });
  }
}
