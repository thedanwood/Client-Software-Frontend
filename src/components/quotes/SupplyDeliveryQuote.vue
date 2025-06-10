<template>
  <h1 class="page-title">{{ isEditAction ? "Update" : "Add New" }} Supply and Delivery Quote</h1>
  <br />

  <form class="create-quote-container">
    <BaseQuote>
      <template v-slot:middle>
        <div class="mt-2 mb-3">
          <AddressLookupInput
            label="Delivery Location *"
            placeholder="Enter a delivery address"
            :disabled="isLoading"
            :location="deliveryLocation"
            @change="(val) => onDeliveryLocationChange(val)"
          />
          <VuelidateErrors :errors="v$.deliveryLocation.$errors" />
        </div>

        <label class="input-label">Materials</label>
        <div class="input-element">
          <CollapsableButton :isLoading="isLoading" identifier="add-material">
            <template v-slot:button>
              <Button
                style="width: fit-content"
                class="btn-dark"
                value="Add Material"
                :icon-before="['fas', 'plus']"
                :icon-after="['fas', isAddMaterialCollapseOpen ? 'chevron-up' : 'chevron-down']"
                @click="toggleMaterialCollapse"
              />
            </template>
          </CollapsableButton>
          <CollapsableContainer
            identifier="add-material"
            :isOpen="isAddMaterialCollapseOpen"
            @toggle="toggleMaterialCollapse"
          >
            <template v-slot:content>
              <AddOrUpdateSupplyDeliveryJourney
                :id="appSettings.addNewMovementDefaultId"
                :materialOptions="materialOptions"
                :materialUnitOptions="materialUnitOptions"
                :vehicleTypes="vehicleTypes"
                :updatingMaterial="null"
                @material-updated="onMaterialAdded"
              />
            </template>
          </CollapsableContainer>
        </div>

        <AlertBox
          v-if="showMaterialAddedAlert"
          class="alert-success mt-3"
          :text="config.successMessages.materialAdded"
        ></AlertBox>

        <VuelidateErrors :errors="v$.materials.$errors" />
        <AddedSupplyDeliveryJourney
          v-for="(journey, index) in selectedSupplyDeliveryJourneys"
          :uniqueId="index + 1"
          :key="index + 1"
          :disabled="isLoading"
          :journey="journey"
          :materialOptions="materialOptions"
          :materialUnitOptions="materialUnitOptions"
          :vehicleTypes="vehicleTypes"
          @remove="(id) => removeSelectedSupplyDeliveryJourney(id)"
        />
      </template>
    </BaseQuote>
    <Input
      v-if="selectedSupplyDeliveryJourneys.length > 0"
      class="mt-3 quote-total-price-container"
      label="Total Quote Price"
      :disabled="true"
      :value="formatPrice(getTotalQuotesPrice)"
    />
    <div class="adjust-price-container adjust-price-scroll" v-if="selectedSupplyDeliveryJourneys.length > 0">
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
              :metrics="toAdjustPriceMetrics(pricing.id)"
              :disabled="isLoading"
              :is-open="false"
              @toggle-is-open=""
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
      :disabled="isLoading"
      :iconBefore="['fas', 'floppy-disk']"
      @click="onSaveQuote()"
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
  Input,
} from "../../components/shared";
import { AdjustPrice } from "../../components/pricing";
import { BaseQuote, AddOrUpdateSupplyDeliveryJourney, AddedSupplyDeliveryJourney } from "../../components/quotes";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import {
  QuoteClient,
  UpdateSupplyDeliveryQuoteCommand,
  UpdateSupplyDeliveryMovementCommand,
  UpdateMaterialMovementPricingDto,
  UpdateDeliveryMovementPricingDto,
  CreateSupplyDeliveryQuoteCommand,
  AddressDto,
  RoutePoint,
  CreateMaterialMovementCommand,
  UpdateQuoteSupplyDeliveryInitialDataDto,
  CompanyDto,
  GetNewSupplyDeliveryMovementPricingQuery,
  RecordTypes,
  CreateSupplyDeliveryMovementPricingDto,
} from "../../api/haulage-system";
import { validationRules, fieldNames, config, appSettings } from "../../core/constants";
import { RouterNames } from "../../core/enums/RouterNames";
import { toRoutePoint } from "../../core/mappers/toBackendMappers";
import {
  toVSelectOptionItem,
  toVAddress,
  toVAdjustQuotePriceForSupplyDelivery,
} from "../../core/mappers/toFrontendMappers";
import {
  VAdjustQuotePriceParameterMetrics,
  VAdjustDeliveryQuotePrice,
  VAdjustMaterialQuotePrice,
  VAdjustQuotePrice,
} from "../../core/types/pricing";
import { VAddedJourneyTimes, VSupplyDeliveryJourney } from "../../core/types/quotes";
import { getCollapseAttributes } from "../../core/functions/sharedFunctions";
import { VSelectOptionItem, VAddress } from "../../core/types/shared";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { storeToRefs } from "pinia";
import { Ref, ref, ComputedRef, computed, onBeforeMount, watch } from "vue";
import { useRouter } from "vue-router";
import { formatPrice } from "../../core/functions/financialFunctions";

