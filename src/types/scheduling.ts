/**
 * Types for the `Scheduling` group (16 endpoints).
 * Source: https://devzone.nayax.com/reference/lynx/scheduling
 *
 * Note: the URL path uses uppercase `Scheduling` (preserved upstream).
 */

// ─── Drivers ───────────────────────────────────────────────────────────────

export interface DriverWorkingHours {
  /** HH:MM. */
  StartHour: string | null;
  /** HH:MM. */
  EndHour: string | null;
}

export interface DriverWorkingDayAndHours {
  /** 1=Monday … 7=Sunday. */
  Day: number;
  Enabled: boolean;
  Hours: DriverWorkingHours[] | null;
}

/** Body for POST/PUT /v1/Scheduling/drivers. */
export interface DriverRequestDto {
  UserId: number;
  OperatorId: number;
  DriverStatusId?: number | null;
  StartDate?: string | null;
  DriverLicense?: string | null;
  IdNumber?: string | null;
  Skills?: number[] | null;
  WorkingHours?: DriverWorkingDayAndHours[] | null;
}

export interface DriverResponseDto {
  /** UUID. */
  Id: string;
  DistributorId: number;
  OperatorId: number;
  OperatorName: string | null;
  UserId: number;
  FullName: string | null;
  Mobile: string | null;
  Email: string | null;
  DriverLicense: string | null;
  IdNumber: string | null;
  Img: string | null;
  DriverStatusId: number | null;
  StartDate: string | null;
  Skills: number[] | null;
  WorkingHours: string | null;
  CreatedBy: number;
  CreatedDt: string;
  UpdatedBy: number | null;
  UpdatedDt: string | null;
}

export interface ListDriversFilters {
  ActorId?: number;
  DriverStatusId?: number;
  Search?: string;
  SearchByDriverId?: boolean;
  SearchByUserId?: boolean;
  SearchByFullname?: boolean;
  SearchByMobile?: boolean;
  SearchByEmail?: boolean;
  SearchByIdNumber?: boolean;
  SearchByDriverLicense?: boolean;
}

// ─── Routes ────────────────────────────────────────────────────────────────

/** Body for POST /v1/Scheduling/routes. */
export interface RouteCreateRequestDto {
  RouteName?: string | null;
  RouteCode?: string | null;
  /** UUID. */
  DriverId: string;
  RouteRemarks?: string | null;
  RouteStatusId: number;
}

/** Body for PUT /v1/Scheduling/routes. */
export interface RouteUpdateRequestDto {
  OperatorId: number;
  RouteName?: string | null;
  RouteCode?: string | null;
  /** UUID. */
  DriverId: string;
  RouteRemarks?: string | null;
  RouteStatusId: number;
}

export interface RouteResponseDto {
  RouteId: number;
  DriverId: string | null;
  DriverName: string | null;
  DriverMobile: string | null;
  RouteName: string | null;
  RouteCode: string | null;
  RouteRemarks: string | null;
  RouteStatusId: number;
  RouteMachineCount: string | null;
  CreatedDt: string;
  CreatedBy: number;
  UpdatedDt: string | null;
  UpdatedBy: number | null;
}

export interface ActorRouteResponseDto {
  DistributorId: number;
  OperatorId: number;
  OperatorName: string | null;
  ActorRoutes: RouteResponseDto[] | null;
}

export interface ListRoutesFilters {
  OperatorId?: number;
  DriverId?: string;
  Status?: number;
  Search?: string;
  SearchByName?: boolean;
  SearchByCode?: boolean;
  SearchByNotes?: boolean;
  SearchByRouteId?: boolean;
}

// ─── Route machines ────────────────────────────────────────────────────────

/** Body for POST /v1/Scheduling/route-machines. */
export interface RouteMachineCreateRequestDto {
  MachineIds?: number[] | null;
}

export interface RouteMachineResponseDto {
  MachineTypeLutId: number | null;
  MachineId: number;
  MachineName: string | null;
  MachineNumber: string | null;
  CountryId: number | null;
  City: string | null;
  Address: string | null;
  StreetNumber: string | null;
  Longitude: string | null;
  Latitude: string | null;
  InstituteId: number | null;
  InstituteName: string | null;
  LocationId: number | null;
  LocationName: string | null;
  CustomerId: number | null;
  CustomerName: string | null;
  CustomerLocationId: number | null;
  CustomerLocationName: string | null;
  StatusId: number | null;
  DriverId: string | null;
  RouteId: number;
  UserId: number | null;
  CreatedBy: number;
  CreatedDt: string;
}

// ─── Visit orders ──────────────────────────────────────────────────────────

/** Item in the body of POST /v1/Scheduling/schedule/visit-order. */
export interface VisitOrderCreateDto {
  MachineId: number;
  VisitDate: string;
  DriverId?: string;
  RouteId?: number;
  OrderKey: number;
}

