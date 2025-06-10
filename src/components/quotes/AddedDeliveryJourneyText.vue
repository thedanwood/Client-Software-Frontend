<template>
  <div>
    <span>{{ props.journey.startLocation.fullAddress }}</span>
    <FontAwesomeIcon :icon="['fas', 'long-arrow-alt-right']" class="px-3" />
    <span>{{ deliveryLocation.fullAddress }}</span>
    <br />
    <div class="d-flex justify-content-between">
      <div>
        <FontAwesomeIcon role="button" class="pe-2 icon-bg" :icon="['fas', 'fa-clock']" />
        <span>{{ journeyTime }} mins</span>
      </div>
      <div>
        <FontAwesomeIcon role="button" class="pe-2 icon-bg" :icon="['fas', 'fa-truck']" />
        {{ getVehicleTypeById(props.journey.vehicleTypeId).name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VDeliveryJourney } from "../../core/types/quotes";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";
import { ComputedRef, computed } from "vue";

const props = defineProps<{
  journey: VDeliveryJourney;
}>();

const store = useHaulageSystemStore();
const { getAddedJourneyTimesByJourneyId, getVehicleTypeById, deliveryLocation } = storeToRefs(store);

let journeyTime: ComputedRef<number> = computed(() => {
  return getAddedJourneyTimesByJourneyId
    .value(props.journey.id)
    .find((x) => x.hasTrafficEnabled == props.journey.hasTrafficEnabled).journeyTime;
});
</script>

<style scoped></style>
