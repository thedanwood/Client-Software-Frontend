type VSavedQuoteTableRowMovementInfo = {
  id: number;
  deliveryMovementId: number;
  materialMovementId: number;
  onewayJourneyTime: number;
  startLocation: string;
  numberOfLoads: number;
  materialName: string;
  quantity: number;
  materialUnitName: string;
  materialTotalPrice: number;
  materialPricePerQuantityUnit: number;
  vehicleTypeName: string;
  depotName: string;
};
export default VSavedQuoteTableRowMovementInfo;
