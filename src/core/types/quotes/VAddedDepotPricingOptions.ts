import { DepotMaterialPricingDto } from "@/api/haulage-system";
import VAddedDepotPricingOption from "./VMaterialMovementDIsplayData";

type VAddedDepotPricingOptions = {
  id: number;
  depots: VAddedDepotPricingOption[];
};

export default VAddedDepotPricingOptions;
