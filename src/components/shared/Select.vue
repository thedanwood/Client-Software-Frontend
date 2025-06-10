<template>
  <div>
    <label class="input-label" v-if="props.label != null">
      {{ label }}
    </label>
    <slot name="between-label-and-input"></slot>
    <Multiselect
      class="input-element pt-1"
      v-model="selectedValue"
      track-by="label"
      :searchable="true"
      :options="props.options"
      :disabled="props.disabled"
      :placeholder="placeholder"
      :loading="showLoadingSpinner"
      @search-change="onSearchChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import type { VSelectOptionItem } from "../../core/types/shared";
import Multiselect from "@vueform/multiselect";

const emit = defineEmits(["change", "input"]);

interface Props {
  value: number;
  options: VSelectOptionItem[];
  label?: string;
  placeholder?: string;
  allowMultiple?: boolean;
  isSearchable?: boolean;
  disabled?: boolean;
  showSpinner?: boolean;
  isDynamicLoading?: boolean;
  // noOptionsText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  allowMultiple: false,
  isSearchable: false,
  disabled: false,
  showSpinner: false,
  isDynamicLoading: false,
  // noOptionsText: "Start typing to get results...",
});

const isLoadingResult: Ref<boolean> = ref(false);

const selectedValue = computed({
  get: () => props.value,
  set: (value) => {
    return emit("change", value);
  },
});
const placeholder: ComputedRef<string> = computed(() => (props.showSpinner ? "" : props.placeholder));
const showLoadingSpinner: ComputedRef<boolean> = computed(
  () => props.showSpinner || (props.isDynamicLoading && isLoadingResult.value)
);

watch(
  () => props.options,
  (x) => {
    isLoadingResult.value = false;
  }
);

function onSearchChange(searchTerm: string) {
  if (searchTerm !== "") {
    isLoadingResult.value = true;
  }
  emit("input", searchTerm);
}
</script>

<style scoped></style>
