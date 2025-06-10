<template>
  <div class="btn btn-blue adjust-price-button" @click="$emit('toggle')">
    <div class="d-flex flex-column">
      <div class="d-flex">
        {{ props.startLocation }}
        <FontAwesomeIcon :icon="['fas', 'long-arrow-alt-right']" class="px-3" />
        {{ props.deliveryLocation }}
      </div>
      <div class="d-flex">
        <span class="mr-3"> {{ props.numberOfLoads }} load(s) </span>
        <span class="mx-3">
          <FontAwesomeIcon :icon="['fas', 'truck']" class="pr-3" />
          {{ props.vehicleTypeName }}
        </span>
        <span>
          <FontAwesomeIcon :icon="['fas', 'stopwatch']" class="pr-3" />
          {{ props.onewayJourneyTime }}
          {{ props.deliveryUnitName.toLowerCase() }} one-way
        </span>
        <span class="ms-auto ps-3"> £{{ formatPrice(totalPrice) }} </span>
      </div>
    </div>
    <div class="collapse-icon-container">
      <FontAwesomeIcon :icon="['fas', props.isOpen ? 'chevron-up' : 'chevron-down']" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { formatPrice } from "../../core/functions/financialFunctions";
import { storeToRefs } from "pinia";
import { ComputedRef, computed } from "vue";

const props = defineProps<{
  id: number;
  isOpen: boolean;
  startLocation: string;
  deliveryLocation: string;
  onewayJourneyTime: number;
  numberOfLoads: number;
  vehicleTypeName: string;
  deliveryUnitName: string;
}>();

const priceStore = useAdjustQuotePriceStore();
const { getTotalDeliveryPrice } = storeToRefs(priceStore);

const totalPrice: ComputedRef<number> = computed(() =>
  getTotalDeliveryPrice.value(props.id, props.onewayJourneyTime, props.numberOfLoads)
);
</script>

<style scoped>
.adjust-price-button {
  display: flex;
  width: fit-content;
  text-align: left;
}
.collapse-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  width: 50px;
}
.adjust-price-button-delivery-text {
  font-size: 0.9rem;
  text-align: left;
}
</style>
