<template>
  <div class="d-flex align-items-center">
    <FontAwesomeIcon :icon="['fas', 'plus']" class="pe-3" />
    Created by {{ props.createdByName }} at {{ props.createdDateTime }}
  </div>
  <div class="d-flex align-items-center">
    <FontAwesomeIcon :icon="['fas', 'user']" class="pe-3" />
    <hr />
    <div>
      Created for
      <span class="d-inline" v-if="props.customerName">
        {{ props.customerName }} at
      </span>
      {{ props.companyName }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps<{
  customerName: string;
  companyName: string;
  createdByName: string;
  createdDateTime: string;
}>();
</script>

<style scoped></style>
