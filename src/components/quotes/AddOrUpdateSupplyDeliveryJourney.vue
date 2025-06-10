<template>
  <div class="add-material-container">
    <Select
      label="Material *"
      placeholder="Select a material"
      :disabled="isDisabled"
      :isSearchable="true"
      :options="props.materialOptions"
      :value="unsavedSelectedMaterialId"
      @change="(newVal) => onMaterialChange(newVal)"
    />
    <VuelidateErrors :errors="v$.material.$errors" />
    <div class="row mt-2">
      <div class="col-3">
        <NumberPicker
          label="Quantity *"
          class="w-100 input-element"
          :disabled="isDisabled"
          :value="unsavedQuantity"
          @change="(newVal) => (unsavedQuantity = newVal)"
        />
        <VuelidateErrors :errors="v$.quantity.$errors" />
      </div>
      <div class="col-6">
        <Select
          label="Unit *"
          :value="unsavedSelectedMaterialUnitId"
          :disabled="isDisabled"
          :options="materialUnitOptions"
          @change="onMaterialUnitChange"
        />
        <VuelidateErrors :errors="v$.materialUnit.$errors" />
      </div>
    </div>

    <div v-if="showDepots">
      <Select
        label="Depot *"
        placeholder="Select a supply depot"
        :disabled="isDisabled"
        :showSpinner="isDisabled"
        :isSearchable="true"
        class="mt-2"
        :options="formattedDepotOptions"
        :value="unsavedSelectedDepotPricingId"
        @change="(val) => onDepotPricingChange(val)"
      >
        <template v-slot:between-label-and-input>
          <Checkbox
            class="ms-2"
            groupName="routing-parameters"
            :checkboxItems="routingParametersCheckboxOptions"
            :selectedValues="unsavedSelectedRoutingParameters"
            :disabled="isLoading"
            @checked="(val) => onRoutingParametersChange(val)"
        /></template>
      </Select>
      <VuelidateErrors :errors="v$.depot.$errors" />
    </div>
    <Checkbox
      v-if="!isUpdateAction"
      groupName="vehicle-types"
      label="Vehicle type *"
      class="mt-2"
      :checkboxItems="vehicleTypeCheckboxOptions"
      :selectedValues="unsavedSelectedVehicleTypeIds"
      :disabled="isDisabled"
      @checked="(values) => (unsavedSelectedVehicleTypeIds = values)"
    />

    <Radio
      v-else
      class="mt-3"
      label="Vehicle type"
      :radioGroupName="`vehicle-types-${updatingMaterial?.id}`"
      :disabled="isDisabled"
      :value="unsavedSelectedVehicleTypeIds[0]"
      :radioItems="vehicleTypeRadioOptions"
      @change="(id) => onVehicleTypeRadioChange([id])"
    />
    <VuelidateErrors :errors="v$.vehicleType.$errors" />
    <div class="d-flex justify-content-end">
      <Button class="btn-green ml-auto mt-3" :value="actionButtonText" :disabled="isLoading" @click="onSaveJourney" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { Button, VuelidateErrors, Checkbox, NumberPicker, Radio, Select } from "../../components/shared";
import { RoutingParameters, QuoteClient, MaterialUnits } from "../../api/haulage-system";
import { getSelectedRoutingParmeters } from "../../core/functions/sharedFunctions";
import { toVCheckboxItem, toVRadioItem, toVSelectOptionItem } from "../../core/mappers/toFrontendMappers";
import { VSupplyDeliveryJourney, VAddedDepotPricingOption } from "../../core/types/quotes";
import { VSelectOptionItem, VVehicleType, VCheckboxItem } from "../../core/types/shared";
import { useGlobalStore } from "../../stores/globalStore";
import { formatPrice } from "../../core/functions/financialFunctions";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { helpers, required, minValue, minLength } from "@vuelidate/validators";
import { storeToRefs } from "pinia";
import { Ref, ref, ComputedRef, computed, onBeforeMount, watch } from "vue";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { fieldNames } from "../../core/constants";

