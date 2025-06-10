<template>
  <div>
    <label class="input-label" v-if="props.label">{{ props.label }}</label>
    <div v-for="(item, index) in checkboxItems" :key="index" class="mb-2 input-element">
      <input
        type="checkbox"
        :value="item.value"
        :checked="isChecked(item.value)"
        :id="index.toString()"
        :name="props.groupName"
        :disabled="props.disabled"
        @change="onChange"
      />
      <label>{{ item.label?.toString() }}</label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VCheckboxItem } from "../../core/types/shared";
import { computed } from "vue";
import { getHtmlEvent } from "../../core/functions/sharedFunctions";

const emit = defineEmits(["checked"]);

const props = defineProps<{
  checkboxItems: VCheckboxItem[];
  groupName: string;
  selectedValues: number[];
  label?: string;
  disabled: boolean;
}>();

function isChecked(value: number) {
  return internalSelectedValues.value.some((x) => x === value);
}

const internalSelectedValues = computed({
  get: () => {
    return props.selectedValues;
  },
  set: (values) => {
    emit("checked", values);
  },
});

function onChange(checkbox: any) {
  let event = getHtmlEvent(checkbox);
  let value = parseInt(event.value);
  let internalValue = internalSelectedValues.value.find((x) => x === value);
  if (event.checked === false) {
    internalSelectedValues.value = internalSelectedValues.value.filter((x) => x !== internalValue);
  } else {
    internalSelectedValues.value = [...internalSelectedValues.value, value];
  }
}
</script>

<style scoped></style>
