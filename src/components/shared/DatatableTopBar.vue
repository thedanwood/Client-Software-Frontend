<template>
  <div class="d-flex justify-content-between">
    <ul class="legend float-left pe-4" v-if="props.legend">
      <li v-for="(legend, index) in props.legend.legends" :key="index">
        <span :class="`key ${legend.class}`"></span> {{ legend.text }}
      </li>
    </ul>
    <div v-if="props.showMiddleContent" class="d-flex align-items-center me-auto">
      <slot name="middle-content"></slot>
    </div>
    <div class="search-container pb-3">
      <div>
        <FontAwesomeIcon role="button" :icon="['fas', 'magnifying-glass']" />
      </div>
      <Input :disabled="isLoading" @input="(val) => emit('filter', val)" :placeholder="props.searchPlaceholder" />
    </div>
  </div>
  <AlertBox v-if="props.showAlertBox" :class="`${props.alertBoxClass} mt-3`" :text="props.alertBoxText"></AlertBox>
</template>

<script lang="ts" setup>
import VLegend from "../../core/types/shared/VLegend";
import { Input, AlertBox } from "../../components/shared";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";

interface Props {
  legend: VLegend;
  showMiddleContent: boolean;
  searchPlaceholder: string;
  showAlertBox: boolean;
  alertBoxText: string;
  alertBoxClass: string;
}

const props = withDefaults(defineProps<Props>(), {
  showMiddleContent: true,
  legend: null,
  showAlertBox: false,
  alertBoxText: null,
  alertBoxClass: null,
});

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

const emit = defineEmits(["filter"]);

function onSearchInput(searchQuery: string) {
  emit("filter", searchQuery);
}
</script>

<style lang="scss "></style>