const globalStore = useGlobalStore();
const { applyMaximumCapacitySettings } = storeToRefs(globalStore);
const store = useHaulageSystemStore();
const {
  isDeliveryLocationSelected,
  deliveryLocation,
  getVehicleTypeById,
  isLoading,
  getAddedJourneyTimeByJourneyTimeId,
  routingParametersCheckboxOptions,
  getAddedDepotMaterialPricingOptionsByIdAndHasTraffic,
  materialUnits,
  defaultHasTrafficEnabled,
  getNewSupplyDeliveryDepotOptionId,
} = storeToRefs(store);
const priceStore = useAdjustQuotePriceStore();

const emit = defineEmits(["material-updated"]);

const props = defineProps<{
  id: number;
  materialOptions: VSelectOptionItem[];
  materialUnitOptions: VSelectOptionItem[];
  vehicleTypes: VVehicleType[];
  updatingMaterial: VSupplyDeliveryJourney | null;
}>();
//TODO
let unsavedSelectedMaterialId: Ref<number> = ref(null);
let unsavedQuantity: Ref<number> = ref(0);
let unsavedSelectedRoutingParameters: Ref<RoutingParameters[]> = ref([]);
let unsavedSelectedMaterialUnitId: Ref<number> = ref(null);
let unsavedSelectedDepotPricingId: Ref<number> = ref(0);
let unsavedSelectedVehicleTypeIds: Ref<number[]> = ref([]);
let isLoadingDepots: Ref<boolean> = ref(false);

const isMaterialSelected: ComputedRef<boolean> = computed(() => {
  return unsavedSelectedMaterialId.value !== null;
});
const isMaterialUnitSelected: ComputedRef<boolean> = computed(() => {
  return unsavedSelectedMaterialUnitId.value !== null;
});
const isUpdateAction: ComputedRef<boolean> = computed(() => props.updatingMaterial !== null);
const vehicleTypeCheckboxOptions: ComputedRef<VCheckboxItem[]> = computed(() =>
  props.vehicleTypes.map((x) => toVCheckboxItem(x.id, x.name))
);
const vehicleTypeRadioOptions: ComputedRef<VCheckboxItem[]> = computed(() =>
  props.vehicleTypes.map((x) => toVRadioItem(x.id, x.name))
);
const actionButtonText: ComputedRef<string> = computed(() => {
  let action = props.updatingMaterial === null ? "Add" : "Update";
  return `${action} Material`;
});
const depotOptions: ComputedRef<VAddedDepotPricingOption[]> = computed(() =>
  getAddedDepotMaterialPricingOptionsByIdAndHasTraffic
    .value(props.id, hasTrafficEnabled.value)
    ?.sort((current, next) => {
      let currentJourneyTime = getAddedJourneyTimeByJourneyTimeId.value(current.journeyTimeId);
      let nextJourneyTime = getAddedJourneyTimeByJourneyTimeId.value(next.journeyTimeId);
      return currentJourneyTime > nextJourneyTime ? 1 : -1;
    })
);
const formattedDepotOptions: ComputedRef<VSelectOptionItem[]> = computed(() =>
  depotOptions.value?.map((x) => {
    let journeyTime = getAddedJourneyTimeByJourneyTimeId.value(x.journeyTimeId);
    return toVSelectOptionItem(x.depotMaterialPriceId, toMaterialPricingDisplay(x.price, x.depotName, journeyTime));
  })
);
const showDepots: ComputedRef<boolean> = computed(() => {
  return isMaterialSelected.value && isDeliveryLocationSelected.value && isMaterialUnitSelected.value;
});
const hasTrafficEnabled: ComputedRef<boolean> = computed(() => {
  return unsavedSelectedRoutingParameters.value.includes(RoutingParameters.Traffic);
});
const shouldApplyMaximumCapacity: ComputedRef = computed<boolean>(() => {
  let maxCapacitySettings = applyMaximumCapacitySettings.value.find(
    (x) => x.materialUnitId == unsavedSelectedMaterialUnitId.value
  );

  if (maxCapacitySettings == null) return false;

  let applyMaximumCapacity = false;
  maxCapacitySettings.applyMaximumCapacityFromVehicleTypes.forEach((id) => {
    if (unsavedSelectedVehicleTypeIds.value.includes(id)) {
      let vehicleType = getVehicleTypeById.value(id);
      let isMaximumLoad = unsavedQuantity.value == vehicleType.capacity;
      if (isMaximumLoad) {
        applyMaximumCapacity = true;
      }
    }
  });
  return applyMaximumCapacity;
});

