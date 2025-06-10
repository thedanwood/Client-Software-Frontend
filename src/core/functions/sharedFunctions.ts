import { Ref } from "vue";
import { VAddress } from "../types/shared";
import { RoutingParameters } from "../../api/haulage-system";

function getHtmlEvent(event: Event) {
  return event.target as HTMLInputElement;
}

function getCollapseAttributes(identifier: string) {
  return {
    "data-bs-toggle": "collapse",
    "data-bs-target": `#collapse-${identifier}`,
    "aria-expanded": "false",
    "aria-controls": `collapse-${identifier}`,
  };
}

function sortAscendingAlphabetical(sortArray, field) {
  return sortArray.sort((a, b) => {
    const valueA = String(a[field]).toLowerCase();
    const valueB = String(b[field]).toLowerCase();

    if (valueA > valueB) return -1;
    if (valueA < valueB) return 1;
    return 0;
  });
}

function getHighlight(currentPrice: number, originalPrice?: number) {
  if (originalPrice !== currentPrice) {
    return "input-updated";
  }
  return "";
}

function getErrorsArrayFromList(index: number, validationObject: any) {}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function setModalOpenState(isModalOpen: Ref<boolean>, isOpen: boolean) {
  isModalOpen.value = isOpen;
}

function isAddressValidated(address: VAddress) {
  if (address == null) return false;
  return address?.latitude !== null;
}

function isAddressMatching(address1: VAddress, address2: VAddress) {
  return (
    address1.fullAddress == address2.fullAddress &&
    address1.latitude == address2.latitude &&
    address1.longitude == address2.longitude
  );
}

function showAlert(showAlertBox: Ref<boolean>) {
  showAlertBox.value = true;
  setTimeout(() => {
    showAlertBox.value = false;
  }, 7000);
}

function downloadFile(data: any, fileName: string) {
  const blob = new Blob([data], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

function getNumberOfLoadsFromCapacityAndQuantity(vehicleCapacity: number, quantity: number) {
  return Math.floor((quantity + vehicleCapacity - 1) / vehicleCapacity);
}

function formatNullableDate(date: Date) {
  //null date passed from backend as 01/01/0001
  if (date == null || date.getFullYear() == 1) {
    return null;
  }
  return date;
}

function getSelectedRoutingParmeters(hasTrafficEnabled: boolean) {
  let routingParameters = [];
  if (hasTrafficEnabled) {
    routingParameters.push(RoutingParameters.Traffic);
  }
  return routingParameters;
}

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

export {
  setModalOpenState,
  showAlert,
  getHtmlEvent,
  getCollapseAttributes,
  delay,
  sortAscendingAlphabetical,
  getHighlight,
  groupBy,
  isAddressValidated,
  isAddressMatching,
  downloadFile,
  getSelectedRoutingParmeters,
  formatNullableDate,
  getNumberOfLoadsFromCapacityAndQuantity,
};
