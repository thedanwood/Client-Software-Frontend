import { VAddress } from "../shared";

type VAdjustQuotePriceRecalcMetrics = {
  id: number;
  quoteType: number;
  numberOfLoads: number;
  onewayJourneyTime: number;
  quantity: number;
};

export default VAdjustQuotePriceRecalcMetrics;
