<script setup lang="ts">

const props = defineProps<{
  text: string;
}>();

const emit = defineEmits(["click"])
</script>

<template>
  <a class="text-link" @click="emit('click')">{{ props.text }}</a>
</template>

<style scoped>
.text-link {
  color:var(--blue);
  cursor:pointer;
  font-weight: bold;
  text-decoration: none;
}
</style>