const router = useRouter();

const globalStore = useGlobalStore();
const store = useHaulageSystemStore();
const {
  selectedSupplyDeliveryJourneys,
  isLoading,
  isEditAction,
  companyId,
  customerName,
  deliveryDate,
  comments,
  deliveryLocation,
  isLoadingInitialData,
  getSelectedSupplyDeliveryJourneyTime,
  addedJourneyTimes,
  materials,
  materialUnits,
  getSelectedSupplyDeliveryJourneyById,
  vehicleTypes,
  getSupplyDeliveryNumberOfLoads,
  quoteType,
  getMaterialById,
  getVehicleTypeById,
  getNewSupplyDeliveryDepotOptionId,
  getMaterialUnitById,
} = storeToRefs(store);
const priceStore = useAdjustQuotePriceStore();
const { getPricings, getPricing, getTotalQuotesPrice } = storeToRefs(priceStore);

const props = defineProps<{
  quoteId?: number;
}>();

let adjustPricesCollapseIdentifier = "adjust-prices-container";

const isAdjustPricesCollapseOpen: Ref<boolean> = ref(true);
let showMaterialAddedAlert: Ref<boolean> = ref(false);
let isAddMaterialCollapseOpen: Ref<boolean> = ref(true);

const rules = {
  deliveryLocation: validationRules.deliveryInfO.deliveryLocation,
  materials: validationRules.material.list,
} as any;

const v$ = useVuelidate(
  rules,
  {
    deliveryLocation: deliveryLocation,
    materials: selectedSupplyDeliveryJourneys,
  },
  {
    $scope: "add-new-quote",
  }
);
const materialUnitOptions: ComputedRef<VSelectOptionItem[]> = computed(() =>
  materialUnits.value.map((x) => toVSelectOptionItem(x.id, x.unitName))
);
const materialOptions: ComputedRef<VSelectOptionItem[]> = computed(() =>
  materials.value.map((x) => toVSelectOptionItem(x.id, x.materialName))
);

function toggleMaterialCollapse(): void {
  isAddMaterialCollapseOpen.value = !isAddMaterialCollapseOpen.value;
}

function onDeliveryLocationChange(location: VAddress): void {
  store.setDeliveryLocation(location);
  getAllNewJourneyPricings();
}

function onSaveQuote(): void {
  if (!isEditAction.value) {
    createQuote();
  } else {
    updateQuote();
  }
}

function removeSelectedSupplyDeliveryJourney(id: number): void {
  store.removeSelectedSupplyDeliveryJourney(id);
  store.removeAddedDepotMaterialPricingOptionsById(id);
  priceStore.removePricing(id);
}

function updateJourneyTime(id: number, journeyTime: number): void {
  let journeyTimeId = getSelectedSupplyDeliveryJourneyTime.value(id).journeyTimeId;
  store.updateAddedJourneyTime(journeyTimeId, journeyTime);
}

