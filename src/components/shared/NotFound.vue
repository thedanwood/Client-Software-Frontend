<template>
  <div class="d-flex justify-content-center">
    <div class="action-button-container">
      <h1>
        <FontAwesomeIcon class="d-block text-center me-3" :icon="['fas', 'triangle-exclamation']" />
      </h1>
      <h4 class="mt-2 text-center">
        <h2>This page doesn't exist!</h2>
      </h4>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterNames } from "../../core/enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Button } from ".";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style lang="scss">
.action-button-container {
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>
