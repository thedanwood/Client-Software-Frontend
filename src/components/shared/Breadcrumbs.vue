<template>
  <div class="breadcrumb-container">
    <ol class="breadcrumb">
      <li
        v-for="breadcrumb in props.breadcrumbs"
        :class="{ 'breadcrumb-item': true, active: breadcrumb.isActive, faded: breadcrumb.isFaded }"
      >
        <span
          role="button"
          @click="breadcrumb.isNavigatable ? router.push({ name: breadcrumb.navigateToRouteName }) : ''"
        >
          {{ breadcrumb.text }}
        </span>
      </li>
    </ol>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import VBreadcrumbItem from "../../core/types/shared/VBreadcrumbItem";

interface Props {
  breadcrumbs: VBreadcrumbItem[];
  includeHome: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  includeHome: true,
});

const router = useRouter();
</script>

<style lang="scss">
.breadcrumb-container {
  margin-left: 1rem;
}
.breadcrumb-item.active * {
  color: var(--bright-blue) !important;
}
.breadcrumb-item.active *:hover {
  color: var(--dark-blue) !important;
}
.breadcrumb-item.faded * {
  color: var(--grey) !important;
  pointer-events: none;
}
</style>
