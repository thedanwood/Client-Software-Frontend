<template>
  <div :class="`alert ${props.class}`">
    <FontAwesomeIcon role="button" class="pe-3 icon-bg" :icon="iconText" />
    <span>
      {{ props.text }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface Props {
  text: string;
  class: string;
  showIcon: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
});

const iconText: ComputedRef<any> = computed(() => {
  if (props.class.includes("success")) {
    return ["fas", "check"];
  }
  return "";
});
</script>

<style lang="scss">
.alert {
  border-radius: 0 !important;
}
</style>
