/**
 * Types for the `Product Groups` group (incl. tax/VAT).
 * Source: https://devzone.nayax.com/reference/lynx/product-groups
 */

/** Full ProductGroup row (response). */
export interface ProductGroup {
  /** Read-only refs. */
  ProductGroupRef?: string | null;
  ActorRef?: string | null;
  ProductGroupID: number | null;
  ActorID: number | null;
  ProductGroupName: string | null;
  ProductGroupCode: number | null;
  ProductGroupSubCode: number | null;
  ProductGroupCreatedBy: number | null;
  ProductGroupCreationDate: string | null;
  ProductGroupUpdatedBy: number | null;
  ProductGroupLastUpdated: string | null;
  ProductGroupPictureURL: string | null;
  ProductGroupCategoryCode: string | null;
}

/** Body for `POST /v1/productGroups`. */
export interface ProductGroupCreateRequest {
  ActorID: number;
  ProductGroupName?: string | null;
  ProductGroupCode?: number | null;
  ProductGroupSubCode?: number | null;
  ProductGroupCategoryCode?: string | null;
}

/** Body for `PUT /v1/productGroups/{ProductGroupID}`. */
export interface ProductGroupUpdateRequest {
  ProductGroupName?: string | null;
  ProductGroupCode?: number | null;
  ProductGroupSubCode?: number | null;
  ProductGroupCategoryCode?: string | null;
}

/** Tax rate row (response of GET .../tax). */
export interface VatDTO {
  TaxRowID: number;
  ProductGroupID: number;
  CountryID: number;
  CityID: number;
  RegionID: number | null;
  TaxValue: number | null;
  TaxCode: number | null;
  CreatedBy: number | null;
  CreatedDT: string | null;
  UpdatedBy: number | null;
  UpdatedDT: string | null;
  VatName: string | null;
  TaxId: string | null;
  TaxIncluded: boolean | null;
}

/** Body item for POST .../tax. */
export interface VatRequest {
  CountryID: number;
  CityID?: number | null;
  RegionID?: number | null;
  TaxValue?: number | null;
  TaxCode?: number | null;
  VatName?: string | null;
  TaxId?: string | null;
  TaxIncluded?: boolean | null;
}

/** Body item for PUT .../tax — same as `VatRequest` but with `TaxRowID`. */
export interface VatRequestExt extends VatRequest {
  TaxRowID: number;
}
