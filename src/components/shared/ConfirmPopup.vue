<template>
  <Popup
    :showModal="props.isOpen"
    :heading="props.heading"
    :class="props.class"
    @close-modal="this.$emit('close-modal')"
  >
    <template v-slot:main-content>
      <div class="text-center">
        <h1 v-if="props.icon" class="icon mb-4">
          <div>
            <FontAwesomeIcon
              role="button"
              class="icon"
              :icon="props.icon"
              :disabled="isLoading"
              :class="props.iconClass"
            />
          </div>
        </h1>
        <h4 v-if="props.message !== null">
          {{ props.message }}
        </h4>
        <div v-else>
          <slot name="message"></slot>
        </div>
      </div>
    </template>
    <template v-slot:footer-content>
      <div class="d-flex justify-content-center align-items-center">
        <Button
          class="btn-dark"
          :iconBefore="['fas', 'xmark']"
          value="Cancel"
          :disabled="isLoading"
          @click="$emit('close-modal')"
        />
        <slot name="buttons"></slot>
      </div>
    </template>
  </Popup>
</template>

<script lang="ts" setup>
import { defineProps, withDefaults } from "vue";
import { Popup, Button } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useHaulageSystemStore } from "@/stores/haulageSystemStore";
import { storeToRefs } from "pinia";

interface Props {
  heading: string;
  class: string;
  icon: string[];
  iconClass: string;
  message: string;
  isOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  message: null,
  icon: null,
  iconClass: "",
});

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

const emit = defineEmits(["close-modal"]);
</script>

<style lang="scss">
.icon svg {
  font-size: 80px;
}
</style>
