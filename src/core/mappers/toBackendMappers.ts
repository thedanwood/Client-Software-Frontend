import { AddressDto, RoutePoint } from "../../api/haulage-system";
function toAddressDto(latitude: number, longitude: number, fullAddress: string): AddressDto {
  let command = new AddressDto();
  command.addressPoint = toRoutePoint(latitude, longitude);
  command.fullAddress = fullAddress;
  return command;
}

function toRoutePoint(latitude: number, longitude: number): RoutePoint {
  let routePoint = new RoutePoint();
  routePoint.latitude = latitude;
  routePoint.longitude = longitude;
  return routePoint;
}

export { toRoutePoint, toAddressDto };
