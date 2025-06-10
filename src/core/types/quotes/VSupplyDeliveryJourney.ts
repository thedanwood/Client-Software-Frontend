type VSupplyDeliveryJourney = {
  //set id to nullable to fix linting error
  id?: number;
  materialMovementId?: number | null;
  materialId: number;
  depotMaterialPriceId: number;
  quantity: number;
  materialUnitId: number;
  vehicleTypeId: number;
  depotName: string;
  hasTrafficEnabled: boolean;
};

export default VSupplyDeliveryJourney;
