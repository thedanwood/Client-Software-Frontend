<template>
  <div>
    <label class="input-label">{{ props.label }}</label>
    <div v-for="(item, index) in radioItems" :key="index">
      <label :for="index.toString()">{{ item.label.toString() }}</label>
      <input
        type="radio"
        :value="item.value"
        v-model="internalValue"
        :selected="item.value == props.value"
        :id="index.toString()"
        :name="props.radioGroupName"
        :disabled="props.disabled"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import VRadioItem from "../../core/types/shared/VRadioItem";
import { computed, onMounted, ref, Ref } from "vue";
import { getHtmlEvent } from "../../core/functions/sharedFunctions";

const emit = defineEmits(["change"]);

const props = defineProps<{
  radioItems: VRadioItem[];
  radioGroupName: string;
  value: number;
  label: string;
  disabled: boolean;
}>();

const isLoadingInitialData: Ref<boolean> = ref(false);

const internalValue = computed({
  get: () => props.value,
  set: (value) => {
    if (isLoadingInitialData.value) return;
    emit("change", value);
  },
});

const checkedV: number = 1;

function onChange(event: Event) {
  internalValue.value = parseInt(getHtmlEvent(event).value);
}

onMounted(() => {
  isLoadingInitialData.value = true;
  internalValue.value = props.value;
  isLoadingInitialData.value = false;
});
</script>

<style scoped></style>
