import { RoutingParameters } from "@/api/haulage-system";

type VAddedJourneyTimes = {
  id: number;
  journeyTimeId: number;
  journeyTime: number;
  hasTrafficEnabled: boolean;
};

export default VAddedJourneyTimes;