const isDisabled: ComputedRef<boolean> = computed(() => isLoadingDepots.value || isLoading.value);

const rules = {
  material: {
    isDeliveryLocationSelected: helpers.withMessage(
      "You must enter a delivery location.",
      (): boolean => isDeliveryLocationSelected.value
    ),
    required,
    $autoDirty: true,
  },
  quantity: {
    minValue: minValue(1),
    required,
    $autoDirty: true,
  },
  materialUnit: {
    required,
    $autoDirty: true,
  },
  depot: {
    minValue: minValue(1),
    required,
    $autoDirty: true,
  },
  vehicleType: {
    required,
    minLength: helpers.withMessage("You must select at least 1 vehicle type", minLength(1)),
    $autoDirty: true,
  },
} as any;

const v$ = useVuelidate(
  rules,
  {
    material: unsavedSelectedMaterialId,
    quantity: unsavedQuantity,
    materialUnit: unsavedSelectedMaterialUnitId,
    depot: unsavedSelectedDepotPricingId,
    vehicleType: unsavedSelectedVehicleTypeIds,
  },
  { $stopPropagation: true }
);

function toMaterialPricingDisplay(price: number, depotName: string, journeyTime: number) {
  return `£${formatPrice(price)} - ${depotName} (${journeyTime} mins)`;
}

async function onMaterialUnitChange(unitId: number) {
  unsavedSelectedMaterialUnitId.value = unitId;
  store.removeAddedDepotMaterialPricingOptionsById(props.id);
  await reloadDepotsOnMetricFieldChange(unsavedSelectedMaterialId.value, unsavedSelectedMaterialUnitId.value);
  resetMaterialPricingId();
}

async function onVehicleTypeRadioChange(values: number[]) {
  unsavedSelectedVehicleTypeIds.value = values;
}

async function onSaveJourney(): Promise<void> {
  let isValid = await v$.value.$validate();
  if (isValid) {
    let selectedMaterial = props.materialOptions.find((x) => x.value === unsavedSelectedMaterialId.value);
    let selectedDepot = depotOptions.value.find((x) => x.depotMaterialPriceId == unsavedSelectedDepotPricingId.value);
    let selectedVehicleTypes = props.vehicleTypes.filter((x) =>
      unsavedSelectedVehicleTypeIds.value.some((s) => s === x.id)
    );

    let materialUnit = materialUnits.value.find((x) => x.id == unsavedSelectedMaterialUnitId.value);

    selectedVehicleTypes.forEach((selectedVehicleType) => {
      let validatedQuantity = unsavedQuantity.value;
      if (shouldApplyMaximumCapacity.value) {
        validatedQuantity = selectedVehicleType.capacity;
      }

      let journey: VSupplyDeliveryJourney = {
        materialMovementId: props.updatingMaterial?.materialMovementId,
        quantity: validatedQuantity,
        materialId: selectedMaterial.value,
        depotMaterialPriceId: unsavedSelectedDepotPricingId.value,
        depotName: selectedDepot.depotName,
        vehicleTypeId: selectedVehicleType.id,
        materialUnitId: materialUnit.id,
        hasTrafficEnabled: hasTrafficEnabled.value,
      };

      if (!isUpdateAction.value) {
        let addedJourneyId = getNewSupplyDeliveryDepotOptionId.value;
        store.setAddedDepotMaterialPricingOptionsId(props.id, addedJourneyId);
        store.setAddedJourneyTimesId(props.id, addedJourneyId);
      }

      store.setSelectedSupplyDeliveryJourney(journey, props.updatingMaterial?.id);

      setTrackingHistoryItems(journey, props.updatingMaterial);
    });

    if (!isUpdateAction.value) {
      store.removeAddedDepotMaterialPricingOptionsById(props.id);
      store.removeAddedJourneyTimes(props.id);

      resetMaterialInfo();
    }

    v$.value.$reset;

    emit("material-updated");
  }
}

function setTrackingHistoryItems(currentJourney: VSupplyDeliveryJourney, newJourney: VSupplyDeliveryJourney) {
  if (newJourney.depotMaterialPriceId !== currentJourney.depotMaterialPriceId) {
    priceStore.setTrackingHistoryItem(fieldNames.priceStore.onewayJourneyTime, currentJourney.id);
  }
}

