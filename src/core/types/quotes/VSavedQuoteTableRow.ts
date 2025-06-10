type VSavedQuoteTableRow = {
  id: number;
  quoteNumber: number;
  quoteType: number;
  creationInfo: VSavedQuoteTableRowCreationInfo;
  deliveryInfo: VSavedQuoteTableRowDeliveryInfo;
  movements: VSavedQuoteTableRowMovementInfo[];
  comments: string;
  totalQuotePrice: number;
};

type VSavedQuoteTableRowDeliveryInfo = {
  deliveryDate: string;
  deliveryLocation: string;
};

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

type VSavedQuoteTableRowCreationInfo = {
  customerName: string;
  companyName: string;
  companyId: number;
  createdByName: string;
  createdDateTime: string;
};

export type {
  VSavedQuoteTableRow,
  VSavedQuoteTableRowMovementInfo,
  VSavedQuoteTableRowCreationInfo,
  VSavedQuoteTableRowDeliveryInfo,
};
