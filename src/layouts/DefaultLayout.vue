<!-- src/layouts/DefaultLayout.vue -->
<template>
  <div>
    <header>
      <!-- Add your header/navigation component here -->
    </header>

    <main>
      <slot name="default"></slot>
    </main>

    <footer>
      <!-- Add your footer component here -->
    </footer>
  </div>
</template>

<script lang="ts">
export default {
  name: "DefaultLayout",
};
</script>
>

<style scoped>
/* Add your shared layout styles here */
</style>