export interface VisitOrderCreateResponseItem {
  VisitDate: string;
  MachineId: number | null;
  DriverId: string | null;
  RouteId: number | null;
  OrderKey: number | null;
  CreatedDt: string;
  CreatedBy: number;
  UpdatedDt: string | null;
  UpdatedBy: number | null;
}

export interface MachineOrderResponseDto {
  MachineId: number | null;
  RouteId: number | null;
  OrderKey: number | null;
}

export interface VisitOrderResponseDto {
  MachineVisitOrderId: number;
  VisitDate: string;
  DriverId: string | null;
  Machines: MachineOrderResponseDto[] | null;
}

export interface GetVisitOrdersQuery {
  VisitDate?: string;
  MachineId?: number;
  DriverId?: string;
  RouteId?: number;
  ActorId?: number;
}

// ─── Machine tasks (scheduling) ────────────────────────────────────────────

/**
 * Pattern is loosely defined upstream — kept open-ended.
 * Documented sub-fields: PatternId, Name, Description, RepeatType, RepeatInterval,
 * IsStatic, StartOn, EndOn, EndAfter, RepeatOn.
 */
export interface SchedulingPattern {
  PatternId?: number;
  Name?: string;
  Description?: string;
  RepeatType?: string;
  RepeatInterval?: number;
  IsStatic?: boolean;
  StartOn?: string;
  EndOn?: string;
  EndAfter?: number;
  RepeatOn?: SchedulingRepeatOn;
  [k: string]: unknown;
}

export interface SchedulingRepeatOn {
  Tasks?: unknown;
  Days?: unknown;
  Week?: unknown;
  MonthDay?: unknown;
  SetPos?: unknown;
  RecurrenceEx?: unknown;
  WeekNumber?: unknown;
  [k: string]: unknown;
}

export interface EntityPicture {
  EntityPictureId?: number;
  EntityPictureUrl?: string;
  [k: string]: unknown;
}

/** Body item for POST /v1/Scheduling/schedule/machine-tasks. */
export interface TaskSchedulingCreateDto {
  MachineId: number;
  TaskLutId?: string | null;
  DriverId?: string | null;
  ScheduleDate?: string | null;
  StatusId: number;
  Notes?: string | null;
  GeneratePickList: boolean;
  GeneratePickListTime?: string | null;
  GeneratePickListRange?: number | null;
  ScheduleNextWorkingDay: boolean;
  TimezoneOffset: number;
  AssignedToPatternId?: number | null;
  AssignedToScheduleId?: number | null;
  Pattern?: SchedulingPattern | null;
  IsMobile?: boolean | null;
  IsSeriesUpdate?: boolean | null;
  OriginalDate?: string | null;
  IncompletionReasonId?: number | null;
  IncompletionReason?: string | null;
}

/** Body item for PUT /v1/Scheduling/schedule/machine-tasks. */
export interface TaskSchedulingUpdateDto extends TaskSchedulingCreateDto {
  SchedulingId?: number | null;
}

export interface ScheduleTaskDto {
  MachineId: number;
  SchedulingId: number;
  TaskLutId: string | null;
  DriverId: string | null;
  DriverName: string | null;
  ScheduleDate: string | null;
  StatusId: number;
  TimezoneOffset: number;
  Notes: string | null;
  GeneratePickList: boolean;
  GeneratePickListTime: string | null;
  GeneratePickListRange: number | null;
  ScheduleNextWorkingDay: boolean;
  AssignedToPatternId: number | null;
  AssignedToScheduleId: number | null;
  Pattern?: SchedulingPattern | null;
  IncompletionReason: string | null;
  IncompletionReasonImages?: EntityPicture[] | null;
  IsClustered: boolean | null;
  ClusterIds: string | null;
  CreatedBy: number;
  CreatedDt: string;
  UpdatedBy: number | null;
  UpdatedDt: string | null;
  isMobile: boolean | null;
  isSeriesUpdate: boolean | null;
  originalDate: string | null;
  IncompletionReasonId: number | null;
  IncompletionReasonName: string | null;
}

export interface TaskSchedulingResponseDto {
  MachineId: number;
  RouteId: number | null;
  RouteName: string | null;
  VisitDate: string | null;
  ScheduleTasks: ScheduleTaskDto[] | null;
}

export interface GetMachineTasksQuery {
  StartDate?: string;
  EndDate?: string;
  SchedulingId?: number;
  ActorId?: number;
  MachineId?: number;
  DriverId?: string;
  RouteId?: number;
  TimePeriod?: number;
  IsForlist?: boolean;
  IsStatic?: boolean;
}

export interface DeleteMachineTasksQuery {
  SchedulingIds?: number[];
  MachineID?: number;
  isStatic?: boolean;
  date?: string;
}
