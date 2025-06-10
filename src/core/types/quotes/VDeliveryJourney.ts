import { RoutingParameters } from "@/api/haulage-system";
import { VAddress } from "../shared";

type VDeliveryJourney = {
  id: number;
  deliveryMovementId: number;
  hasTrafficEnabled: boolean;
  startLocation: VAddress;
  vehicleTypeId: number;
};

export default VDeliveryJourney;
