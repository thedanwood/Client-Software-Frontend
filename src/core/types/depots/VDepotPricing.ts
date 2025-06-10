import VDepotMaterialPricingTableRow from "./VDepotMaterialPricingTableRow";

type VDepotPricing = {
  depotId: number;
  depotName: string;
  materialInfo: VDepotMaterialPricingTableRow[];
};

export default VDepotPricing;
