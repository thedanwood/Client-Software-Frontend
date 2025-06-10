<template>
  <slot name="button"></slot>
</template>

<script lang="ts" setup>
import "bootstrap/js/dist/collapse";
import { onMounted } from "vue";

interface Props {
  isLoading: boolean;
  identifier: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  identifier: "1",
});


</script>
