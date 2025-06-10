<template>
  <div :class="props.containerClass">
    <label class="pb-1" v-if="label != null"> {{ label }} </label>
    <input
      class="form-control input-element max-width"
      :class="props.class"
      type="number"
      v-model="internalValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :min="props.minValue"
      :max="props.maxValue"
      @change="emit('change', (internalValue as any) == '' ? null : internalValue)"
      @input="enforceNumber(internalValue)"
    />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, watch, watchEffect } from "vue";
import { formatPrice } from "@/core/functions/financialFunctions";

//props
interface Props {
  value: number;
  label?: string;
  class?: string;
  containerClass?: string;
  placeholder?: string;
  disabled?: boolean;
  isPrice: boolean;
  minValue?: number;
  maxValue?: number;
}
const props = withDefaults(defineProps<Props>(), {
  minValue: 0,
  isPrice: false,
});

const emit = defineEmits(["change"]);
let internalValue: number;

watchEffect(() => {
  internalValue = formatInternalValue(props.value);
});

function formatInternalValue(value: number): any {
  if (props.isPrice) return formatPrice(value);

  return value;
}

function enforceNumber(num) {
  if (!parseInt(num.key) && num.key != "Backspace") {
    event.preventDefault();
  }
}
</script>

<style scoped>
input[type="number"] {
  max-width: 100px;
}
</style>
