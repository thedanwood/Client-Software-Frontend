import VMaterialPriceItem from "./VMaterialPriceItem";

type VDepotMaterialPricingTableRow = {
  id: number;
  materialName: string;
  materialId: number;
  prices: VMaterialPriceItem[];
};

export default VDepotMaterialPricingTableRow;
