/**
 * Types for the Lynx `Devices` group.
 * Source: https://devzone.nayax.com/reference/lynx/devices
 */

export const ActiveInactiveEnum = {
  Active: 1,
  Inactive: 2,
} as const;
export type ActiveInactiveEnum =
  (typeof ActiveInactiveEnum)[keyof typeof ActiveInactiveEnum];

/** Full device record returned by GET /v1/devices and /v1/devices/{DeviceID}. */
export interface DeviceExtra {
  VposChipId: string | null;
  /** Non-nullable per spec. */
  IsDeviceExists: boolean;
  FWVersionNumber: string | null;
  VposVersionNumber: string | null;
  DeviceID: number | null;
  ActorID: number | null;
  DeviceTypeLutID: number | null;
  DeviceSerial: string | null;
  IMEI: string | null;
  DeviceDescription: string | null;
  SimCardID: number | null;
  FWVersionID: number | null;
  RequestedFwID: number | null;
  PollInterval: number | null;
  StatusID: number | null;
  LastUpdated: string | null;
  IsCollectMultipleParameters: boolean | null;
  IsLogged: boolean | null;
  FRequestedNewVersionDate: string | null;
  FTookNewVersionDate: string | null;
  HardwareVersion: string | null;
  IsRental: boolean | null;
  RentalEndMonth: number | null;
  RentalEndYear: number | null;
  IsToBeReturned: boolean | null;
  FeeCommunicationThreshold: number | null;
  BillingPlanID: number | null;
  BillingPlanActivationDate: string | null;
  DeviceCreationDate: string | null;
  CreatedBy: number | null;
  UpdatedBy: number | null;
  DistributorBillingPlanID: number | null;
  ChipID: string | null;
  OrderID: number | null;
  ExternalFlashSize: number | null;
  BoardSerial: string | null;
  FlashSize: number | null;
  DeviceFamily: string | null;
  ModemModel: string | null;
  TrialEndDate: string | null;
  VerticalTypeID: number | null;
  VerticalProductTypeID: number | null;
  VerticalTypeLutID: number | null;
  VerticalProductTypeLutID: number | null;
  Refs: Record<string, string> | null;
}

/** Body for PUT /v1/devices/{DeviceID}. */
export interface DevicesUpdateDto {
  ActorID?: number;
  StatusID?: ActiveInactiveEnum;
}

/** Response item from PUT /v1/devices/move/{actorId}. */
export interface DevicesMoveResponse {
  HW_serial: string | null;
  actor_id: number;
  is_connected: boolean;
}

/** Filters accepted by GET /v1/devices. */
export interface ListDevicesFilters {
  ActorId?: number;
  isConnected?: boolean;
  nayaxDeviceSerial?: string;
  orderId?: number;
  statusId?: number;
  createdDt?: string;
  updatedDt?: string;
  boardSerial?: string;
  imei?: string;
  chipId?: string;
}
