import { RoutingParameters } from "@/api/haulage-system";

type VAddedDepotPricingOption = {
  id: number;
  depotMaterialPriceId: number;
  price: number;
  hasTrafficEnabled: boolean;
  depotName: string;
  journeyTimeId: number;
};

export default VAddedDepotPricingOption;