function onDepotPricingChange(id: number) {
  unsavedSelectedDepotPricingId.value = id;
}

async function onRoutingParametersChange(selectedCheckboxIds: number[]) {
  unsavedSelectedRoutingParameters.value = selectedCheckboxIds;

  let depots = getAddedDepotMaterialPricingOptionsByIdAndHasTraffic.value(props.id, hasTrafficEnabled.value);

  let hasDepotsAlreadyLoaded = depots.length > 0;

  if (!hasDepotsAlreadyLoaded) {
    await reloadDepotsOnMetricFieldChange(unsavedSelectedMaterialId.value, unsavedSelectedMaterialUnitId.value);

    let newDepotPricingsContainsSameSelection = !depots.some(
      (x) => x.depotMaterialPriceId == unsavedSelectedDepotPricingId.value
    );
    if (!newDepotPricingsContainsSameSelection) {
      resetMaterialPricingId();
    }
  }
}

function resetMaterialInfo() {
  unsavedQuantity.value = 0;
  unsavedSelectedDepotPricingId.value = null;
  unsavedSelectedMaterialId.value = null;
  unsavedSelectedMaterialUnitId.value = null;
  unsavedSelectedVehicleTypeIds.value = [];
  v$.value.$reset();
}

function resetMaterialPricingId() {
  unsavedSelectedDepotPricingId.value = null;
}

async function onMaterialChange(materialId: number) {
  unsavedSelectedMaterialId.value = materialId;

  let isValid = await v$.value.material.$validate();
  if (!isValid.value) {
    if (v$.value.material.isDeliveryLocationSelected.$invalid) {
      unsavedSelectedMaterialId.value = null;
    } else {
      store.removeAddedDepotMaterialPricingOptionsById(props.id);
      await reloadDepotsOnMetricFieldChange(unsavedSelectedMaterialId.value, unsavedSelectedMaterialUnitId.value);
      resetMaterialPricingId();
    }
    return;
  }
  unsavedSelectedMaterialId.value = materialId;
}

async function reloadDepotsOnMetricFieldChange(materialId: number, unitId: number) {
  await getDepotsFromMaterialIdAndUnit(materialId, unitId);
  v$.value.depot.$reset();
}

async function getDepotsFromMaterialIdAndUnit(materialId: number, unitId: number) {
  if (!materialId || !unitId || !deliveryLocation.value?.latitude) {
    return;
  }

  isLoadingDepots.value = true;
  store.setIsLoading(true);

  await getAuthenticatedClient(QuoteClient)
    .getAddedMaterialMovementInitialData(
      hasTrafficEnabled.value,
      materialId,
      unitId,
      deliveryLocation.value.latitude,
      deliveryLocation.value.longitude,
      null
    )
    .then((response) => {
      store.setAddedDepotMaterialPricingOptions(response, props.id, hasTrafficEnabled.value);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  isLoadingDepots.value = false;
  store.setIsLoading(false);
}

function setUpdateIntialData() {
  unsavedSelectedDepotPricingId.value = props.updatingMaterial.depotMaterialPriceId;
  unsavedSelectedMaterialId.value = props.updatingMaterial.materialId;
  unsavedSelectedMaterialUnitId.value = props.updatingMaterial.materialUnitId;
  unsavedSelectedVehicleTypeIds.value = [props.updatingMaterial.vehicleTypeId];
  unsavedQuantity.value = props.updatingMaterial.quantity;
  unsavedSelectedRoutingParameters.value = getSelectedRoutingParmeters(props.updatingMaterial.hasTrafficEnabled);
}

watch(
  //wait for value to be set in supply delivery quote
  () => defaultHasTrafficEnabled.value,
  (newValue) => {
    if (newValue) {
      unsavedSelectedRoutingParameters.value.push(RoutingParameters.Traffic);
    }
  },
  { immediate: true }
);

onBeforeMount(() => {
  if (isUpdateAction.value) {
    setUpdateIntialData();
  } else {
    unsavedSelectedRoutingParameters.value = getSelectedRoutingParmeters(hasTrafficEnabled.value);
  }
});
</script>

<style scoped>
.add-material-container {
  background-color: var(--light-grey);
  padding: 15px;
  border: 1px solid var(--grey);
}
</style>
