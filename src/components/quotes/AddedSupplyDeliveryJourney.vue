<template>
  <AlertBox
    v-if="materialUpdatedTrigger"
    class="alert-success mt-3"
    :text="config.successMessages.materialUpdated(getMaterialById(journey.materialId).materialName)"
  ></AlertBox>
  <div class="d-flex mt-3">
    <div class="material-info-light-blue p-2 col-11">
      <QuotesMaterialInfoItem :materialInfo="getMaterialInfo()" :isSmall="true" />
    </div>
    <div class="col-1 d-flex flex-column align-content-center justify-content-center">
      <FontAwesomeIcon
        :disabled="props.disabled"
        role="button"
        :icon="['fas', 'xmark']"
        class="d-block"
        @click="$emit('remove', props.journey.id)"
      />
      <CollapsableButton :isLoading="isLoading" :identifier="collapseIdentifier">
        <template v-slot:button>
          <FontAwesomeIcon role="button" :icon="['fas', 'pencil']" class="mt-2" @click="toggleCollapse" />
        </template>
      </CollapsableButton>
    </div>
  </div>
  <CollapsableContainer :identifier="collapseIdentifier" :isOpen="isOpen" @toggle="toggleCollapse">
    <template v-slot:content>
      <AddOrUpdateSupplyDeliveryJourney
        :id="uniqueId"
        :isLoading="isLoading"
        :materialOptions="materialOptions"
        :materialUnitOptions="materialUnitOptions"
        :vehicleTypes="vehicleTypes"
        :updatingMaterial="props.journey"
        @material-updated="onMaterialUpdated"
      />
    </template>
  </CollapsableContainer>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { AddOrUpdateSupplyDeliveryJourney, QuotesMaterialInfoItem } from "../../components/quotes";
import { CollapsableContainer, CollapsableButton, AlertBox } from "../../components/shared";
import { VSupplyDeliveryJourney, VQuoteMaterialInfo } from "../../core/types/quotes";
import { VSelectOptionItem, VVehicleType } from "../../core/types/shared";
import { config } from "../../core/constants";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";
import { Ref, ref } from "vue";

const props = defineProps<{
  uniqueId: number;
  journey: VSupplyDeliveryJourney;
  materialOptions: VSelectOptionItem[];
  materialUnitOptions: VSelectOptionItem[];
  vehicleTypes: VVehicleType[];
  disabled: boolean;
}>();

let isOpen: Ref<boolean> = ref(false);
let materialUpdatedTrigger: Ref<boolean> = ref(false);

const store = useHaulageSystemStore();
const { isLoading, getMaterialUnitById, getVehicleTypeById, getMaterialById } = storeToRefs(store);
const collapseIdentifier = `material-${props.journey.id}`;

function toggleCollapse(): void {
  isOpen.value = !isOpen.value;
}

function getMaterialInfo(): VQuoteMaterialInfo {
  return {
    materialName: getMaterialById.value(props.journey.materialId).materialName,
    quantity: props.journey.quantity,
    materialUnitName: getMaterialUnitById.value(props.journey.materialUnitId).unitName,
    vehicleType: getVehicleTypeById.value(props.journey.vehicleTypeId).name,
    depotName: props.journey.depotName,
  } as VQuoteMaterialInfo;
}

function onMaterialUpdated(): void {
  materialUpdatedTrigger.value = true;
  setTimeout(() => {
    materialUpdatedTrigger.value = false;
  }, 3000);
  isOpen.value = false;
}
</script>

<style scoped>
svg:hover {
  transform: scale(1.2);
}
</style>
