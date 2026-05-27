/**
 * Types for the `Reports` group (2 endpoints).
 * Source: https://devzone.nayax.com/reference/lynx/report
 *
 * Note: the path is `/v1/dashboard/...` (the OpenAPI tag is `report`).
 */

export interface WidgetResponseDto {
  WidgetTypeId: number;
  WidgetName: string | null;
  /** Opaque per-widget config blob. */
  WidgetConfig: Record<string, unknown> | null;
  /** Group IDs allowed to view the widget. */
  Categories: number[] | null;
  Groups: number[] | null;
}

export interface WidgetFilterDto {
  /** e.g. 'startDate', 'MachineId'. */
  Name?: string | null;
  Value?: string | null;
  /** e.g. 'Date', 'Int', 'bit'. */
  Type?: string | null;
}

export interface WidgetRequestDto {
  ScreenTypeId: number;
  WidgetTypeId: number;
  /** Null for global scope. */
  EntityId?: number | null;
  Filters?: WidgetFilterDto[] | null;
}

export interface WidgetDataResponseDto {
  WidgetDetails: WidgetResponseDto;
  /** Shape varies by `WidgetTypeId`. */
  Data: unknown;
}
