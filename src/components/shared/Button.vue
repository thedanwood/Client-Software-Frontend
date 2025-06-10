<template>
  <div>
    <label v-if="showLabel">
      {{ label }}
    </label>
    <button
      :class="`btn w-auto ${props.class}`"
      :disabled="props.disabled"
      v-bind="attributes"
      @click.prevent="onClick"
      value=""
    >
      <span
        v-if="iconBefore !== null && iconBefore !== undefined"
        :class="iconOnTop ? 'd-block justify-content-center' : ''"
      >
        <FontAwesomeIcon :icon="iconBefore" />
      </span>
      {{ value }}
      <span v-if="iconAfter !== null && iconAfter !== undefined">
        <FontAwesomeIcon :icon="iconAfter" />
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface Props {
  label?: string;
  showLabel: boolean;
  iconBefore: string[];
  iconAfter: string[];
  iconOnTop: boolean;
  disabled: boolean;
  value: string;
  class?: string;
  attributes: object;
}
const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  iconOnTop: false,
  iconBefore: () => [],
  iconAfter: () => [],
  disabled: false,
  attributes: null,
});

const emit = defineEmits(["click"]);

function onClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>