function toAdjustPriceMetrics(journeyId: number): VAdjustQuotePriceParameterMetrics {
  let journey = getSelectedSupplyDeliveryJourneyById.value(journeyId);
  let journeyTime = getSelectedSupplyDeliveryJourneyTime.value(journeyId).journeyTime;
  let numberOfLoads = getSupplyDeliveryNumberOfLoads.value(journeyId);
  let materialName = getMaterialById.value(journey.materialId).materialName;
  let unitName = getMaterialUnitById.value(journey.materialUnitId).unitName.toLowerCase();
  let vehicleTypeName = getVehicleTypeById.value(journey.vehicleTypeId).name;

  return {
    quoteType: quoteType.value,
    onewayJourneyTime: journeyTime,
    numberOfLoads: numberOfLoads,
    deliveryLocation: deliveryLocation.value.fullAddress,
    quantity: journey.quantity,
    materialName: materialName,
    materialUnitName: unitName,
    vehicleTypeName: vehicleTypeName,
    depotName: journey.depotName,
  } as VAdjustQuotePriceParameterMetrics;
}

async function updateQuote(): Promise<void> {
  if (!(await v$.value.$validate())) {
    return;
  }
  store.setIsLoading(true);

  await getAuthenticatedClient(QuoteClient)
    .updateSupplyDeliveryQuote(props.quoteId, toUpdateQuoteCommand())
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

async function createQuote(): Promise<void> {
  debugger;
  if (!(await v$.value.$validate())) {
    return;
  }
  store.setIsLoading(true);

  await getAuthenticatedClient(QuoteClient)
    .createSupplyDeliveryQuote(toCreateQuoteCommand())
    .then(async (response) => {
      globalStore.setQuoteId(response);
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

function toUpdateQuoteCommand(): UpdateSupplyDeliveryQuoteCommand {
  let command = new UpdateSupplyDeliveryQuoteCommand();
  command.quoteId = props.quoteId;
  command.companyId = companyId.value ?? 0;
  command.customerName = customerName.value ?? "";
  command.deliveryLocation = getDeliveryLocation();
  command.deliveryDateTime = deliveryDate.value ?? new Date();
  command.comments = comments.value ?? "";
  command.movements = toUpdateSupplyDeliveryMovementCommands();
  return command;
}

function toUpdateSupplyDeliveryMovementCommands(): UpdateSupplyDeliveryMovementCommand[] {
  return selectedSupplyDeliveryJourneys.value.map((x) => {
    let price = getPricing.value(x.id);
    const command = new UpdateSupplyDeliveryMovementCommand();

    command.materialMovementId = x.materialMovementId;
    command.vehicleTypeId = x.vehicleTypeId;
    command.quantity = x.quantity;
    command.numberOfLoads = getSupplyDeliveryNumberOfLoads.value(x.id);
    command.depotMaterialPriceId = x.depotMaterialPriceId;
    command.materialUnitId = x.materialUnitId;
    command.hasTrafficEnabled = x.hasTrafficEnabled;

    command.materialPricing = new UpdateMaterialMovementPricingDto();
    command.materialPricing.totalMaterialPrice = price.materialPricing.totalMaterialPrice;
    command.materialPricing.defaultTotalMaterialPrice = price.materialPricing.defaultTotalMaterialPrice;
    command.materialPricing.materialPricePerQuantityUnit = price.materialPricing.materialPricePerQuantityUnit;
    command.materialPricing.defaultMaterialPricePerQuantityUnit =
      price.materialPricing.defaultMaterialPricePerQuantityUnit;

    command.deliveryPricing = new UpdateDeliveryMovementPricingDto();
    command.deliveryPricing.defaultOnewayJourneyTime = price.defaultOnewayJourneyTime;
    command.deliveryPricing.onewayJourneyTime = getSelectedSupplyDeliveryJourneyTime.value(x.id).journeyTime;
    command.deliveryPricing.totalDeliveryPrice = price.deliveryPricing.totalDeliveryPrice;
    command.deliveryPricing.defaultTotalDeliveryPrice = price.deliveryPricing.defaultTotalDeliveryPrice;
    command.deliveryPricing.deliveryPricePerMinute = price.deliveryPricing.deliveryPricePerTimeUnit;
    command.deliveryPricing.defaultDeliveryPricePerMinute = price.deliveryPricing.defaultDeliveryPricePerTimeUnit;
    return command;
  });
}

function toCreateQuoteCommand(): CreateSupplyDeliveryQuoteCommand {
  return {
    companyId: companyId.value,
    customerName: customerName.value,
    deliveryLocation: getDeliveryLocation(),
    deliveryDateTime: deliveryDate.value,
    comments: comments.value,
    materialMovements: toCreateMaterialMovementCommands(),
  } as CreateSupplyDeliveryQuoteCommand;
}

function getDeliveryLocation(): AddressDto {
  let command = new AddressDto();
  command.fullAddress = deliveryLocation.value.fullAddress;
  let addressPoint = new RoutePoint();
  addressPoint.latitude = deliveryLocation.value.latitude;
  addressPoint.longitude = deliveryLocation.value.longitude;
  command.addressPoint = addressPoint;
  return command;
}

function toCreateMaterialMovementCommands(): CreateMaterialMovementCommand[] {
  return selectedSupplyDeliveryJourneys.value.map((x) => {
    let price = getPricing.value(x.id);
    let command = {
      onewayJourneyTime: getSelectedSupplyDeliveryJourneyTime.value(x.id).journeyTime,
      depotMaterialPriceId: x.depotMaterialPriceId,
      quantity: x.quantity,
      materialUnitId: x.materialUnitId,
      vehicleTypeId: x.vehicleTypeId,
      hasTrafficEnabled: x.hasTrafficEnabled,
      pricing: {
        totalMaterialPrice: price.materialPricing.totalMaterialPrice,
        defaultTotalMaterialPrice: price.materialPricing.defaultTotalMaterialPrice,
        materialPricePerQuantityUnit: price.materialPricing.materialPricePerQuantityUnit,
        defaultMaterialPricePerQuantityUnit: price.materialPricing.defaultMaterialPricePerQuantityUnit,
        totalDeliveryPrice: price.deliveryPricing.totalDeliveryPrice,
        defaultTotalDeliveryPrice: price.deliveryPricing.defaultTotalDeliveryPrice,
        deliveryPricePerTimeUnit: price.deliveryPricing.deliveryPricePerTimeUnit,
        defaultDeliveryPricePerTimeUnit: price.deliveryPricing.defaultDeliveryPricePerTimeUnit,
      } as CreateSupplyDeliveryMovementPricingDto,
    } as CreateMaterialMovementCommand;
    return command;
  });
}

async function getCreatePageData(): Promise<void> {
  resetPageContent();
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getSupplyDeliveryQuoteInitialData()
    .then((response) => {
      store.setDefaultHasTrafficEnabled(response.defaultHasTrafficEnabled);
      store.setMaterials(response.materials);
      store.setMaterialUnits(response.materialUnits);
      store.setVehicleTypes(response.vehicleTypes);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

async function getUpdatePageData(): Promise<void> {
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getSupplyDeliveryUpdateQuoteInitialData(props.quoteId)
    .then(async (response) => {
      store.setisLoadingInitialData(true);
      await setUpdateInitialData(response);
      store.setisLoadingInitialData(false);
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

function setUpdateInitialData(response: UpdateQuoteSupplyDeliveryInitialDataDto) {
  let deliveryAddress = toVAddress(
    response.deliveryLocation.addressPoint.latitude,
    response.deliveryLocation.addressPoint.longitude,
    response.deliveryLocation.fullAddress
  );
  store.setDefaultHasTrafficEnabled(response.defaultHasTrafficEnabled);
  store.setMaterialUnits(response.materialUnits);
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
  store.setMaterials(response.materials);
  response.deliveryMovements.forEach((movement) => {
    let journeyId = getNewSupplyDeliveryDepotOptionId.value;

    let journeyTimeId = addedJourneyTimes.value.length + 1;
    store.setAddedJourneyTimes([
      {
        id: journeyId,
        journeyTimeId: journeyTimeId,
        journeyTime: movement.onewayJourneyTime,
      } as VAddedJourneyTimes,
    ]);

    store.setSelectedSupplyDeliveryJourney({
      id: journeyId,
      materialMovementId: movement.materialMovementId,
      depotName: movement.depotName,
      materialId: movement.materialId,
      quantity: movement.quantity,
      materialUnitId: movement.materialUnitId,
      vehicleTypeId: movement.vehicleTypeId,
      depotMaterialPriceId: movement.depotMaterialPriceId,
      hasTrafficEnabled: movement.hasTrafficEnabled,
    } as VSupplyDeliveryJourney);

    store.setAddedDepotMaterialPricingOptions(movement.depotPricings, journeyId, movement.hasTrafficEnabled);

    priceStore.setPricing({
      id: journeyId,
      materialMovementId: movement.materialMovementId,
      defaultOnewayJourneyTime: movement.defaultOnewayJourneyTime,
      materialAndDeliveryPricePerQuantityUnit: movement.materialAndDeliveryPricePerQuantityUnit,
      defaultMaterialAndDeliveryPricePerQuantityUnit: movement.defaultMaterialAndDeliveryPricePerQuantityUnit,
      deliveryPricing: {
        deliveryPricePerTimeUnit: movement.deliveryPricePerMinute,
        defaultDeliveryPricePerTimeUnit: movement.defaultDeliveryPricePerMinute,
        totalDeliveryPrice: movement.totalDeliveryPrice,
        defaultTotalDeliveryPrice: movement.defaultTotalDeliveryPrice,
      } as VAdjustDeliveryQuotePrice,
      materialPricing: {
        materialPricePerQuantityUnit: movement.materialPricePerQuantityUnit,
        defaultMaterialPricePerQuantityUnit: movement.defaultMaterialPricePerQuantityUnit,
        totalMaterialPrice: movement.totalMaterialPrice,
        defaultTotalMaterialPrice: movement.defaultTotalMaterialPrice,
        numberOfLoads: movement.numberOfLoads,
      } as VAdjustMaterialQuotePrice,
    } as VAdjustQuotePrice);
  });
}

function resetPageContent() {
  store.setCustomerName(null);
  store.setComments(null);
  store.setDeliveryDate(null);
  store.setDeliveryLocation(null);
  store.setCompanyId(0);
  store.setDeliveryDate(null);
  store.setSelectedSupplyDeliveryJourneys([]);
}

function onMaterialAdded() {
  showMaterialAddedAlert.value = true;
  setTimeout(() => {
    showMaterialAddedAlert.value = false;
  }, 3000);
}

function getMovementPricingQuery(id: number) {
  let journey = getSelectedSupplyDeliveryJourneyById.value(id);
  let journeyTime = getSelectedSupplyDeliveryJourneyTime.value(id).journeyTime;
  let query = new GetNewSupplyDeliveryMovementPricingQuery();
  query.deliveryLocation = toRoutePoint(deliveryLocation.value.latitude, deliveryLocation.value.longitude);
  query.onewayJourneyTime = journeyTime;
  query.depotMaterialPriceId = journey.depotMaterialPriceId;
  query.materialUnitId = journey.materialUnitId;
  query.quantity = journey.quantity;
  query.numberOfLoads = getSupplyDeliveryNumberOfLoads.value(journey.id);
  query.vehicleTypeId = journey.vehicleTypeId;
  return query;
}

function getAllNewJourneyPricings() {
  selectedSupplyDeliveryJourneys.value.map((x) => x.id).forEach((id) => getNewMaterialPricing(id));
}

async function getNewMaterialPricing(id: number) {
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getNewSupplyDeliveryMovementPricing(getMovementPricingQuery(id))
    .then((response) => {
      let priceObject = toVAdjustQuotePriceForSupplyDelivery(response, id);
      priceStore.setPricing(priceObject);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

watch(
  () => selectedSupplyDeliveryJourneys.value,
  (newJourneys, oldJourneys) => {
    if (isLoadingInitialData.value) {
      return;
    }

    newJourneys.forEach((newJourney) => {
      let oldJourney = oldJourneys?.find((x) => x.id == newJourney.id);

      let isNewJourney = !oldJourney;
      if (isNewJourney) {
        getNewMaterialPricing(newJourney.id);
        return;
      }
    });
  },
  { deep: true }
);

onBeforeMount(async () => {
  store.setQuoteId(props.quoteId);
  store.setQuoteType(RecordTypes.SupplyAndDelivery);
  if (isEditAction.value) {
    isAddMaterialCollapseOpen.value = false;
    await getUpdatePageData();
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
