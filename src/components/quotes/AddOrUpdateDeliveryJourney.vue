<template>
  <div id="add-journey-container">
    <AddressLookupInput
      label="Start Location *"
      placeholder="Enter a start address"
      :disabled="disabled"
      :location="getStartLocation"
      @change="(loc) => setStartLocation(loc)"
    />
    <VuelidateErrors :errors="v$.startLocation.$errors" />
    <div class="mt-3">
      <Checkbox
        v-if="!isUpdate"
        groupName="vehicle-types"
        label="Vehicle type *"
        :checkboxItems="vehicleTypeCheckboxOptions"
        :selectedValues="unsavedSelectedVehicleTypeIds"
        :disabled="disabled"
        @checked="(values) => onVehicleTypeChange(values)"
      />
      <Radio
        v-else
        :radioGroupName="`vehicle-types-${props.id}`"
        :disabled="disabled"
        label="Vehicle type *"
        :value="unsavedSelectedVehicleTypeIds[0]"
        :radioItems="vehicleTypeRadioOptions"
        @change="(id) => (unsavedSelectedVehicleTypeIds = [id])"
      />
      <VuelidateErrors :errors="v$.vehicleTypeIds?.$errors" />
    </div>
    <div class="d-block mt-3 w-25" v-if="journeyTime">
      <Input label="Journey time" classes="border-grey-1" :disabled="true" :value="`${journeyTime} mins`" />
      <Checkbox
        label=""
        class="mt-2 ms-2"
        groupName="routing-parameters"
        :checkboxItems="routingParametersCheckboxOptions"
        :selectedValues="unsavedSelectedRoutingParameters"
        :disabled="disabled"
        @checked="(val) => onRoutingParametersChange(val)"
      />
    </div>

    <div class="d-flex justify-content-end">
      <Button class="btn-green ml-auto mt-3" :value="actionButtonText" :disabled="disabled" @click="saveJourney" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button, Checkbox, Radio, VuelidateErrors, AddressLookupInput, Input } from "../../components/shared";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { RoutingParameters, QuoteClient } from "../../api/haulage-system";
import { isAddressValidated, getSelectedRoutingParmeters } from "../../core/functions/sharedFunctions";
import { toVCheckboxItem, toVRadioItem } from "../../core/mappers/toFrontendMappers";
import { VDeliveryJourney, VAddedJourneyTimes } from "../../core/types/quotes";
import { VAddress, VCheckboxItem } from "../../core/types/shared";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { storeToRefs } from "pinia";
import { Ref, ref, ComputedRef, computed, onBeforeMount, watch } from "vue";

const emit = defineEmits(["journey-updated", "validate-number-of-loads"]);

const props = defineProps<{
  id: number;
  updatingJourney: VDeliveryJourney;
  disabled: boolean;
  parentFormValidation?: any;
}>();

const globalStore = useGlobalStore();
const store = useHaulageSystemStore();
const {
  deliveryLocation,
  getAddedJourneyTimesByJourneyId,
  selectedDeliveryJourneys,
  addedJourneyTimes,
  vehicleTypes,
  defaultHasTrafficEnabled,
} = storeToRefs(store);

let unsavedAddedJourneyTimes: Ref<VAddedJourneyTimes[]> = ref([]);
let unsavedStartLocation: Ref<VAddress> = ref(null);
let unsavedSelectedRoutingParameters: Ref<RoutingParameters[]> = ref([]);
let unsavedSelectedVehicleTypeIds: Ref<number[]> = ref([]);

let routingParametersCheckboxOptions: Ref<VCheckboxItem[]> = ref([
  {
    value: RoutingParameters.Traffic,
    label: "Enable Traffic",
  } as VCheckboxItem,
]);

const isUpdate: ComputedRef<boolean> = computed(() => props.updatingJourney !== null);
const hasTrafficEnabled: ComputedRef<boolean> = computed(() =>
  unsavedSelectedRoutingParameters.value.includes(RoutingParameters.Traffic)
);
const journeyTime: ComputedRef<number> = computed(() => {
  return unsavedAddedJourneyTimes.value?.find((x) => x.hasTrafficEnabled == hasTrafficEnabled.value)?.journeyTime;
});
const vehicleTypeCheckboxOptions: ComputedRef<VCheckboxItem[]> = computed(() =>
  vehicleTypes.value.map((x) => toVCheckboxItem(x.id, x.name))
);
const vehicleTypeRadioOptions: ComputedRef<VCheckboxItem[]> = computed(() =>
  vehicleTypes.value.map((x) => toVRadioItem(x.id, x.name))
);
const getStartLocation: ComputedRef<VAddress> = computed(() => {
  return unsavedStartLocation.value;
});

const rules = {
  vehicleTypeIds: {
    required: helpers.withMessage("You must select a vehicle type.", required),
  },
  startLocation: {
    isSameAsDestination: helpers.withMessage(
      "Your start location cannot be the same as your delivery location.",
      () => !IsDeliveryAndStartLocationMatching()
    ),
    isValid: helpers.withMessage("Your must select a location", () => isAddressValidated(unsavedStartLocation.value)),
  },
} as any;

const v$ = useVuelidate(
  rules,
  {
    startLocation: unsavedStartLocation,
    vehicleTypeIds: unsavedSelectedVehicleTypeIds,
  },
  { $stopPropagation: true }
);
// }, { $scope: "update-journey" })

