<template>
  <div :id="`my-group-${props.identifier}`">
    <div
      :class="{ collapse: true, show: props.isOpen }"
      :id="`collapse-${props.identifier}`"
      :data-bs-parent="`#my-group-${props.identifier}`"
    >
      <FontAwesomeIcon
        v-if="props.showCloseButton"
        role="button"
        icon="fas fa-xmark"
        class="close-collapse"
        @click="emit('toggle')"
      />
      <slot name="content"> </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "bootstrap/js/dist/collapse";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface Props {
  isOpen: boolean;
  identifier: string;
  showCloseButton: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: true,
  identifier: "1",
  showCloseButton: true,
});

const emit = defineEmits(["toggle"]);
</script>

<style lang="scss">
.close-collapse {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}
</style>
