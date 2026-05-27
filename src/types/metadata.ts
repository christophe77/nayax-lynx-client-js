/**
 * `Metadata` schemas.
 * Source: https://devzone.nayax.com/reference/lynx/metadata
 */

export interface EventRulesLynxModelResponse {
  EventRuleId: number;
  EventRuleName: string | null;
  EventCode: number;
  EventSource: number | null;
  /** Server field spelling: `EvetnCategoryId` (typo'd in upstream spec). */
  EvetnCategoryId: number;
  GroupCategoryId: number;
  EventRuleStatusId: number | null;
  EventDescription: string | null;
}

export interface UploadPictureRequest {
  ImageTypeLutId: number;
  EntityId?: string | null;
  /** Base64-encoded image data. */
  Image?: string | null;
  ImageCrop?: string | null;
  IsMonyx: boolean;
}

export interface UploadPictureResponse {
  ImageTypeLutId: number;
  Key: string | null;
  KeyName: string | null;
  /** Map of size-name → URL. */
  Urls: Record<string, string> | null;
}
