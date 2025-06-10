<template>
  <div>
    <label class="input-label" v-if="label != null">
      {{ label }}
    </label>
    <input
      class="form-control input-element"
      type="date"
      :value="formattedValue"
      :disabled="props.disabled"
      @change="(event) => onChange(getHtmlEvent(event).value)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted } from "vue";
import { getHtmlEvent } from "../../core/functions/sharedFunctions";
import moment from "moment";

interface Props {
  label?: string;
  placeholder: string;
  value: Date;
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "dd/mm/yyyy",
  disabled: false,
});

const emit = defineEmits(["change"]);

const formattedValue: ComputedRef<string> = computed(() => {
  return moment(props.value).format("YYYY-MM-DD");
});

function onChange(test: string) {
  emit("change", new Date(test));
}

onMounted(() => {});
</script>

<style scoped></style>
