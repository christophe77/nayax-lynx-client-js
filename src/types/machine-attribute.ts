/**
 * Types for the `Machine Attribute` group of the Nayax operational Lynx API.
 *
 * Source: https://devzone.nayax.com/openapi/lynx.yaml (paths under
 * `/v1/machines/{MachineID}/attributes`).
 */

/** One row of the `MachineAttribute` schema. */
export interface MachineAttribute {
  DeviceAttributeID: number;
  MachineID: number;
  DeviceAttributeValue: string | null;
  DeviceAttributeCodeID: number | null;
  DeviceAttributeName: string | null;
  DeviceAttributeGroup: string | null;
  DeviceAttributeReadOnlyBit: boolean;
  /** Server-populated reference string (read-only). */
  MachineAttributeRef?: string | null;
  /** Server-populated reference string (read-only). */
  MachineRef?: string | null;
}

/**
 * Body for bulk update — accepts a partial `MachineAttribute` since the server
 * only needs the identifier + value to apply a change.
 */
export type MachineAttributeUpdate = Partial<MachineAttribute> &
  Pick<MachineAttribute, "DeviceAttributeID">;

/** Result of a bulk-update operation. */
export interface BulkUpdateResponse {
  isFullySuccess: boolean;
  failureItems: FailureItem[] | null;
}

export interface FailureItem {
  id: string | null;
  error: string | null;
}

/**
 * Atomic attribute payload nested under `MachineAttributesInsertLynxRequest`.
 * (Source: `/reference/lynx/machine-attribute/insertupdate-machine-attributes`)
 */
export interface AttributeDtoLynxModel {
  Id?: number;
  Value?: string;
  CodeId?: number;
}

/**
 * Body for `POST /v2/machines/attributes` — fan-out an attribute set to a
 * batch of machines.
 */
export interface MachineAttributesInsertLynxRequest {
  /** Target machines for this attribute set. */
  MachineIds?: number[];
  /** Earliest time the change may be collected by the machine. */
  allowCollectDt?: string;
  Attributes?: AttributeDtoLynxModel[];
  /** Whether the change should be queued for delivery. */
  UpdateQueue?: boolean;
  /** Whether to overwrite existing values. */
  UpdateValues?: boolean;
}
