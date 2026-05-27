import type { HttpClient } from "../http/http-client.js";
import type {
  ActorCreateRequest,
  ActorCreateResponse,
  ActorGroupRequestDTO,
  ActorGroupResponseDTO,
  ActorHierarchyQuery,
  ActorHirarchyDto,
  ActorPaymentResponse,
  Actors,
  ActorsDbEntity,
  DispatchActorEncKeysDbEntity,
  EvDashboardQuery,
  EvMeterDashBoard,
  MachineGroupRequestDTO,
  MachineGroupResponseDTO,
} from "../types/actor.js";
import type { ApiResult } from "../types/machine-misc.js";

/**
 * `Actors` resource (20 endpoints, confirmed against devzone).
 *
 * Note path inconsistencies upstream:
 * - Machine-groups endpoints use singular `/v1/actor/...` (the rest use `/v1/actors/...`).
 * - `GenarateEncKey` and `DecryptionMessageByVer` are typos preserved on the wire.
 */
export class ActorsResource {
  constructor(private readonly http: HttpClient) {}

  // ─── Basic CRUD ──────────────────────────────────────────────────────────

  /** `GET /v1/actors/{ActorID}`. */
  get(actorId: number): Promise<Actors> {
    return this.http.request<Actors>({
      method: "GET",
      path: `/v1/actors/${actorId}`,
    });
  }

  /** `PUT /v1/actors/{ActorID}` — update operator / sub-operator. */
  update(actorId: number, body: ActorsDbEntity): Promise<Actors> {
    return this.http.request<Actors>({
      method: "PUT",
      path: `/v1/actors/${actorId}`,
      body,
    });
  }

  /** `GET /v1/actors?ActorCode=…`. */
  getByActorCode(actorCode: number): Promise<Actors> {
    return this.http.request<Actors>({
      method: "GET",
      path: "/v1/actors",
      query: { ActorCode: actorCode },
    });
  }

  /** `POST /v1/actors/{ParentActorID}` (v1 — body uses flat `ActorsDbEntity`). */
  create(parentActorId: number, body: ActorsDbEntity): Promise<Actors> {
    return this.http.request<Actors>({
      method: "POST",
      path: `/v1/actors/${parentActorId}`,
      body,
    });
  }

  /** `POST /v2/actors/{ParentActorID}` (v2 — nested DTO with optional billing gateways). */
  createV2(
    parentActorId: number,
    body: ActorCreateRequest,
  ): Promise<ActorCreateResponse> {
    return this.http.request<ActorCreateResponse>({
      method: "POST",
      path: `/v2/actors/${parentActorId}`,
      body,
    });
  }

  // ─── Payment methods ─────────────────────────────────────────────────────

  /** `GET /v1/actors/{ActorID}/paymentMethods`. */
  getPaymentMethods(actorId: number): Promise<ActorPaymentResponse[]> {
    return this.http.request<ActorPaymentResponse[]>({
      method: "GET",
      path: `/v1/actors/${actorId}/paymentMethods`,
    });
  }

  /** `POST /v1/actors/{ActorID}/paymentMethods` — bulk create. */
  createPaymentMethods(
    actorId: number,
    body: ActorPaymentResponse[],
  ): Promise<ActorPaymentResponse[]> {
    return this.http.request<ActorPaymentResponse[]>({
      method: "POST",
      path: `/v1/actors/${actorId}/paymentMethods`,
      body,
    });
  }

  /** `PUT /v1/actors/{ActorID}/paymentMethods` — bulk update. */
  updatePaymentMethods(
    actorId: number,
    body: ActorPaymentResponse[],
  ): Promise<ActorPaymentResponse[]> {
    return this.http.request<ActorPaymentResponse[]>({
      method: "PUT",
      path: `/v1/actors/${actorId}/paymentMethods`,
      body,
    });
  }

  /** `DELETE /v1/actors/{ActorID}/paymentMethods/{paymentMethodID}`. */
  deletePaymentMethod(actorId: number, paymentMethodId: number): Promise<ApiResult> {
    return this.http.request<ApiResult>({
      method: "DELETE",
      path: `/v1/actors/${actorId}/paymentMethods/${paymentMethodId}`,
    });
  }

  // ─── EV dashboard ────────────────────────────────────────────────────────

  /** `GET /v1/actors/{ActorID}/evDashboard`. */
  getEvDashboard(
    actorId: number,
    query: EvDashboardQuery = {},
  ): Promise<EvMeterDashBoard> {
    const q: Record<string, string | number | undefined> = {};
    if (query.StartDate !== undefined) q.StartDate = query.StartDate;
    if (query.EndDate !== undefined) q.EndDate = query.EndDate;
    if (query.MachineID !== undefined) q.MachineID = query.MachineID;
    if (query.TimePeriod !== undefined) q.TimePeriod = query.TimePeriod;
    if (query.MachineNumber !== undefined) q.MachineNumber = query.MachineNumber;
    return this.http.request<EvMeterDashBoard>({
      method: "GET",
      path: `/v1/actors/${actorId}/evDashboard`,
      query: q,
    });
  }

