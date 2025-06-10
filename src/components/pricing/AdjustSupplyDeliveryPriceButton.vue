<template>
  <div class="material-info-container" :class="props.class" @click="$emit('toggle')">
    <QuotesMaterialInfoItem class="w-100" :material-info="getMaterialInfo()" :isCollapsable="false" />
    <div class="collapse-icon-container" v-if="props.isCollapsable">
      <FontAwesomeIcon :icon="['fas', props.isOpen ? 'chevron-up' : 'chevron-down']" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import QuotesMaterialInfoItem from "../../components/quotes/QuotesMaterialInfoItem.vue";
import { VQuoteMaterialInfo } from "../../core/types/quotes";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { storeToRefs } from "pinia";
import { ComputedRef, computed } from "vue";

const priceStore = useAdjustQuotePriceStore();
const { getTotalMaterialAndDeliveryPrice } = storeToRefs(priceStore);

const props = defineProps<{
  id: number;
  isCollapsable: boolean;
  isOpen: boolean;
  pricePerUnit: number;
  onewayJourneyTime: number;
  quantity: number;
  numberOfLoads: number;
  depotName: string;
  materialName: string;
  vehicleTypeName: string;
  deliveryLocation: string;
  materialUnitName: string;
  class?: string;
}>();

const totalPrice: ComputedRef<number> = computed(() => {
  return getTotalMaterialAndDeliveryPrice.value(props.id);
});

function getMaterialInfo() {
  return {
    quantity: props.quantity,
    materialName: props.materialName,
    depotName: props.depotName,
    materialUnitName: props.materialUnitName,
    vehicleType: props.vehicleTypeName,
    deliveryLocation: props.deliveryLocation,
    onewayJourneyTime: props.onewayJourneyTime,
    totalPrice: totalPrice.value,
    pricePerUnit: props.pricePerUnit,
  } as VQuoteMaterialInfo;
}
</script>

<style scoped>
.collapse-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  width: 50px;
}
</style>