const actionButtonText: ComputedRef<string> = computed(() => {
  let action = props.updatingJourney === null ? "Add" : "Update";
  return `${action} Journey`;
});

async function saveJourney(): Promise<void> {
  emit("validate-number-of-loads");
  let isValid = await v$.value.$validate();
  if (isValid && !props.parentFormValidation?.numberOfLoads?.$invalid) {
    let journey = {
      startLocation: unsavedStartLocation.value,
      hasTrafficEnabled: hasTrafficEnabled.value,
    } as VDeliveryJourney;

    store.setAddedJourneyTimes(unsavedAddedJourneyTimes.value);

    if (isUpdate.value) {
      journey.id = props?.id;
      journey.vehicleTypeId = unsavedSelectedVehicleTypeIds.value[0];

      store.setSelectedDeliveryJourney(journey, props?.id);
    } else {
      unsavedSelectedVehicleTypeIds.value.forEach((vehicleTypeId) => {
        const newJourney = {
          ...journey,
          vehicleTypeId,
        };

        let addId = selectedDeliveryJourneys.value.length + 1;
        newJourney.id = addId;
        store.setSelectedDeliveryJourney(newJourney);
        store.setAddedJourneyTimesId(props?.id, addId);
      });

      resetForm();
    }
    emit("journey-updated");
  }
}

function setStartLocation(location: VAddress) {
  unsavedStartLocation.value = location;

  getJourneyTimes();
}

function onVehicleTypeChange(selectedVehicleTypes: number[]) {
  unsavedSelectedVehicleTypeIds.value = selectedVehicleTypes;
}

function onRoutingParametersChange(selectedCheckboxIds: number[]) {
  unsavedSelectedRoutingParameters.value = selectedCheckboxIds;
}

function hasDataForGettingJourneyTimes() {
  let hasStartLocation = isAddressValidated(unsavedStartLocation.value);
  let hasDeliveryLcoation = isAddressValidated(deliveryLocation.value);
  return hasStartLocation && hasDeliveryLcoation;
}

async function getJourneyTimes() {
  if (!hasDataForGettingJourneyTimes()) {
    return;
  }

  unsavedAddedJourneyTimes.value = [];

  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getAddedDeliveryOnlyMovementInitialData(
      deliveryLocation.value.latitude,
      deliveryLocation.value.longitude,
      unsavedStartLocation.value.longitude,
      unsavedStartLocation.value.latitude
    )
    .then((response) => {
      response.journeyTimes.forEach((journeyTime) => {
        let journeyTimeId = addedJourneyTimes.value.length + unsavedAddedJourneyTimes.value.length + 1;
        let addedJourney = {
          journeyTime: journeyTime.journeyTime,
          id: props.id,
          journeyTimeId: journeyTimeId,
          hasTrafficEnabled: journeyTime.hasTrafficEnabled,
        } as VAddedJourneyTimes;

        unsavedAddedJourneyTimes.value.push(addedJourney);
      });
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function resetForm() {
  store.removeAddedJourneyTimes(props?.id);
  unsavedSelectedRoutingParameters.value = getSelectedRoutingParmeters(defaultHasTrafficEnabled.value);
  unsavedSelectedVehicleTypeIds.value = [];
  unsavedStartLocation.value = null;
  resetFormValidation();
}

function resetFormValidation() {
  v$.value.$reset();
}

function IsDeliveryAndStartLocationMatching() {
  if (unsavedStartLocation.value == null || deliveryLocation.value === null) return true;

  return unsavedStartLocation.value.fullAddress === deliveryLocation.value.fullAddress;
}

function setUnsavedToCurrent() {
  unsavedAddedJourneyTimes.value = getAddedJourneyTimesByJourneyId.value(props.id);
  unsavedStartLocation.value = props.updatingJourney?.startLocation;
  if (props.updatingJourney?.vehicleTypeId !== undefined) {
    unsavedSelectedVehicleTypeIds.value = [props.updatingJourney?.vehicleTypeId];
  }
  if (isUpdate.value) {
    unsavedSelectedRoutingParameters.value = getSelectedRoutingParmeters(hasTrafficEnabled.value);
  } else {
    unsavedSelectedRoutingParameters.value = getSelectedRoutingParmeters(defaultHasTrafficEnabled.value);
  }
}

watch(
  //if gets set from adjust price, need unsaved price to update too
  () => getAddedJourneyTimesByJourneyId.value(props.id),
  (journeyTimes) => {
    unsavedAddedJourneyTimes.value = journeyTimes;
  }
);

watch(
  () => deliveryLocation.value,
  (deliveryLocation) => {
    if (isAddressValidated(unsavedStartLocation.value)) {
      getJourneyTimes();
    }
  }
);

watch(
  //wait for value to be set in delivery quote
  () => defaultHasTrafficEnabled.value,
  (newValue) => {
    if (newValue) {
      unsavedSelectedRoutingParameters.value.push(RoutingParameters.Traffic);
    }
  },
  { immediate: true }
);

onBeforeMount(() => {
  setUnsavedToCurrent();
  resetFormValidation();
});
</script>

<style scoped>
#add-journey-container {
  background-color: var(--light-grey);
  padding: 15px;
  border: 1px solid var(--grey);
}
</style>
