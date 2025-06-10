<template>
  <h1 class="page-title">{{ isEditAction ? "Update" : "Add New" }} Haulage Only Quote</h1>
  <br />
  <form class="create-quote-container">
    <BaseQuote>
      <template v-slot:middle>
        <div class="mt-2">
          <AlertBox
            v-if="showJourneyAddedAlert"
            class="alert-success"
            :text="config.successMessages.journeyAdded"
          ></AlertBox>
          <NumberPicker
            label="Number of loads *"
            containerClass="mt-3"
            class="w-100"
            :disabled="isLoading"
            :value="numberOfLoads"
            @change="(newVal) => setNumLoads(newVal)"
          />
          <VuelidateErrors :errors="v$.numberOfLoads?.$errors" />

          <div class="mt-3">
            <AddressLookupInput
              label="Delivery Location *"
              placeholder="Enter a delivery address"
              :disabled="isLoading"
              :location="deliveryLocation"
              @change="(loc) => setDeliveryLocation(loc)"
            />
            <VuelidateErrors :errors="v$.deliveryLocation.$errors" />
          </div>

          <label class="input-label mt-3">Journeys</label>
          <div class="input-element">
            <CollapsableButton :isLoading="isLoading" :identifier="addJourneyIdentifier">
              <template v-slot:button>
                <Button
                  style="width: fit-content"
                  class="btn-dark"
                  value="Add Journey"
                  :attributes="getCollapseAttributes(addJourneyIdentifier)"
                  :iconBefore="['fas', 'plus']"
                  :iconAfter="['fas', isAddJourneyCollapseOpen ? 'chevron-up' : 'chevron-down']"
                  @click="toggleJourneyCollapse"
                />
              </template>
            </CollapsableButton>
            <CollapsableContainer
              :identifier="addJourneyIdentifier"
              :isOpen="isAddJourneyCollapseOpen"
              @toggle="toggleJourneyCollapse"
            >
              <template v-slot:content>
                <AddOrUpdateDeliveryJourney
                  :id="appSettings.addNewMovementDefaultId"
                  :updatingJourney="null"
                  :disabled="isLoading"
                  :parentFormValidation="v$"
                  @validate-number-of-loads="v$.numberOfLoads.$validate()"
                  @journeyUpdated="onJourneyUpdated"
                />
              </template>
            </CollapsableContainer>
          </div>

          <div class="mb-3" v-if="selectedDeliveryJourneys.length">
            <AddedDeliveryJourney
              v-for="journey in selectedDeliveryJourneys"
              :disabled="isLoading"
              :journey="journey"
              :uniqueId="journey.id"
              @remove="(id) => removeAddedJourney(id)"
            />
          </div>
          <VuelidateErrors :errors="v$.selectedJourneys.$errors" />
        </div>
      </template>
    </BaseQuote>
    <Input
      v-if="selectedDeliveryJourneys.length > 0"
      class="mt-3 quote-total-price-container"
      label="Total Quote Price"
      :disabled="true"
      :value="totalQuotesPrice"
    />
    <div class="adjust-price-container adjust-price-scroll" v-if="getPricings.length > 0">
      <CollapsableButton :identifier="adjustPricesCollapseIdentifier" :isLoading="isLoading">
        <template v-slot:button>
          <Button
            style="width: fit-content"
            class="btn-dark mt-3"
            value="Adjust Prices"
            :attributes="getCollapseAttributes(adjustPricesCollapseIdentifier)"
            :iconAfter="['fas', isAdjustPricesCollapseOpen ? 'chevron-up' : 'chevron-down']"
            @click="isAdjustPricesCollapseOpen = !isAdjustPricesCollapseOpen"
          />
        </template>
      </CollapsableButton>
      <CollapsableContainer
        :identifier="adjustPricesCollapseIdentifier"
        :isOpen="isAdjustPricesCollapseOpen"
        :showCloseButton="false"
        @toggle="isAdjustPricesCollapseOpen = !isAdjustPricesCollapseOpen"
      >
        <template v-slot:content>
          <div class="adjust-prices-container">
            <AdjustPrice
              class="cursor-pointer"
              v-for="(pricing, i) in getPricings"
              :id="pricing.id"
              :disabled="isLoading"
              :metrics="toAdjustPriceMetrics(pricing.id)"
              :is-open="getAdjustPriceOpenState(pricing.id)?.isOpen"
              @toggle-is-open="toggleAdjustPriceOpenState(pricing.id)"
              @journey-time-updated="(journeyTime) => updateJourneyTime(pricing.id, journeyTime)"
            />
          </div>
        </template>
      </CollapsableContainer>
    </div>
    <Button
      v-if="!isEditAction"
      class="btn-green ml-auto btn-big mt-3"
      value="Generate Quote"
      :iconBefore="['fas', 'floppy-disk']"
      :disabled="isLoading"
      @click="createQuote()"
    />
    <Button
      v-else
      class="btn-green ml-auto btn-big mt-3"
      value="Update Quote"
      :iconBefore="['fas', 'floppy-disk']"
      :disabled="isLoading"
      @click="updateQuote()"
    />
  </form>
