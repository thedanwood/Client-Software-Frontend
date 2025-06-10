import {
  MaterialDto,
  MaterialUnitDto,
  RoutingParameters,
  MaterialMovementForDisplayDto,
  CompanyDto,
  VehicleTypeDto,
} from "../api/haulage-system";
import { appSettings } from "../core/constants";
import { getNumberOfLoadsFromCapacityAndQuantity, formatNullableDate } from "../core/functions/sharedFunctions";
import { toVCheckboxItem } from "../core/mappers/toFrontendMappers";
import {
  VSupplyDeliveryJourney,
  VDeliveryJourney,
  VAddedDepotPricingOptions,
  VAddedJourneyTimes,
  VAddedDepotPricingOption,
} from "../core/types/quotes";
import { VAddress, VCompany, VVehicleType, VCheckboxItem } from "../core/types/shared";
import cloneDeep from "lodash.clonedeep";
import { defineStore } from "pinia";

const supplyDeliveryState = {
  selectedSupplyDeliveryJourneys: [] as VSupplyDeliveryJourney[],
  deliveryLocation: {} as VAddress,
};

const deliveryOnlyState = {
  selectedDeliveryJourneys: [] as VDeliveryJourney[],
  numberOfLoads: 0,
};

export const useHaulageSystemStore = defineStore({
  id: "haulageSystem",

  state: () => ({
    ...supplyDeliveryState,
    ...deliveryOnlyState,
    isLoading: false as boolean,
    quoteId: null as number,
    quoteType: null as number,
    tableRowCount: 10 as number,
    isLoadingInitialData: false,
    deliveryLocation: null as VAddress,
    companies: [] as VCompany[],
    vehicleTypes: [] as VVehicleType[],
    materials: [] as MaterialDto[],
    materialUnits: [] as MaterialUnitDto[],
    addedDepotMaterialPricingsOptions: [] as VAddedDepotPricingOptions[],
    addedJourneyTimes: [] as VAddedJourneyTimes[],
    routingParametersCheckboxOptions: [
      toVCheckboxItem(RoutingParameters.Traffic, "Has traffic enabled"),
    ] as VCheckboxItem[],
    defaultHasTrafficEnabled: null as boolean,
    companyId: null,
    companyName: null,
    customerName: null,
    comments: null,
    deliveryDate: null as Date | null,
  }),

  getters: {
    isEditAction: (state: any) => state?.quoteId !== null && state?.quoteId?.length > 0,
    isDeliveryLocationSelected: (state: any) => {
      return state.deliveryLocation?.latitude != null;
    },
    hasQuoteType: (state: any) => state.quoteId == null,
    selectedCompany: (state: any) => {
      return state.companies.find((x) => x.id === state.companyId);
    },
    getNewSupplyDeliveryDepotOptionId: (state: any) => {
      return (
        state.addedDepotMaterialPricingsOptions.filter((x) => x.id != appSettings.addNewMovementDefaultId).length + 1
      );
    },
    getAddedDepotMaterialPricingOptionsByIdAndHasTraffic:
      (state: any) =>
      (id: number, hasTrafficEnabled: boolean): VAddedDepotPricingOption[] => {
        return state.addedDepotMaterialPricingsOptions
          .find((x) => x.id == id)
          ?.depots.filter((x) => x.hasTrafficEnabled == hasTrafficEnabled);
      },
    getAddedDepotMaterialPricingOptionsById:
      (state: any) =>
      (id: number): VAddedDepotPricingOption[] => {
        return state.addedDepotMaterialPricingsOptions.find((x) => x.id == id)?.depots;
      },
    getSelectedDeliveryJourneyTime:
      (state: any) =>
      (id: number): VAddedJourneyTimes => {
        let journey = state.getSelectedDeliveryJourneyById(id);
        let addedJourneyTimes = state.getAddedJourneyTimesByJourneyId(id);
        return addedJourneyTimes.find((x) => x.hasTrafficEnabled == journey.hasTrafficEnabled);
      },
    getSelectedSupplyDeliveryJourneyTime:
      (state: any) =>
      (journeyId: number): VAddedJourneyTimes => {
        let journey = state.getSelectedSupplyDeliveryJourneyById(journeyId);

        let depotPricings = state.getAddedDepotMaterialPricingOptionsById(journeyId);

        let journeyTimeId = depotPricings.find(
          (x) =>
            x.hasTrafficEnabled == journey.hasTrafficEnabled && x.depotMaterialPriceId == journey.depotMaterialPriceId
        ).journeyTimeId;

        return state.addedJourneyTimes.find((x) => x.journeyTimeId == journeyTimeId);
      },
    getAddedJourneyTimeByJourneyTimeId:
      (state: any) =>
      (id: number): number => {
        return state.addedJourneyTimes.find((x) => x.journeyTimeId == id)?.journeyTime;
      },
    getSelectedSupplyDeliveryJourneyById:
      (state: any) =>
      (id: number): VSupplyDeliveryJourney => {
        return state.selectedSupplyDeliveryJourneys.find((x) => x.id == id);
      },
    getSelectedDeliveryJourneyById:
      (state: any) =>
      (id: number): VDeliveryJourney => {
        return state.selectedDeliveryJourneys.find((x) => x.id == id);
      },
    getAddedJourneyTimesByJourneyId:
      (state: any) =>
      (id: number): VAddedJourneyTimes[] => {
        return state.addedJourneyTimes.filter((x) => x.id == id);
      },
    getVehicleTypeById:
      (state: any) =>
      (id: number): VVehicleType => {
        return state.vehicleTypes.find((x) => x.id == id);
      },
    getMaterialUnitById:
      (state: any) =>
      (id: number): MaterialUnitDto => {
        return state.materialUnits.find((x) => x.id == id);
      },
    getMaterialById:
      (state: any) =>
      (id: number): MaterialDto => {
        return state.materials.find((x) => x.id == id);
      },
    getSupplyDeliveryNumberOfLoads:
      (state: any) =>
      (journeyId: number): number => {
        let journey = state.getSelectedSupplyDeliveryJourneyById(journeyId);
        let vehicleType = state.getVehicleTypeById(journey.vehicleTypeId);
        return getNumberOfLoadsFromCapacityAndQuantity(vehicleType.capacity, journey.quantity);
      },
  },

  actions: {
    setDefaultHasTrafficEnabled(defaultValue: boolean) {
      this.defaultHasTrafficEnabled = defaultValue;
    },
    setisLoadingInitialData(isLoading: boolean) {
      this.isLoadingInitialData = isLoading;
    },
    setErrorMessage(message: string) {
      this.errorMessage = message;
    },
    setAddedJourneyTimes(addedJourneyTimes: VAddedJourneyTimes[]) {
      addedJourneyTimes.forEach((time) => {
        this.addedJourneyTimes.push(time);
      });
    },
    resetAddedJourneyTimes() {
      this.addedJourneyTimes = [];
    },
    setAddedJourneyTimesId(oldId: number, newId: number) {
      let addedJourneyTimes = this.addedJourneyTimes.filter((x) => x.id == oldId);
      if (addedJourneyTimes.length > 0) {
        addedJourneyTimes.forEach((addedJourneyTime, i) => {
          let newJourneyTime = {
            id: newId,
            journeyTimeId: addedJourneyTime.journeyTimeId,
            journeyTime: addedJourneyTime.journeyTime,
            hasTrafficEnabled: addedJourneyTime.hasTrafficEnabled,
          } as VAddedJourneyTimes;
          this.addedJourneyTimes.push(newJourneyTime);
        });
      }
    },
    removeAddedJourneyTimes(id: number) {
      this.addedJourneyTimes = this.addedJourneyTimes.filter((x) => x.id !== id);
    },
    updateAddedJourneyTime(journeyTimeId: number, newTime: number) {
      let journeyTime = this.addedJourneyTimes.find((x) => x.journeyTimeId == journeyTimeId);
      journeyTime.journeyTime = newTime;
    },
    setCompanyId(companyId: number) {
      this.companyId = companyId;
    },
    setAddedDepotMaterialPricingOptionsId(oldId: number, newId: number) {
      let addedDepots = this.addedDepotMaterialPricingsOptions.filter((x) => x.id == oldId);
      if (addedDepots.length > 0) {
        addedDepots.forEach((depot) => {
          let newDepot = {
            id: newId,
            depots: depot.depots,
          } as VAddedDepotPricingOptions;
          this.addedDepotMaterialPricingsOptions.push(newDepot);
        });
      }
    },
    removeAddedDepotMaterialPricingOptionsById(id: number) {
      this.addedDepotMaterialPricingsOptions = this.addedDepotMaterialPricingsOptions.filter((x) => x.id != id);
    },
    setAddedDepotMaterialPricingOptions(
      depotList: MaterialMovementForDisplayDto[],
      id: number,
      hasTrafficEnabled: boolean
    ) {
      let formattedDepotList = [];
      depotList.forEach((x) => {
        let journeyTimeId = this.addedJourneyTimes.length + 1;
        this.setAddedJourneyTimes([
          {
            id: id,
            journeyTimeId: journeyTimeId,
            journeyTime: x.journeyTime,
            hasTrafficEnabled: hasTrafficEnabled,
          } as VAddedJourneyTimes,
        ]);

        let addedDepotId =
          this.addedDepotMaterialPricingsOptions.flatMap((x) => x.depots).length + formattedDepotList.length;

        formattedDepotList.push({
          id: addedDepotId,
          depotMaterialPriceId: x.depotMaterialPriceId,
          depotName: x.depotName,
          hasTrafficEnabled: hasTrafficEnabled,
          price: x.price,
          journeyTimeId: journeyTimeId,
        } as VAddedDepotPricingOption);
      });

      let existingAddedDepotPricingOptions = this.addedDepotMaterialPricingsOptions.find((x) => x.id == id);

      if (!existingAddedDepotPricingOptions) {
        this.addedDepotMaterialPricingsOptions.push({
          id: id,
          depots: formattedDepotList,
        });
      } else {
        formattedDepotList.forEach((formattedDepot) => {
          existingAddedDepotPricingOptions.depots.push(formattedDepot);
        });
      }
    },
    setCompanies(companies: CompanyDto[]) {
      this.companies = companies.map((x) => {
        return {
          id: x.id,
          name: x.name,
          email: x.email,
          phone: x.phone,
        } as VCompany;
      });
    },
    setMaterials(materials: MaterialDto[]) {
      this.materials = materials;
    },
    setMaterialUnits(materialUnits: MaterialUnitDto[]) {
      this.materialUnits = materialUnits;
    },
    setComments(comments: string) {
      this.comments = comments;
    },
    setVehicleTypes(types: VehicleTypeDto[]) {
      this.vehicleTypes = types.map((x) => {
        return {
          id: x.id,
          name: x.name,
          capacity: x.vehicleCapacity,
        } as VVehicleType;
      });
    },
    setDeliveryLocation(deliveryLocation: VAddress) {
      this.deliveryLocation = deliveryLocation;
    },
    setDeliveryOnlyNumberOfLoads(numberOfLoads: number) {
      this.numberOfLoads = numberOfLoads;
    },
    setDeliveryDate(deliveryDate: Date) {
      this.deliveryDate = formatNullableDate(deliveryDate);
    },
    setCustomerName(customerName: string) {
      this.customerName = customerName;
    },
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },
    setQuoteId(id: number) {
      this.quoteId = id;
    },
    setQuoteType(type: number) {
      this.quoteType = type;
    },
    removeSelectedSupplyDeliveryJourney(id: number) {
      this.selectedSupplyDeliveryJourneys = this.selectedSupplyDeliveryJourneys.filter((x) => x.id !== id);
    },
    setSelectedSupplyDeliveryJourneys(materials: VSupplyDeliveryJourney[]): void {
      this.selectedSupplyDeliveryJourneys = [];
      materials.forEach((material) => {
        this.setSelectedSupplyDeliveryJourney(material);
      });
    },
    setSelectedSupplyDeliveryJourney(journey: VSupplyDeliveryJourney, updateId?: number): void {
      journey.id = updateId ?? this.selectedSupplyDeliveryJourneys.length + 1;
      if (updateId == null) {
        let hasExstingMaterials = this.selectedSupplyDeliveryJourneys?.length > 0;
        let newList = [journey];
        if (hasExstingMaterials) {
          newList = [...this.selectedSupplyDeliveryJourneys, journey];
        }
        this.selectedSupplyDeliveryJourneys = newList;
      } else {
        const updatedMaterials = cloneDeep(this.selectedSupplyDeliveryJourneys);
        const index = updatedMaterials.findIndex((x) => x.id === updateId);
        if (index >= 0) {
          updatedMaterials[index] = journey;
          this.selectedSupplyDeliveryJourneys = updatedMaterials;
        }
      }
    },
    resetSelectedDeliveryJourneys() {
      this.selectedDeliveryJourneys = [];
    },
    removeSelectedDeliveryJourney(id: number) {
      this.selectedDeliveryJourneys = [...this.selectedDeliveryJourneys.filter((x) => x.id !== id)];
    },
    setSelectedDeliveryJourney(journey: VDeliveryJourney, updateId?: number) {
      if (updateId == null) {
        let hasExstingJourneys = this.selectedDeliveryJourneys?.length > 0;
        let newList = [journey];
        if (hasExstingJourneys) {
          newList = [...this.selectedDeliveryJourneys, journey];
        }
        this.selectedDeliveryJourneys = newList;
      } else {
        const updatedJourneys = cloneDeep(this.selectedDeliveryJourneys);
        const index = updatedJourneys.findIndex((x) => x.id === updateId);
        if (index >= 0) {
          updatedJourneys[index] = journey;
          this.selectedDeliveryJourneys = updatedJourneys;
        }
      }
    },
  },
});
