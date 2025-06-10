<template>
  <div>
    <h1 class="page-title">Add New Quote</h1>
    <br />
    <div class="d-flex gap-3">
      <Button value="Haulage Only" class="btn-blue btn-big" :iconBefore="['fas', 'truck']" @click="gotoAddHaulageOnly">
      </Button>
      <Button
        class="btn-turquoise btn-big ml-3"
        value="Supply and Delivery"
        :iconBefore="['fas', 'truck-ramp-box']"
        @click="gotoSupplyDelivery"
      >
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button } from "../shared/index";
import { RouterNames } from "../../core/enums/RouterNames";
import { useRouter } from "vue-router";

const router = useRouter();

//functions
function gotoAddHaulageOnly(): void {
  router.push({
    name: RouterNames.DeliveryQuote,
  });
}

function gotoSupplyDelivery(): void {
  router.push({
    name: RouterNames.SupplyDeliveryQuote,
  });
}
</script>

<style scoped></style>
