import {
  DeliveryOnlyMovementPricingDto,
  RecordTypes,
  SupplyDeliveryMovementPricingDto,
} from "../../api/haulage-system";
import type { VAddress, VRadioItem, VSelectOptionItem } from "../types/shared";
import type { VCheckboxItem } from "../../core/types/shared";
import VAdjustDeliveryQuotePrice from "../types/pricing/VAdjustDeliveryQuotePrice";
import VAdjustMaterialQuotePrice from "../types/pricing/VAdjustMaterialQuotePrice";
import VAdjustQuotePrice from "../types/pricing/VAdjustQuotePrice";

function toVRadioItem(value: number, label: string): VRadioItem {
  return { label: label, value: value } as VRadioItem;
}

function toVCheckboxItem(value: number, label: string): VCheckboxItem {
  return { label: label, value: value } as VCheckboxItem;
}

function toVAddress(latitude: number, longitude: number, fullAddress: string): VAddress {
  return {
    latitude: latitude,
    longitude: longitude,
    fullAddress: fullAddress,
  } as VAddress;
}

function toVSelectOptionItem(value: number, label: string): VSelectOptionItem {
  return { label: label, value: value } as VSelectOptionItem;
}

function toVAdjustQuotePriceForSupplyDelivery(object: SupplyDeliveryMovementPricingDto, id: number) {
  return {
    id: id,
    quoteType: RecordTypes.SupplyAndDelivery,
    defaultMaterialAndDeliveryPricePerQuantityUnit: object.defaultMaterialAndDeliveryPricePerQuantityUnit,
    materialAndDeliveryPricePerQuantityUnit: object.materialAndDeliveryPricePerQuantityUnit,
    materialMovementId: object.materialMovementId,
    deliveryMovementId: object.deliveryMovementId,
    defaultOnewayJourneyTime: object.defaultOnewayJourneyTime,
    deliveryPricing: {
      deliveryPricePerTimeUnit: object.deliveryPricePerTimeUnit,
      defaultDeliveryPricePerTimeUnit: object.defaultDeliveryPricePerTimeUnit,
      totalDeliveryPrice: object.totalDeliveryPrice,
      defaultTotalDeliveryPrice: object.defaultTotalDeliveryPrice,
    } as VAdjustDeliveryQuotePrice,
    materialPricing: {
      materialPricePerQuantityUnit: object.materialPricePerQuantityUnit,
      defaultMaterialPricePerQuantityUnit: object.defaultMaterialPricePerQuantityUnit,
      totalMaterialPrice: object.totalMaterialPrice,
      defaultTotalMaterialPrice: object.defaultTotalMaterialPrice,
    } as VAdjustMaterialQuotePrice,
  } as VAdjustQuotePrice;
}

function toVAdjustQuotePriceForDeliveryOnly(object: DeliveryOnlyMovementPricingDto, id: number) {
  return {
    id: id,
    deliveryMovementId: object.deliveryMovementId,
    defaultOnewayJourneyTime: object.defaultOnewayJourneyTime,
    deliveryPricing: {
      deliveryPricePerTimeUnit: object.deliveryPricePerTimeUnit,
      defaultDeliveryPricePerTimeUnit: object.defaultDeliveryPricePerTimeUnit,
      totalDeliveryPrice: object.totalDeliveryPrice,
      defaultTotalDeliveryPrice: object.defaultTotalDeliveryPrice,
    } as VAdjustDeliveryQuotePrice,
  } as VAdjustQuotePrice;
}

export {
  toVRadioItem,
  toVSelectOptionItem,
  toVCheckboxItem,
  toVAddress,
  toVAdjustQuotePriceForSupplyDelivery,
  toVAdjustQuotePriceForDeliveryOnly,
};
