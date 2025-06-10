<script setup lang="ts">
import type { ErrorObject, ValidationRuleCollection } from "@vuelidate/core";

interface Props {
  errors: any;
  class: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: "",
});
</script>

<template>
  <div :class="props.class">
    <slot name="above-message-content"></slot>

    <span v-for="(error, index) in props.errors" :key="index">
      <p class="text-danger">{{ error.$message }}</p>
    </span>
  </div>
</template>
