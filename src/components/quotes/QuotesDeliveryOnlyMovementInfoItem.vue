<template>
  <div class="d-flex w-100 flex-column p-2 bg-black-opacity-10 mt-2" :disabled="isLoading">
    <div class="d-flex justify-content-between">
      <span class="d-flex">
        Starting at
        {{ props.startLocation }}
      </span>
      <span class="d-flex"> {{ props.numberOfLoads }} load(s) </span>
    </div>
    <span class="ms-4">
      <FontAwesomeIcon :icon="['fas', 'truck']" class="pl-3" />
      {{ props.vehicleType }}
    </span>
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
  startLocation: string;
  vehicleType: string;
  numberOfLoads: number;
}

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

const props = withDefaults(defineProps<Props>(), {});
</script>