</template>

<script lang="ts" setup>
import {
  CollapsableButton,
  Button,
  CollapsableContainer,
  AlertBox,
  VuelidateErrors,
  AddressLookupInput,
  NumberPicker,
  Input,
} from "../../components/shared";
import { BaseQuote, AddOrUpdateDeliveryJourney, AddedDeliveryJourney } from "../../components/quotes";
import { AdjustPrice } from "../../components/pricing";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import {
  QuoteClient,
  CreateDeliveryOnlyQuoteCommand,
  UpdateDeliveryOnlyQuoteCommand,
  UpdateDeliveryMovementDto,
  CreateDeliveryMovementDto,
  CreateDeliveryMovementPricingDto,
  UpdateQuoteDeliveryOnlyInitialDataDto,
  CompanyDto,
  GetNewDeliveryOnlyMovementPricingQuery,
  AdjustDeliveryQuotePricingDto,
  RecordTypes,
} from "../../api/haulage-system";
import { fieldNames, config, appSettings } from "../../core/constants";
import { RouterNames } from "../../core/enums/RouterNames";
import { formatPrice } from "../../core/functions/financialFunctions";
import { isAddressValidated, isAddressMatching, getCollapseAttributes } from "../../core/functions/sharedFunctions";
import { toAddressDto, toRoutePoint } from "../../core/mappers/toBackendMappers";
import { toVAddress } from "../../core/mappers/toFrontendMappers";
import {
  VAdjustQuotePriceParameterMetrics,
  VAdjustQuotePrice,
  VAdjustDeliveryQuotePrice,
} from "../../core/types/pricing";
import { VAddedJourneyTimes, VDeliveryJourney } from "../../core/types/quotes";
import { VAddress } from "../../core/types/shared";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { required, minValue, helpers, minLength } from "@vuelidate/validators";
import { storeToRefs } from "pinia";
import { Ref, ref, onBeforeMount, watch, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const priceStore = useAdjustQuotePriceStore();
const { getPricings, getPricing, getTotalQuotesPrice, getRecalcMetrics } = storeToRefs(priceStore);
const globalStore = useGlobalStore();
const { deliveryUnit } = storeToRefs(globalStore);
const store = useHaulageSystemStore();
const {
  isEditAction,
  isLoading,
  selectedDeliveryJourneys,
  numberOfLoads,
  deliveryLocation,
  vehicleTypes,
  companyId,
  customerName,
  deliveryDate,
  addedJourneyTimes,
  quoteType,
  isLoadingInitialData,
  getSelectedDeliveryJourneyById,
  getSelectedDeliveryJourneyTime,
  getVehicleTypeById,
  comments,
} = storeToRefs(store);

const props = defineProps<{
  quoteId?: number;
}>();

let addJourneyIdentifier = "add-journey";
let adjustPricesCollapseIdentifier = "adjust-prices-container";

const isAddJourneyCollapseOpen: Ref<boolean> = ref(true);
const isAdjustPricesCollapseOpen: Ref<boolean> = ref(true);
const showJourneyAddedAlert: Ref<boolean> = ref(false);
let adjustPricesOpenStates: Ref<{ id: number; isOpen: boolean }[]> = ref([]);

const isAllMetricsSetForTotalPrice = computed<boolean>(() => {
  return getPricings.value.every((x) => {
    return getRecalcMetrics.value(x.id) != null;
  });
});

const totalQuotesPrice = computed<string>(() => {
  if (isAllMetricsSetForTotalPrice.value) {
    return formatPrice(getTotalQuotesPrice.value);
  } else {
    return "";
  }
});

const rules = {
  numberOfLoads: {
    required,
    minValue: minValue(1),
  },
  selectedJourneys: {
    required: helpers.withMessage("You must add at least one delivery journey", required),
  },
  deliveryLocation: { required },
  vehicleTypes: {
    required,
    minLength: helpers.withMessage("You must select at least 1 vehicle type", minLength(1)),
  },
} as any;

const v$ = useVuelidate(rules, {
  numberOfLoads: numberOfLoads,
  selectedJourneys: selectedDeliveryJourneys,
  deliveryLocation: deliveryLocation,
  vehicleTypes: vehicleTypes,
});

function setNumLoads(val) {
  numberOfLoads.value = val;
}

function setDeliveryLocation(location: VAddress) {
  store.setDeliveryLocation(location);
  if (isAddressValidated(location)) {
    selectedDeliveryJourneys.value.forEach((journey) => {
      console.log("called inside set delivery");
      getNewJourneyPricing(journey.id);
    });
  }
}

function updateJourneyTime(journeyId: number, journeyTime: number) {
  let journeyTimeId = getSelectedDeliveryJourneyTime.value(journeyId).journeyTimeId;
  store.updateAddedJourneyTime(journeyTimeId, journeyTime);
  priceStore.setTrackingHistoryItem(fieldNames.priceStore.onewayJourneyTime, journeyId);
}

function toggleAdjustPriceOpenState(id: number) {
  let state = getAdjustPriceOpenState(id);
  setAdjustPriceOpenState(id, !state.isOpen);
}
function getAdjustPriceOpenState(id: number) {
  return adjustPricesOpenStates.value.find((x) => x.id == id);
}
function setAdjustPriceOpenState(id: number, isOpenState: boolean) {
  let state = getAdjustPriceOpenState(id);
  state.isOpen = isOpenState;
}

function toAdjustPriceMetrics(journeyId: number) {
  let journey = getSelectedDeliveryJourneyById.value(journeyId);
  let journeyTime = getSelectedDeliveryJourneyTime.value(journeyId).journeyTime;
  let vehicleTypeName = getVehicleTypeById.value(journey.vehicleTypeId).name;
  return {
    quoteType: quoteType.value,
    onewayJourneyTime: journeyTime,
    deliveryLocation: deliveryLocation.value.fullAddress,
    startLocation: journey.startLocation.fullAddress,
    numberOfLoads: numberOfLoads.value,
    vehicleTypeName: vehicleTypeName,
    deliveryUnitName: deliveryUnit.value.deliveryUnitName,
    quantity: null,
    materialUnitName: null,
    materialName: null,
    depotName: null,
  } as VAdjustQuotePriceParameterMetrics;
}

async function createQuote() {
  await v$.value.$touch();
  if (!(await isFormValid())) {
    return;
  }
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .createDeliveryOnlyQuote(toCreateQuoteCommand())
    .then(async (response) => {
      router.push({
        name: RouterNames.SavedQuotes,
        params: {
          quoteId: response,
        },
      });
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

async function updateQuote() {
  await v$.value.$touch();
  if (!(await isFormValid())) {
    return;
  }
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .updateDeliveryOnlyQuote(props.quoteId, toUpdateQuoteCommand())
    .then(async () => {
      router.push({
        name: RouterNames.SavedQuotes,
        params: {
          quoteId: props.quoteId,
        },
      });
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

function toCreateQuoteCommand(): CreateDeliveryOnlyQuoteCommand {
  let command = new CreateDeliveryOnlyQuoteCommand();
  command.companyId = companyId.value ?? 0;
  command.customerName = customerName.value ?? "";
  command.deliveryLocation = toAddressDto(
    deliveryLocation.value.latitude,
    deliveryLocation.value.longitude,
    deliveryLocation.value.fullAddress
  );
  command.deliveryDateTime = deliveryDate.value ?? new Date();
  command.comments = comments.value ?? "";
  command.numberOfLoads = numberOfLoads.value;
  command.deliveryMovements = toCreateDeliveryMovementsDto();
  return command;
}

function toUpdateQuoteCommand(): UpdateDeliveryOnlyQuoteCommand {
  let command = new UpdateDeliveryOnlyQuoteCommand();
  command.companyId = companyId.value;
  command.customerName = customerName.value;
  command.deliveryLocation = toAddressDto(
    deliveryLocation.value.latitude,
    deliveryLocation.value.longitude,
    deliveryLocation.value.fullAddress
  );
  command.deliveryDateTime = deliveryDate.value;
  command.comments = comments.value;
  command.numberOfLoads = numberOfLoads.value;
  command.deliveryMovements = toUpdateDeliveryMovementsDto();
  command.quoteId = 0;
  return command;
}

function toUpdateDeliveryMovementsDto(): UpdateDeliveryMovementDto[] {
  return selectedDeliveryJourneys.value.map((x) => {
    let prices = getPricing.value(x.id);
    let command = new UpdateDeliveryMovementDto();
    command.deliveryMovementId = x.deliveryMovementId;
    command.startLocation = toAddressDto(
      x.startLocation.latitude,
      x.startLocation.longitude,
      x.startLocation.fullAddress
    );
    (command.vehicleTypeId = x.vehicleTypeId), (command.pricing = toDeliveryMovementPricingDto(prices, x.id));
    return command;
  });
}

function toCreateDeliveryMovementsDto(): CreateDeliveryMovementDto[] {
  return selectedDeliveryJourneys.value.map((x) => {
    let prices = getPricing.value(x.id);
    let command = new CreateDeliveryMovementDto();
    command.startLocation = toAddressDto(
      x.startLocation.latitude,
      x.startLocation.longitude,
      x.startLocation.fullAddress
    );
    (command.vehicleTypeId = x.vehicleTypeId), (command.pricing = toDeliveryMovementPricingDto(prices, x.id));
    return command;
  });
}

function toDeliveryMovementPricingDto(prices: VAdjustQuotePrice, id: number): CreateDeliveryMovementPricingDto {
  let journeyTime = getSelectedDeliveryJourneyTime.value(id).journeyTime;

  let command = new CreateDeliveryMovementPricingDto();
  command.defaultOnewayJourneyTime = prices.defaultOnewayJourneyTime;
  command.onewayJourneyTime = journeyTime;
  command.totalDeliveryPrice = prices.deliveryPricing.totalDeliveryPrice;
  command.defaultTotalDeliveryPrice = prices.deliveryPricing.defaultTotalDeliveryPrice;
  command.deliveryPricePerMinute = prices.deliveryPricing.deliveryPricePerTimeUnit;
  command.defaultDeliveryPricePerMinute = prices.deliveryPricing.defaultDeliveryPricePerTimeUnit;
  return command;
}

async function isFormValid(): Promise<boolean> {
  return await v$.value.$validate();
}

function onJourneyUpdated(): void {
  showJourneyAddedAlert.value = true;
  setTimeout(() => {
    showJourneyAddedAlert.value = false;
  }, 3000);
}

function toggleJourneyCollapse(): void {
  isAddJourneyCollapseOpen.value = !isAddJourneyCollapseOpen.value;
}

async function getUpdatePageData(): Promise<void> {
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getDeliveryOnlyUpdateQuoteInitialData(props.quoteId)
    .then(async (response) => {
      await setUpdateInitialData(response);
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

async function setUpdateInitialData(response: UpdateQuoteDeliveryOnlyInitialDataDto) {
  let deliveryAddress = toVAddress(
    response.deliveryLocation.addressPoint.latitude,
    response.deliveryLocation.addressPoint.longitude,
    response.deliveryLocation.fullAddress
  );
  store.setDefaultHasTrafficEnabled(response.defaultHasTrafficEnabled);
  store.setCustomerName(response.customerName);
  store.setDeliveryOnlyNumberOfLoads(response.numberOfLoads);
  store.setVehicleTypes(response.vehicleTypes);
  store.setDeliveryDate(response.deliveryDate);
  store.setDeliveryLocation(deliveryAddress);
  store.setComments(response.comments);
  store.setCompanyId(response.companyInfo.id);
  store.setCompanies([
    {
      id: response.companyInfo.id,
      name: response.companyInfo.name,
    } as CompanyDto,
  ]);

  response.deliveryMovements.forEach((deliveryMovement) => {
    let startLocation = toVAddress(
      deliveryMovement.startLocation.addressPoint.latitude,
      deliveryMovement.startLocation.addressPoint.longitude,
      deliveryMovement.startLocation.fullAddress
    );
    let journeyId = selectedDeliveryJourneys.value.length + 1;

    deliveryMovement.journeyTimes.forEach((journeyTime) => {
      let journeyTimeId = addedJourneyTimes.value.length + 1;

      store.setAddedJourneyTimes([
        {
          id: journeyId,
          journeyTimeId: journeyTimeId,
          journeyTime: journeyTime.journeyTime,
          hasTrafficEnabled: journeyTime.hasTrafficEnabled,
        } as VAddedJourneyTimes,
      ]);
    });

    store.setSelectedDeliveryJourney({
      deliveryMovementId: deliveryMovement.deliveryMovementId,
      id: journeyId,
      deliveryLocation: deliveryAddress,
      startLocation: startLocation,
      vehicleTypeId: deliveryMovement.vehicleTypeId,
      hasTrafficEnabled: deliveryMovement.hasTrafficEnabled,
    } as VDeliveryJourney);

    priceStore.setPricing({
      id: journeyId,
      deliveryMovementId: deliveryMovement.deliveryMovementId,
      defaultOnewayJourneyTime: deliveryMovement.defaultOnewayJourneyTime,
      deliveryPricing: {
        totalDeliveryPrice: deliveryMovement.totalDeliveryPrice,
        defaultTotalDeliveryPrice: deliveryMovement.defaultTotalDeliveryPrice,
        deliveryPricePerTimeUnit: deliveryMovement.deliveryPricePerMinute,
        defaultDeliveryPricePerTimeUnit: deliveryMovement.defaultDeliveryPricePerMinute,
      } as VAdjustDeliveryQuotePrice,
    } as VAdjustQuotePrice);
  });
}

function removeAddedJourney(id: number) {
  store.removeSelectedDeliveryJourney(id);
  store.removeAddedJourneyTimes(id);
  priceStore.removePricing(id);
}

async function getCreatePageData(): Promise<void> {
  store.setIsLoading(true);
  getAuthenticatedClient(QuoteClient)
    .getDeliveryOnlyQuoteInitialData()
    .then((response) => {
      store.setDefaultHasTrafficEnabled(response.defaultHasTrafficEnabled);
      store.setVehicleTypes(response.vehicleTypes);
    })
    .catch((ex) => {
      router.push({ name: RouterNames.FatalError });
    });
  store.setIsLoading(false);
}

function getMovementPricingQuery(id: number) {
  let journey = getSelectedDeliveryJourneyById.value(id);
  var journeyTime = getSelectedDeliveryJourneyTime.value(id);
  return {
    onewayJourneyTime: journeyTime.journeyTime,
    startLocation: toRoutePoint(journey.startLocation.latitude, journey.startLocation.longitude),
    deliveryLocation: toRoutePoint(deliveryLocation.value.latitude, deliveryLocation.value.longitude),
    numberOfLoads: numberOfLoads.value,
    vehicleTypeId: journey.vehicleTypeId,
  } as GetNewDeliveryOnlyMovementPricingQuery;
}

function getVAdjustQuotePrice(object: AdjustDeliveryQuotePricingDto, id: number) {
  return {
    id: id,
    defaultOnewayJourneyTime: object.defaultOnewayJourneyTime,
    deliveryPricing: {
      deliveryPricePerTimeUnit: object.deliveryPricePerTimeUnit,
      defaultDeliveryPricePerTimeUnit: object.defaultDeliveryPricePerTimeUnit,
      totalDeliveryPrice: object.totalDeliveryPrice,
      defaultTotalDeliveryPrice: object.defaultTotalDeliveryPrice,
      numberOfLoads: object.numberOfLoads,
    } as VAdjustDeliveryQuotePrice,
  } as VAdjustQuotePrice;
}

async function getNewJourneyPricing(id: number) {
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getNewDeliveryOnlyMovementPricing(getMovementPricingQuery(id))
    .then((response) => {
      let priceObject = getVAdjustQuotePrice(response, id);
      priceStore.setPricing(priceObject);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function checkSelectedJourneyVehicleTypeChange(newJourney: VDeliveryJourney, oldJourney: VDeliveryJourney) {
  let hasSameVehicleTypes = newJourney.vehicleTypeId == oldJourney.vehicleTypeId;

  if (!hasSameVehicleTypes) {
    getNewJourneyPricing(newJourney.id);
  }
}

function checkSelectedJourneyLocationChange(newJourney: VDeliveryJourney, oldJourney: VDeliveryJourney) {
  let hasStartLocationMatch = isAddressMatching(newJourney.startLocation, oldJourney.startLocation);

  if (!hasStartLocationMatch) {
    getNewJourneyPricing(newJourney.id);
  }
}

function updateAdjustPriceModalOpenStates(newJourneys: VDeliveryJourney[]) {
  const statesMap = new Map(adjustPricesOpenStates.value.map((state) => [state.id, state.isOpen]));

  adjustPricesOpenStates.value = newJourneys.map((journey) => ({
    id: journey.id,
    isOpen: statesMap.has(journey.id) ? statesMap.get(journey.id)! : false,
  }));
}

function resetPageData() {
  store.resetAddedJourneyTimes();
  store.resetSelectedDeliveryJourneys();
}

//watch updated journeys to refresh pricing
let oldJourneys = [] as VDeliveryJourney[];
watch(
  () => selectedDeliveryJourneys.value,
  (newJourneys) => {
    updateAdjustPriceModalOpenStates(newJourneys);

    newJourneys.forEach((newJourney) => {
      let oldJourney = oldJourneys?.find((x) => x.id == newJourney.id);
      let isNewJourney = !oldJourney;

      if (isLoadingInitialData.value) {
        return;
      }

      if (isNewJourney) {
        getNewJourneyPricing(newJourney.id);
        return;
      }

      checkSelectedJourneyLocationChange(newJourney, oldJourney);
      checkSelectedJourneyVehicleTypeChange(newJourney, oldJourney);
    });

    oldJourneys = selectedDeliveryJourneys.value;
  },
  { deep: true }
);

onBeforeMount(async () => {
  resetPageData();
  store.setQuoteId(props.quoteId);
  store.setQuoteType(RecordTypes.DeliveryOnly);
  if (isEditAction.value) {
    isAddJourneyCollapseOpen.value = false;
    store.setisLoadingInitialData(true);
    await getUpdatePageData();
    store.setisLoadingInitialData(false);
  } else {
    await getCreatePageData();
  }
});
</script>

<style scoped>
.form-item {
  position: block;
}
</style>
