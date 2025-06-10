<template>
  <div :class="`d-flex w-100 flex-column`" :disabled="isLoading">
    <div :class="{ 'd-flex flex-row justify-content-between': props.isSmall }">
      <div class="d-flex material-info-top-container">
        <span>{{ props.materialInfo.materialName }}</span>
        <span class="ms-auto ps-3" v-if="props.materialInfo.totalPrice && props.materialInfo.pricePerUnit">
          {{ price }}
        </span>
      </div>
      <div class="d-flex material-info-middle-container">
        <span class="mr-3">
          {{ props.materialInfo.quantity }}
          {{ props.materialInfo?.materialUnitName?.toLowerCase() }}(s)
        </span>
        <span class="mx-3">
          <FontAwesomeIcon :icon="['fas', 'truck']" class="pr-3" />
          {{ props.materialInfo.vehicleType }}
        </span>

        <span class="mr-3" v-if="props.materialInfo.onewayJourneyTime">
          <FontAwesomeIcon :icon="['fas', 'stopwatch']" class="pr-3" />
          {{ props.materialInfo.onewayJourneyTime }} minutes one-way
        </span>
      </div>
    </div>
    <div class="align-items-center material-info-bottom-container">
      <FontAwesomeIcon
        v-if="!props.materialInfo.deliveryLocation"
        :icon="['fas', 'long-arrow-alt-right']"
        class="px-3"
      />
      <span>{{ props.materialInfo.depotName }}</span>
      <FontAwesomeIcon
        v-if="props.materialInfo.deliveryLocation"
        :icon="['fas', 'long-arrow-alt-right']"
        class="px-3"
      />
      <span>{{ props.materialInfo.deliveryLocation }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { VQuoteMaterialInfo } from "../../core/types/quotes";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { formatPrice } from "../../core/functions/financialFunctions";
import { storeToRefs } from "pinia";
import { ComputedRef, computed } from "vue";

interface Props {
  materialInfo: VQuoteMaterialInfo;
  isSmall?: boolean;
}

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

const props = withDefaults(defineProps<Props>(), {});

const price: ComputedRef<string> = computed(() => {
  let total = formatPrice(props.materialInfo.totalPrice);
  let perUnit = formatPrice(props.materialInfo.pricePerUnit);
  let unitCharacter = props.materialInfo.materialUnitName.substring(0, 1).toLowerCase();
  return `£${total} (£${perUnit} p/${unitCharacter})`;
});
</script>

<style scoped>
.scroll-material-info {
  max-height: 50px;
  overflow-y: scroll;
}
</style>
