type VQuoteMaterialInfo = {
  materialName: string;
  quantity: number;
  materialUnitName: string;
  vehicleType: string;
  pricePerUnit?: number;
  totalPrice?: number;
  depotName?: string;
  deliveryLocation?: string;
  onewayJourneyTime?: number;
};

export default VQuoteMaterialInfo;