  // ─── Hierarchy ───────────────────────────────────────────────────────────

  /** `GET /v1/actors/hierarchy` — recursive hierarchy DTO. */
  getHierarchy(query: ActorHierarchyQuery = {}): Promise<ActorHirarchyDto> {
    const q: Record<string, number | undefined> = {};
    if (query.ActorID !== undefined) q.ActorID = query.ActorID;
    if (query.StatusID !== undefined) q.StatusID = query.StatusID;
    if (query.HierarchyLevelLimit !== undefined) q.HierarchyLevelLimit = query.HierarchyLevelLimit;
    return this.http.request<ActorHirarchyDto>({
      method: "GET",
      path: "/v1/actors/hierarchy",
      query: q,
    });
  }

  // ─── Encryption keys ─────────────────────────────────────────────────────

  /** `GET /v1/actors/GetEncKeys?actorID=…`. */
  getEncryptionKeys(actorId: number): Promise<DispatchActorEncKeysDbEntity[]> {
    return this.http.request<DispatchActorEncKeysDbEntity[]>({
      method: "GET",
      path: "/v1/actors/GetEncKeys",
      query: { actorID: actorId },
    });
  }

  /** `PUT /v1/actors/GenarateEncKey?actorID=…` (typo preserved upstream). */
  generateEncryptionKey(actorId: number): Promise<DispatchActorEncKeysDbEntity> {
    return this.http.request<DispatchActorEncKeysDbEntity>({
      method: "PUT",
      path: "/v1/actors/GenarateEncKey",
      query: { actorID: actorId },
    });
  }

  /**
   * `PUT /v1/actors/DecryptionMessageByVer?actorID=…&encVer=…` — body is the
   * encrypted message as a string.
   */
  decryptMessageByVersion(
    actorId: number,
    encVer: number,
    encryptedMessage: string,
  ): Promise<boolean> {
    return this.http.request<boolean>({
      method: "PUT",
      path: "/v1/actors/DecryptionMessageByVer",
      query: { actorID: actorId, encVer },
      body: encryptedMessage,
    });
  }

  // ─── Machine groups (singular `actor` in path) ──────────────────────────

  /** `GET /v1/actor/{ActorID}/machineGroups`. */
  listMachineGroups(actorId: number): Promise<MachineGroupResponseDTO[]> {
    return this.http.request<MachineGroupResponseDTO[]>({
      method: "GET",
      path: `/v1/actor/${actorId}/machineGroups`,
    });
  }

  /** `POST /v1/actor/{ActorID}/machineGroups`. */
  addMachineGroup(
    actorId: number,
    body: MachineGroupRequestDTO,
  ): Promise<MachineGroupResponseDTO> {
    return this.http.request<MachineGroupResponseDTO>({
      method: "POST",
      path: `/v1/actor/${actorId}/machineGroups`,
      body,
    });
  }

  /** `PUT /v1/actor/{ActorID}/machineGroups`. */
  updateMachineGroup(
    actorId: number,
    body: MachineGroupRequestDTO,
  ): Promise<MachineGroupResponseDTO> {
    return this.http.request<MachineGroupResponseDTO>({
      method: "PUT",
      path: `/v1/actor/${actorId}/machineGroups`,
      body,
    });
  }

  // ─── Role groups ─────────────────────────────────────────────────────────

  /** `GET /v1/actors/{ActorID}/roleGroups`. */
  listRoleGroups(actorId: number): Promise<ActorGroupResponseDTO[]> {
    return this.http.request<ActorGroupResponseDTO[]>({
      method: "GET",
      path: `/v1/actors/${actorId}/roleGroups`,
    });
  }

  /** `POST /v1/actors/{ActorID}/roleGroups`. */
  addRoleGroups(
    actorId: number,
    body: ActorGroupRequestDTO[],
  ): Promise<ActorGroupResponseDTO[]> {
    return this.http.request<ActorGroupResponseDTO[]>({
      method: "POST",
      path: `/v1/actors/${actorId}/roleGroups`,
      body,
    });
  }

  /** `DELETE /v1/actors/{ActorID}/roleGroups` — note: takes a JSON body. */
  deleteRoleGroups(
    actorId: number,
    body: ActorGroupRequestDTO[],
  ): Promise<ActorGroupResponseDTO[]> {
    return this.http.request<ActorGroupResponseDTO[]>({
      method: "DELETE",
      path: `/v1/actors/${actorId}/roleGroups`,
      body,
    });
  }
}
