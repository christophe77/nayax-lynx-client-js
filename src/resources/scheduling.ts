import type { HttpClient } from "../http/http-client.js";
import type {
  DeleteMachineTasksQuery,
  DriverRequestDto,
  DriverResponseDto,
  GetMachineTasksQuery,
  GetVisitOrdersQuery,
  ListDriversFilters,
  ListRoutesFilters,
  ActorRouteResponseDto,
  RouteCreateRequestDto,
  RouteMachineCreateRequestDto,
  RouteMachineResponseDto,
  RouteResponseDto,
  RouteUpdateRequestDto,
  ScheduleTaskDto,
  TaskSchedulingCreateDto,
  TaskSchedulingResponseDto,
  TaskSchedulingUpdateDto,
  VisitOrderCreateDto,
  VisitOrderCreateResponseItem,
  VisitOrderResponseDto,
} from "../types/scheduling.js";

/**
 * `Scheduling` resource (16 endpoints, confirmed against devzone).
 *
 * Upstream uses `Scheduling` capitalised in the URL path — preserved.
 */
export class SchedulingResource {
  constructor(private readonly http: HttpClient) {}

  // ─── Drivers ─────────────────────────────────────────────────────────────

  /** `GET /v1/Scheduling/drivers`. */
  listDrivers(filters: ListDriversFilters = {}): Promise<DriverResponseDto[]> {
    const q: Record<string, string | number | boolean | undefined> = {};
    if (filters.ActorId !== undefined) q.ActorId = filters.ActorId;
    if (filters.DriverStatusId !== undefined) q.DriverStatusId = filters.DriverStatusId;
    if (filters.Search !== undefined) q.Search = filters.Search;
    if (filters.SearchByDriverId !== undefined) q.SearchByDriverId = filters.SearchByDriverId;
    if (filters.SearchByUserId !== undefined) q.SearchByUserId = filters.SearchByUserId;
    if (filters.SearchByFullname !== undefined) q.SearchByFullname = filters.SearchByFullname;
    if (filters.SearchByMobile !== undefined) q.SearchByMobile = filters.SearchByMobile;
    if (filters.SearchByEmail !== undefined) q.SearchByEmail = filters.SearchByEmail;
    if (filters.SearchByIdNumber !== undefined) q.SearchByIdNumber = filters.SearchByIdNumber;
    if (filters.SearchByDriverLicense !== undefined) q.SearchByDriverLicense = filters.SearchByDriverLicense;
    return this.http.request<DriverResponseDto[]>({
      method: "GET",
      path: "/v1/Scheduling/drivers",
      query: q,
    });
  }

  /** `POST /v1/Scheduling/drivers`. */
  addDriver(body: DriverRequestDto): Promise<DriverResponseDto> {
    return this.http.request<DriverResponseDto>({
      method: "POST",
      path: "/v1/Scheduling/drivers",
      body,
    });
  }

  /** `PUT /v1/Scheduling/drivers?DriverId=…`. */
  updateDriver(driverId: string, body: DriverRequestDto): Promise<DriverResponseDto> {
    return this.http.request<DriverResponseDto>({
      method: "PUT",
      path: "/v1/Scheduling/drivers",
      query: { DriverId: driverId },
      body,
    });
  }

  /** `DELETE /v1/Scheduling/drivers?DriverId=…`. */
  deleteDriver(driverId: string): Promise<DriverResponseDto> {
    return this.http.request<DriverResponseDto>({
      method: "DELETE",
      path: "/v1/Scheduling/drivers",
      query: { DriverId: driverId },
    });
  }

  // ─── Routes ──────────────────────────────────────────────────────────────

  /** `GET /v1/Scheduling/routes`. */
  listRoutes(filters: ListRoutesFilters = {}): Promise<ActorRouteResponseDto[]> {
    const q: Record<string, string | number | boolean | undefined> = {};
    if (filters.OperatorId !== undefined) q.OperatorId = filters.OperatorId;
    if (filters.DriverId !== undefined) q.DriverId = filters.DriverId;
    if (filters.Status !== undefined) q.Status = filters.Status;
    if (filters.Search !== undefined) q.Search = filters.Search;
    if (filters.SearchByName !== undefined) q.SearchByName = filters.SearchByName;
    if (filters.SearchByCode !== undefined) q.SearchByCode = filters.SearchByCode;
    if (filters.SearchByNotes !== undefined) q.SearchByNotes = filters.SearchByNotes;
    if (filters.SearchByRouteId !== undefined) q.SearchByRouteId = filters.SearchByRouteId;
    return this.http.request<ActorRouteResponseDto[]>({
      method: "GET",
      path: "/v1/Scheduling/routes",
      query: q,
    });
  }

  /** `POST /v1/Scheduling/routes?OperatorId=…`. */
  createRoute(operatorId: number, body: RouteCreateRequestDto): Promise<RouteResponseDto> {
    return this.http.request<RouteResponseDto>({
      method: "POST",
      path: "/v1/Scheduling/routes",
      query: { OperatorId: operatorId },
      body,
    });
  }

  /** `PUT /v1/Scheduling/routes?routeId=…`. */
  updateRoute(routeId: number, body: RouteUpdateRequestDto): Promise<RouteResponseDto> {
    return this.http.request<RouteResponseDto>({
      method: "PUT",
      path: "/v1/Scheduling/routes",
      query: { routeId },
      body,
    });
  }

  // ─── Route machines ──────────────────────────────────────────────────────

