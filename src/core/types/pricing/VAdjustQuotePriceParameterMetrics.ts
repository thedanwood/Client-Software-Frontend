import { VAddress } from "../shared";

type VAdjustQuotePriceParameterMetrics = {
  quoteType: number;
  numberOfLoads: number;
  onewayJourneyTime: number;
  quantity: number;
  vehicleTypeName: string;
  materialUnitName: string;
  materialName: string;
  startLocation: string;
  deliveryLocation: string;
  depotName: string;
};

export default VAdjustQuotePriceParameterMetrics;
