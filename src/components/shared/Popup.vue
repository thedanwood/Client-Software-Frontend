<template>
  <div class="popup" :class="props.class" v-show="props.showModal">
    <div class="popup-content">
      <div class="popup-header pt-2">
        <h4 class="text-center">{{ props.heading }}</h4>
        <hr />
        <div class="close-modal-btn-container">
          <Button
            @click="emit('close-modal')"
            :disabled="isLoading"
            :iconBefore="['fas', 'xmark']"
            class="close-modal-btn"
            :value="null"
          ></Button>
        </div>
      </div>
      <div class="p-3">
        <slot name="main-content"></slot>
      </div>
      <hr />
      <div class="p-3">
        <slot name="footer-content"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import "bootstrap/js/dist/collapse";
import { defineProps, withDefaults } from "vue";
import { Button } from "../../components/shared";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";

interface Props {
  showModal: boolean;
  heading: string;
  class: string;
}

const emit = defineEmits(["click", "close-modal"]);

const props = withDefaults(defineProps<Props>(), {
  showModal: false,
  class: "",
});

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

function closeModal() {}
</script>

<style scoped>
.popup {
  position: fixed;
  z-index: 20;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}
.popup-content {
  background-color: white;
  margin: 5vh auto; /* 15% from the top and centered */
  border: 1px solid #888;
  width: 50%; /* Could be more or less, depending on screen size */
}
.popup-sm .popup-content {
  width: 40%;
}
.popup-xs .popup-content {
  width: 30%;
}
.popup-lg .popup-content {
  width: 60%;
}
.popup-xl .popup-content {
  width: 70%;
}
.close-modal-btn-container {
  position: absolute;
  top: 0;
  right: 0;
}
.header-red .popup-header,
.header-red .close-modal-btn * {
  background-color: var(--red);
  color: white;
}
.header-blue .popup-header,
.header-blue .close-modal-btn * {
  background-color: var(--blue);
  color: white;
}
.header-purple .popup-header,
.header-purple .close-modal-btn {
  background-color: var(--purple);
  color: white !important;
}
.header-turquoise .popup-header,
.header-turquoise .close-modal-btn {
  background-color: var(--turquoise);
  color: white;
}
.header-dark-grey .popup-header,
.header-dark-grey .close-modal-btn {
  background-color: var(--dark-grey);
  color: white;
}
.header-green .popup-header,
.header-green .close-modal-btn {
  background-color: var(--green);
  color: white;
}
:deep(.close-modal-btn svg) {
  font-size: 30px;
  color: white;
}
:deep(.close-modal-btn svg:hover) {
  color: black;
}
</style>
