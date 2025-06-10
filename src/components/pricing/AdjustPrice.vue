<template>
  <div class="collapse-container">
    <CollapsableButton :identifier="collapseIdentifier" :isLoading="isLoading">
      <template v-slot:button>
        <AdjustDeliveryPriceButton
          :class="props.buttonClasses"
          v-if="!hasMaterialPricing"
          :id="props.id"
          :delivery-location="props.metrics.deliveryLocation"
          :start-location="props.metrics.startLocation"
          :oneway-journey-time="props.metrics.onewayJourneyTime"
          :number-of-loads="props.metrics.numberOfLoads"
          :vehicle-type-name="props.metrics.vehicleTypeName"
          :delivery-unit-name="deliveryUnit.deliveryUnitName"
          v-bind="getCollapseAttributes(collapseIdentifier)"
          :is-open="props.isOpen"
          @toggle="toggleCollapse"
        />

        <AdjustSupplyDeliveryPriceButton
          v-else
          v-bind="getCollapseAttributes(collapseIdentifier)"
          class="material-info-blue"
          :class="props.buttonClasses"
          :id="props.id"
          :isCollapsable="true"
          :delivery-location="props.metrics.deliveryLocation"
          :oneway-journey-time="props.metrics.onewayJourneyTime"
          :number-of-loads="props.metrics.numberOfLoads"
          :quantity="props.metrics.quantity"
          :depot-name="props.metrics.depotName"
          :material-name="props.metrics.materialName"
          :vehicle-type-name="props.metrics.vehicleTypeName"
          :material-unit-name="props.metrics.materialUnitName"
          :price-per-unit="price.materialPricing.materialPricePerQuantityUnit"
          :is-open="props.isOpen"
          @toggle="toggleCollapse"
        />
      </template>
    </CollapsableButton>
    <CollapsableContainer
      :identifier="collapseIdentifier"
      :is-open="props.isOpen"
      :show-close-button="false"
      @toggle="toggleCollapse"
    >
      <template v-slot:content>
        <div class="d-flex adjust-price-container">
          <div class="col-6 adjust-price-contents" v-if="hasMaterialPricing">
            <AdjustMaterialPrice
              :id="props.id"
              :journey-time="props.metrics.onewayJourneyTime"
              :quantity="props.metrics.quantity"
              :number-of-loads="props.metrics.numberOfLoads"
              :material-unit-name="props.metrics.materialUnitName"
            />
          </div>
          <div class="col-6">
            <AdjustDeliveryPrice
              :id="props.id"
              :journey-time="props.metrics.onewayJourneyTime"
              :number-of-loads="props.metrics.numberOfLoads"
              :delivery-unit-name="deliveryUnit.deliveryUnitName"
              @journey-time-updated="(journeyTime) => emit('journey-time-updated', journeyTime)"
            />
          </div>
        </div>
      </template>
    </CollapsableContainer>
  </div>
</template>

<script lang="ts" setup>
import { CollapsableContainer, CollapsableButton } from "../../components/shared";
import {
  AdjustDeliveryPrice,
  AdjustMaterialPrice,
  AdjustSupplyDeliveryPriceButton,
  AdjustDeliveryPriceButton,
} from "../../components/pricing";
import { RecordTypes } from "../../api/haulage-system";
import {
  VAdjustQuotePriceParameterMetrics,
  VAdjustQuotePrice,
  VAdjustQuotePriceRecalcMetrics,
} from "../../core/types/pricing";
import { getCollapseAttributes } from "../../core/functions/sharedFunctions";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { storeToRefs } from "pinia";
import { ComputedRef, computed, watchEffect, watch } from "vue";

const props = defineProps<{
  id: number;
  isOpen: boolean;
  buttonClasses?: string;
  metrics: VAdjustQuotePriceParameterMetrics;
}>();

const globalStore = useGlobalStore();
const { deliveryUnit } = storeToRefs(globalStore);
const store = useHaulageSystemStore();
const { isLoading, quoteType } = storeToRefs(store);
const adjustPriceStore = useAdjustQuotePriceStore();
const { getPricing } = storeToRefs(adjustPriceStore);

const emit = defineEmits(["toggle-is-open", "journey-time-updated"]);

let collapseIdentifier: string = `adjust-price-${props.id}`;

const price: ComputedRef<VAdjustQuotePrice> = computed(() => {
  return getPricing.value(props.id);
});
const hasMaterialPricing: ComputedRef<boolean> = computed(() => price.value.materialPricing != null);

const rules = computed(() => {
  const object = {
    adjustPrice: {
      deliveryPricing: {
        deliveryPricePerTimeUnit: { required },
        totalDeliveryPrice: { required },
      },
      onewayJourneyTime: { required },
    },
  } as any;

  if (quoteType.value === RecordTypes.SupplyAndDelivery) {
    object.adjustPrice.materialPricing = {
      materialPricePerQuantityUnit: { required },
      totalMaterialPrice: { required },
    };
    object.adjustPrice.materialAndDeliveryPricePerQuantityUnit = { required };
  }

  return object;
});

const v$ = useVuelidate(rules.value, {
  adjustPrice: {
    deliveryPricing: price.value.deliveryPricing,
    materialPricing: price.value.materialPricing,
    materialAndDeliveryPricePerQuantityUnit: price.value.materialAndDeliveryPricePerQuantityUnit,
    onewayJourneyTime: props.metrics.onewayJourneyTime,
  },
});

function toggleCollapse(): void {
  emit("toggle-is-open");
}

watch(
  () => price.value,
  () => {
    v$.value.$validate();
    adjustPriceStore.setValidationStates(props.id, v$.value.adjustPrice);
  },
  { deep: true }
);

watchEffect(() => {
  adjustPriceStore.setRecalculationMetrics({
    id: props.id,
    numberOfLoads: props.metrics.numberOfLoads,
    onewayJourneyTime: props.metrics.onewayJourneyTime,
    quantity: props.metrics.quantity,
    quoteType: props.metrics.quoteType,
  } as VAdjustQuotePriceRecalcMetrics);
});
</script>

<style scoped>
.adjust-price-container {
  background-color: var(--lightest-grey);
  border: 1px solid var(--grey);
  padding: 1rem;
}
.collapse-container:not(:last-child) {
  margin-bottom: 1rem;
}
:deep(.input-updated) {
  border-left: 6px solid var(--green) !important;
}
:deep(.input-border) {
  border-left: 6px solid var(--grey);
}
</style>
