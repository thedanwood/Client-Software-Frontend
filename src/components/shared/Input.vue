<template>
  <div>
    <label class="input-label" v-if="label != null">
      {{ label }}
    </label>
    <input
      type="text"
      :class="`form-control input-element ${props.classes}`"
      :name="props.name"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :value="value"
      @input="(event) => onInput(getHtmlEvent(event).value)"
    />
  </div>
</template>

<script lang="ts" setup>
import { getHtmlEvent } from "../../core/functions/sharedFunctions";

const emit = defineEmits(["input"]);

interface Props {
  value: string | null;
  label?: string | null;
  placeholder?: string;
  disabled?: boolean;
  classes?: string;
  name?: string;
}
const props = withDefaults(defineProps<Props>(), {
  value: null,
  label: null,
  disabled: false,
  classes: "",
});

function onInput(newValue: string) {
  emit("input", newValue);
}
</script>

<style scoped></style>
