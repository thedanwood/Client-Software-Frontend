<template>
  <div class="d-flex justify-content-center">
    <div class="error-container">
      <h1>
        <FontAwesomeIcon class="d-block text-center" :icon="['fas', 'triangle-exclamation']" />
      </h1>
      <h4 class="mt-2 text-center">
        {{ config.errorMessages.generic }}
      </h4>
      <Button class="btn-turquoise btn-lg mt-4 mx-3" value="Try Again" @click="goBack" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { config } from "../../core/constants";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Button } from ".";
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.go(-1);
}
</script>

<style lang="scss">
.error-container {
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  * {
    color: var(--dark-red);
  }
}
</style>
