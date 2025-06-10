import VAdjustDeliveryQuotePrice from "./VAdjustDeliveryQuotePrice";
import VAdjustMaterialQuotePrice from "./VAdjustMaterialQuotePrice";

type VAdjustQuotePrice = {
  id: number;
  deliveryMovementId?: number | null;
  materialMovementId?: number | null;
  defaultOnewayJourneyTime: number;
  deliveryPricing: VAdjustDeliveryQuotePrice;
  materialPricing: VAdjustMaterialQuotePrice;
  materialAndDeliveryPricePerQuantityUnit: number;
  defaultMaterialAndDeliveryPricePerQuantityUnit: number;
};

export default VAdjustQuotePrice;
