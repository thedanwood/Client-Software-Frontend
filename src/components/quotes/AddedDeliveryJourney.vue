<template>
  <AlertBox
    v-if="journeyUpdatedTrigger"
    class="alert-success mt-3"
    :text="config.successMessages.journeyUpdated"
  ></AlertBox>
  <div class="d-flex mt-3">
    <div class="material-added-text col-11">
      <AddedDeliveryJourneyText :journey="props.journey" />
    </div>
    <div class="col-1 d-flex flex-column align-content-center justify-content-center">
      <FontAwesomeIcon
        role="button"
        class="d-block"
        :disabled="props.disabled"
        :icon="['fas', 'xmark']"
        @click="$emit('remove', props.journey.id)"
      />

      <CollapsableButton :isLoading="isLoading" :identifier="collapseIdentifier">
        <template v-slot:button>
          <FontAwesomeIcon
            role="button"
            class="mt-2"
            :disabled="props.disabled"
            :icon="['fas', 'pencil']"
            @click="toggleCollapse"
          />
        </template>
      </CollapsableButton>
    </div>
  </div>
  <CollapsableContainer :identifier="collapseIdentifier" :isOpen="isOpen" @toggle="toggleCollapse">
    <template v-slot:content>
      <AddOrUpdateDeliveryJourney
        :id="props.uniqueId"
        :key="props.uniqueId"
        :disabled="disabled"
        :updatingJourney="props.journey"
        @journeyUpdated="onJourneyUpdated"
      />
    </template>
  </CollapsableContainer>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { CollapsableContainer, CollapsableButton, AlertBox } from "../../components/shared";
import { AddOrUpdateDeliveryJourney, AddedDeliveryJourneyText } from "../../components/quotes";
import { config } from "../../core/constants";
import { VDeliveryJourney } from "../../core/types/quotes";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";
import { Ref, ref } from "vue";

const props = defineProps<{
  uniqueId: number;
  journey: VDeliveryJourney;
  disabled: boolean;
}>();

let isOpen: Ref<boolean> = ref(false);
let journeyUpdatedTrigger: Ref<boolean> = ref(false);

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);
const collapseIdentifier = `journey-${props.journey.id}`;

function toggleCollapse(): void {
  isOpen.value = !isOpen.value;
}

function onJourneyUpdated(): void {
  isOpen.value = false;
  journeyUpdatedTrigger.value = true;
  setTimeout(() => {
    journeyUpdatedTrigger.value = false;
  }, 3000);
  isOpen.value = false;
}
</script>

<style scoped>
.material-added-text {
  padding: 20px;
  border: 1px solid var(--light-blue);
  background-color: var(--lightest-blue);
}

svg:hover {
  transform: scale(1.2);
}
</style>
