<template>
  <label class="pb-1 input-label" v-if="label != null">
    {{ label }}
  </label>
  <GMapAutocomplete
    :value="selectedLocation?.fullAddress"
    class="form-control input-element address-input"
    :class="props.class"
    :placeholder="placeholder ?? 'Search for a location'"
    @place_changed="onLocationChange"
    :options="{
      componentRestrictions: { country: 'uk' },
    }"
    @input="(val) => onInput(val)"
    :disabled="props.disabled"
  ></GMapAutocomplete>
</template>

<script lang="ts" setup>
import { isAddressValidated } from "../../core/functions/sharedFunctions";
import { VAddress } from "../../core/types/shared";
import { computed } from "vue";

const props = defineProps<{
  disabled?: boolean;
  location: VAddress;
  label?: string;
  class?: string;
  placeholder?: string;
}>();

const emit = defineEmits(["change", "input"]);

const selectedLocation = computed({
  get: () => props.location,
  set: (value) => emit("change", value),
});

function onLocationChange(location: any) {
  selectedLocation.value = {
    latitude: location.geometry.location.lat(),
    longitude: location.geometry.location.lng(),
    fullAddress: location.formatted_address,
  } as VAddress;
}

function onInput(data: any) {
  if (isAddressValidated(selectedLocation.value) && selectedLocation.value.fullAddress != null) {
    selectedLocation.value.fullAddress = data.data;
    selectedLocation.value.latitude = null;
    selectedLocation.value.longitude = null;
  }
  if (selectedLocation.value != null) {
    selectedLocation.value.latitude = null;
    selectedLocation.value.longitude = null;
  }
}
</script>
