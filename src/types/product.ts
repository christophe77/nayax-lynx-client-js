/**
 * Types for the `Products` group.
 * Source: https://devzone.nayax.com/reference/lynx/products
 */

/** Full product (response shape) — includes server-set fields. */
export interface Product {
  NayaxProductID: number | null;
  ProductGroupID: number | null;
  ActorID: number | null;
  ProductManufacturerID: number | null;
  ProductName: string | null;
  ProductCatalogNumber: string | null;
  ProductBarcode: string | null;
  ProductPackageQuantity: number | null;
  ProductDescription: string | null;
  ProductVolumeTypeID: number | null;
  DEXProductName: string | null;
  ProductCostPrice: number | null;
  ProductDefaultRetailPrice: number | null;
  ProductMinimumPickQTY: number | null;
  ProductStatus: number | null;
  ProductCashPrice: number | null;
  ProductCreditCardPrice: number | null;
  ProductPrepaidCardPrice: number | null;
  ProductExternalPrepaidCardPrice: number | null;
  ProductMemberTypePriceBit: boolean | null;
  ProductPictureURL: string | null;
  CaloriesPer100g: number | null;
  CaloriesPerServing: number | null;
  EANCode: string | null;
  ProductCreatedBy: number | null;
  ProductCreationDate: string | null;
  ProductUpdatedBy: number | null;
  ProductLastUpdated: string | null;
  VatId: number | null;
  SequenceNumber: number | null;
  AgeVerificationEnableBit: boolean | null;
  /** Container deposit type: 90001=plastic, 90002=can, 90003=glass. */
  DepositTypeID: number | null;
  /** Max 100.00. */
  DepositFee: number | null;
  /** Tax percentage 0–100. */
  DepositTax: number | null;
  Refs: Record<string, string> | null;
}

/** Body for POST/PUT product endpoints. */
export interface ProductEntity {
  NayaxProductID?: number | null;
  ProductGroupID?: number | null;
  ActorID?: number | null;
  ProductManufacturerID?: number | null;
  ProductName?: string | null;
  ProductCatalogNumber?: string | null;
  ProductBarcode?: string | null;
  ProductPackageQuantity?: number | null;
  ProductDescription?: string | null;
  ProductVolumeTypeID?: number | null;
  DEXProductName?: string | null;
  ProductCostPrice?: number | null;
  ProductDefaultRetailPrice?: number | null;
  ProductMinimumPickQTY?: number | null;
  ProductStatus?: number | null;
  ProductCashPrice?: number | null;
  ProductCreditCardPrice?: number | null;
  ProductPrepaidCardPrice?: number | null;
  ProductExternalPrepaidCardPrice?: number | null;
  ProductMemberTypePriceBit?: boolean | null;
  ProductPictureURL?: string | null;
  CaloriesPer100g?: number | null;
  CaloriesPerServing?: number | null;
  EANCode?: string | null;
  ProductCreatedBy?: number | null;
  ProductCreationDate?: string | null;
  ProductUpdatedBy?: number | null;
  ProductLastUpdated?: string | null;
  VatId?: number | null;
}