  /** `GET /v1/Scheduling/route-machines`. */
  getRouteMachines(
    options: { RouteId: number; MachineId?: number },
  ): Promise<RouteMachineResponseDto[]> {
    const q: Record<string, number | undefined> = { RouteId: options.RouteId };
    if (options.MachineId !== undefined) q.MachineId = options.MachineId;
    return this.http.request<RouteMachineResponseDto[]>({
      method: "GET",
      path: "/v1/Scheduling/route-machines",
      query: q,
    });
  }

  /** `POST /v1/Scheduling/route-machines?RouteId=…` — assign machines to a route. */
  assignMachinesToRoute(
    routeId: number,
    body: RouteMachineCreateRequestDto,
  ): Promise<RouteMachineResponseDto[]> {
    return this.http.request<RouteMachineResponseDto[]>({
      method: "POST",
      path: "/v1/Scheduling/route-machines",
      query: { RouteId: routeId },
      body,
    });
  }

  /** `DELETE /v1/Scheduling/route-machines?RouteId=…&MachineId=…`. */
  removeMachineFromRoute(
    options: { RouteId: number; MachineId: number },
  ): Promise<RouteMachineResponseDto> {
    return this.http.request<RouteMachineResponseDto>({
      method: "DELETE",
      path: "/v1/Scheduling/route-machines",
      query: { RouteId: options.RouteId, MachineId: options.MachineId },
    });
  }

  // ─── Visit orders ────────────────────────────────────────────────────────

  /** `GET /v1/Scheduling/schedule/visit-order`. */
  getVisitOrders(query: GetVisitOrdersQuery = {}): Promise<VisitOrderResponseDto[]> {
    const q: Record<string, string | number | undefined> = {};
    if (query.VisitDate !== undefined) q.VisitDate = query.VisitDate;
    if (query.MachineId !== undefined) q.MachineId = query.MachineId;
    if (query.DriverId !== undefined) q.DriverId = query.DriverId;
    if (query.RouteId !== undefined) q.RouteId = query.RouteId;
    if (query.ActorId !== undefined) q.ActorId = query.ActorId;
    return this.http.request<VisitOrderResponseDto[]>({
      method: "GET",
      path: "/v1/Scheduling/schedule/visit-order",
      query: q,
    });
  }

  /** `POST /v1/Scheduling/schedule/visit-order`. */
  createVisitOrders(body: VisitOrderCreateDto[]): Promise<VisitOrderCreateResponseItem[]> {
    return this.http.request<VisitOrderCreateResponseItem[]>({
      method: "POST",
      path: "/v1/Scheduling/schedule/visit-order",
      body,
    });
  }

  // ─── Machine tasks ───────────────────────────────────────────────────────

  /** `GET /v1/Scheduling/schedule/machine-tasks`. */
  getMachineTasks(query: GetMachineTasksQuery = {}): Promise<TaskSchedulingResponseDto[]> {
    const q: Record<string, string | number | boolean | undefined> = {};
    if (query.StartDate !== undefined) q.StartDate = query.StartDate;
    if (query.EndDate !== undefined) q.EndDate = query.EndDate;
    if (query.SchedulingId !== undefined) q.SchedulingId = query.SchedulingId;
    if (query.ActorId !== undefined) q.ActorId = query.ActorId;
    if (query.MachineId !== undefined) q.MachineId = query.MachineId;
    if (query.DriverId !== undefined) q.DriverId = query.DriverId;
    if (query.RouteId !== undefined) q.RouteId = query.RouteId;
    if (query.TimePeriod !== undefined) q.TimePeriod = query.TimePeriod;
    if (query.IsForlist !== undefined) q.IsForlist = query.IsForlist;
    if (query.IsStatic !== undefined) q.IsStatic = query.IsStatic;
    return this.http.request<TaskSchedulingResponseDto[]>({
      method: "GET",
      path: "/v1/Scheduling/schedule/machine-tasks",
      query: q,
    });
  }

  /** `POST /v1/Scheduling/schedule/machine-tasks`. */
  createMachineTasks(body: TaskSchedulingCreateDto[]): Promise<ScheduleTaskDto[]> {
    return this.http.request<ScheduleTaskDto[]>({
      method: "POST",
      path: "/v1/Scheduling/schedule/machine-tasks",
      body,
    });
  }

  /** `PUT /v1/Scheduling/schedule/machine-tasks`. */
  updateMachineTasks(body: TaskSchedulingUpdateDto[]): Promise<ScheduleTaskDto[]> {
    return this.http.request<ScheduleTaskDto[]>({
      method: "PUT",
      path: "/v1/Scheduling/schedule/machine-tasks",
      body,
    });
  }

  /** `DELETE /v1/Scheduling/schedule/machine-tasks` — query-only delete. */
  deleteMachineTasks(query: DeleteMachineTasksQuery = {}): Promise<ScheduleTaskDto[]> {
    const q: Record<string, string | number | boolean | undefined> = {};
    if (query.SchedulingIds !== undefined) q.SchedulingIds = query.SchedulingIds.join(",");
    if (query.MachineID !== undefined) q.MachineID = query.MachineID;
    if (query.isStatic !== undefined) q.isStatic = query.isStatic;
    if (query.date !== undefined) q.date = query.date;
    return this.http.request<ScheduleTaskDto[]>({
      method: "DELETE",
      path: "/v1/Scheduling/schedule/machine-tasks",
      query: q,
    });
  }
}
