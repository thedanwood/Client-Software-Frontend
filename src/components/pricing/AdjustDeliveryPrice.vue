<template>
  <div>
    <div class="input-group">
      <label class="input-label">Total one-way journey time</label>
      <div class="input-element adjust-price-input-container">
        <div class="d-flex flex-column">
          <NumberPicker
            class="input-border"
            :class="getHighlight(journeyTime, getPricing(props.id).defaultOnewayJourneyTime)"
            :value="props.journeyTime"
            :disabled="isLoading"
            @change="(val) => (unsavedOnewayJourneyTime = val)"
          />
          <VuelidateErrors :errors="getValidationState(props.id)?.onewayJourneyTime.$errors" />
        </div>

        <Button
          class="btn-green update-btn mx-1"
          value="Update"
          :disabled="isLoading"
          @click="setOnewayJourneyTime(unsavedOnewayJourneyTime)"
        />
        <Button
          class="btn-dark reset-btn mx-1"
          value="Reset"
          :disabled="isLoading"
          @click="setOnewayJourneyTime(getPricing(props.id).defaultOnewayJourneyTime)"
        />
      </div>
    </div>

    <div class="input-group">
      <NumberPicker
        class="input-element disabled-input"
        containerClass="mt-2"
        :label="`Default delivery price per ${props.deliveryUnitName}`"
        :disabled="true"
        :value="getDeliveryPricing(props.id).defaultDeliveryPricePerTimeUnit"
      />
    </div>

    <label class="mt-3">Delivery pricing</label>
    <div class="input-group-white-container">
      <div class="input-group">
        <label class="input-label">Total delivery price</label>
        <div class="input-element adjust-price-input-container">
          <div class="d-flex flex-column">
            <NumberPicker
              class="input-border"
              :class="getHighlight(getTotalDeliveryPrice(props.id), originalValues?.totalDeliveryPrice)"
              :value="getTotalDeliveryPrice(props.id)"
              :is-price="true"
              :disabled="isLoading"
              @change="(val) => (unsavedTotalDeliveryPrice = val)"
            />
            <VuelidateErrors :errors="getValidationState(props.id)?.deliveryPricing?.totalDeliveryPrice.$errors" />
          </div>

          <Button
            class="btn-green update-btn mx-1"
            value="Update"
            :disabled="isLoading"
            @click="store.setTotalDeliveryPrice(unsavedTotalDeliveryPrice, props.id)"
          />
          <Button
            class="btn-dark reset-btn mx-1"
            value="Reset"
            :disabled="isLoading"
            @click="store.setTotalDeliveryPrice(originalValues?.defaultTotalDeliveryPrice, props.id)"
          />
        </div>
      </div>
      <div class="input-group mt-2">
        <label class="input-label">Delivery price per {{ props.deliveryUnitName.toLocaleLowerCase() }}</label>
        <div class="input-element adjust-price-input-container">
          <div class="d-flex flex-column">
            <NumberPicker
              class="input-border"
              :class="getHighlight(getDeliveryPricePerTimeUnit(props.id), originalValues?.deliveryPricePerTimeUnit)"
              :disabled="isLoading"
              :value="getDeliveryPricePerTimeUnit(props.id)"
              :isPrice="true"
              @change="(val) => (unsavedDeliveryPricePerTimeUnit = val)"
            />
            <VuelidateErrors
              :errors="getValidationState(props.id)?.deliveryPricing?.deliveryPricePerTimeUnit.$errors"
            />
          </div>

          <hr />
          <Button
            class="btn-green update-btn mx-1"
            value="Update"
            :disabled="isLoading"
            @click="store.setDeliveryPricePerTimeUnit(unsavedDeliveryPricePerTimeUnit, props.id)"
          />
          <Button
            class="btn-dark reset-btn mx-1"
            value="Reset"
            :disabled="isLoading"
            @click="store.setDeliveryPricePerTimeUnit(originalValues?.defaultDeliveryPricePerTimeUnit, props.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VuelidateErrors, NumberPicker, Button } from "../../components/shared";
import { AdjustDeliveryQuotePricingDto } from "../../api/haulage-system";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { getHighlight } from "../../core/functions/sharedFunctions";
import cloneDeep from "lodash.clonedeep";
import { storeToRefs } from "pinia";
import { Ref, ref, onMounted } from "vue";

const props = defineProps<{
  id: number;
  journeyTime: number;
  numberOfLoads: number;
  deliveryUnitName: string;
}>();

const mainStore = useHaulageSystemStore();
const store = useAdjustQuotePriceStore();
const { getDeliveryPricing, getPricing, getTotalDeliveryPrice, getDeliveryPricePerTimeUnit, getValidationState } =
  storeToRefs(store);
const { isLoading } = storeToRefs(mainStore);

let emit = defineEmits(["journey-time-updated"]);

let originalValues: Ref<AdjustDeliveryQuotePricingDto> = ref(null);

let unsavedOnewayJourneyTime: Ref<number> = ref();
let unsavedTotalDeliveryPrice: Ref<number> = ref();
let unsavedDeliveryPricePerTimeUnit: Ref<number> = ref();

function setOnewayJourneyTime(unsavedOnewayJourneyTime: number) {
  emit("journey-time-updated", unsavedOnewayJourneyTime);
}

function setUnsavedToCurrent() {
  unsavedDeliveryPricePerTimeUnit.value = getDeliveryPricePerTimeUnit.value(props.id);
  unsavedOnewayJourneyTime.value = props.journeyTime;
  unsavedTotalDeliveryPrice.value = getTotalDeliveryPrice.value(props.id);
}

onMounted(() => {
  originalValues.value = cloneDeep(getDeliveryPricing.value(props.id));
  setUnsavedToCurrent();
});
</script>

<style scoped>
:deep(input[type="number"]) {
  max-width: 140px;
}
</style>
