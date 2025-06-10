<template>
  <div>
    <div class="input-group">
      <NumberPicker
        class="input-element disabled-input"
        :label="`Default material price per ${props.materialUnitName}`"
        :disabled="true"
        :value="materialPricing.defaultMaterialPricePerQuantityUnit"
      />
    </div>

    <div class="input-group">
      <label class="input-label mt-2">Price per {{ props.materialUnitName }} (material and delivery)</label>
      <div class="input-element adjust-price-input-container">
        <div class="d-flex flex-column">
          <NumberPicker
            :is-price="true"
            class="input-border"
            :class="
              getHighlight(
                getMaterialAndDeliveryPricePerQuantityUnit(props.id),
                originalValues?.materialAndDeliveryPricePerQuantityUnit
              )
            "
            :value="getMaterialAndDeliveryPricePerQuantityUnit(props.id)"
            :disabled="isLoading"
            @change="(val) => (unsavedMaterialAndDeliveryPricePerQuantityUnit = val)"
          />
          <VuelidateErrors :errors="getValidationState(props.id)?.materialAndDeliveryPricePerQuantityUnit?.$errors" />
        </div>
        <Button
          class="btn-green update-btn mx-1"
          value="Update"
          :disabled="isLoading"
          @click="
            store.setMaterialAndDeliveryPricePerQuantityUnit(unsavedMaterialAndDeliveryPricePerQuantityUnit, props.id)
          "
        />
        <Button
          class="btn-dark reset-btn mx-1"
          value="Reset"
          :disabled="isLoading"
          @click="
            store.setMaterialAndDeliveryPricePerQuantityUnit(
              getDefaultMaterialAndDeliveryPricePerQuantityUnit(props.id),
              props.id
            )
          "
        />
      </div>
    </div>

    <label class="mt-3">Material pricing</label>
    <div class="input-group-white-container">
      <div class="input-group">
        <label class="input-label">Total material price</label>
        <div class="input-element adjust-price-input-container">
          <div class="d-flex flex-column">
            <NumberPicker
              :is-price="true"
              :value="getTotalMaterialPrice(props.id)"
              class="input-border"
              :class="
                getHighlight(getTotalMaterialPrice(props.id), originalValues?.materialPricing?.totalMaterialPrice)
              "
              :disabled="isLoading"
              @change="(val) => (unsavedTotalMaterialPrice = val)"
            />
            <VuelidateErrors :errors="getValidationState(props.id)?.materialPricing?.totalMaterialPrice?.$errors" />
          </div>

          <Button
            class="btn-green update-btn mx-1"
            value="Update"
            :disabled="isLoading"
            @click="store.setTotalMaterialPrice(unsavedTotalMaterialPrice, props.id)"
          />
          <Button
            class="btn-dark reset-btn mx-1"
            value="Reset"
            :disabled="isLoading"
            @click="store.setTotalMaterialPrice(materialPricing.defaultTotalMaterialPrice, props.id)"
          />
        </div>
      </div>
      <div class="input-group mt-2">
        <label class="input-label">Material price per {{ props.materialUnitName }}</label>
        <div class="input-element adjust-price-input-container">
          <div class="d-flex flex-column">
            <NumberPicker
              :value="getMaterialPricePerQuantityUnit(props.id)"
              :isPrice="true"
              class="input-border"
              :class="
                getHighlight(
                  getMaterialPricePerQuantityUnit(props.id),
                  originalValues?.materialPricing?.materialPricePerQuantityUnit
                )
              "
              :disabled="isLoading"
              @change="(val) => (unsavedmaterialPricePerQuantityUnit = val)"
            />
            <VuelidateErrors
              :errors="getValidationState(props.id)?.materialPricing?.materialPricePerQuantityUnit?.$errors"
            />
          </div>

          <Button
            class="btn-green update-btn mx-1"
            value="Update"
            :disabled="isLoading"
            @click="store.setMaterialPricePerQuantityUnit(unsavedmaterialPricePerQuantityUnit, props.id)"
          />
          <Button
            class="btn-dark reset-btn mx-1"
            value="Reset"
            :disabled="isLoading"
            @click="
              store.setMaterialPricePerQuantityUnit(materialPricing.defaultMaterialPricePerQuantityUnit, props.id)
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VuelidateErrors, NumberPicker, Button } from "../../components/shared";
import { VAdjustMaterialQuotePrice, VAdjustQuotePrice } from "../../core/types/pricing";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { getHighlight } from "../../core/functions/sharedFunctions";
import cloneDeep from "lodash.clonedeep";
import { storeToRefs } from "pinia";
import { ComputedRef, computed, Ref, ref, onMounted } from "vue";

const props = defineProps<{
  id: number;
  journeyTime: number;
  materialUnitName: string;
  quantity: number;
  numberOfLoads: number;
}>();

const store = useAdjustQuotePriceStore();
const {
  getPricing,
  getMaterialPricing,
  getTotalMaterialPrice,
  getMaterialPricePerQuantityUnit,
  getMaterialAndDeliveryPricePerQuantityUnit,
  getDefaultMaterialAndDeliveryPricePerQuantityUnit,
  getValidationState,
} = storeToRefs(store);
const mainStore = useHaulageSystemStore();
const { isLoading } = storeToRefs(mainStore);

const materialPricing: ComputedRef<VAdjustMaterialQuotePrice> = computed(() => getMaterialPricing.value(props.id));

let originalValues: Ref<VAdjustQuotePrice> = ref(null);
let unsavedMaterialAndDeliveryPricePerQuantityUnit: Ref<number> = ref(
  getPricing.value(props.id).materialAndDeliveryPricePerQuantityUnit
);
let unsavedmaterialPricePerQuantityUnit: Ref<number> = ref(materialPricing.value.materialPricePerQuantityUnit);
let unsavedTotalMaterialPrice: Ref<number> = ref(materialPricing.value.totalMaterialPrice);

onMounted(() => {
  originalValues.value = cloneDeep(getPricing.value(props.id));
});
</script>

<style scoped></style>
