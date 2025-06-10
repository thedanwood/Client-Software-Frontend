<template>
  <div class="header-wrapper">
    <NavBar />
  </div>

  <div class="main">
    <div :class="{ 'sidebar-margin-for-content': isAuthenticated }">
      <div v-if="isAuthenticated" class="header-action-bar move-smooth">
        <div class="d-flex align-items-center justify-content-end">
          <div class="pe-3">Currently logged in as</div>
          <div class="dropdown d-inline">
            <Button
              class="btn-light-outline"
              :value="user.username"
              :iconBefore="['fas', 'user']"
              :iconAfter="['fas', isProfileBarOpen ? 'chevron-up' : 'chevron-down']"
              @click="onProfileClick"
            >
            </Button>
            <div class="profile-menu" v-if="isProfileBarOpen">
              <Button class="btn-dark-grey profile-menu-button" value="Logout" @click="onLogout" />
            </div>
          </div>
        </div>
      </div>

      <Breadcrumbs v-if="hasBreadcrumbs" :breadcrumbs="breadcrumbs" />
      <div class="content-container move-smooth">
        <div class="d-flex flex-column align-items-center" v-if="isCheckingAuth">
          <LoadingSpinner /><span>Loading...</span>
        </div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button, Breadcrumbs, LoadingSpinner } from "./components/shared";
import { NavBar } from "./components/navigation";
import { storeToRefs } from "pinia";
import { Ref, ref, onBeforeMount, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AuthClient, SettingsClient } from "./api/haulage-system";
import { breadcrumbsConfig } from "./core/constants";
import { RouterNames } from "./core/enums/RouterNames";
import { getAuthenticatedClient } from "./core/functions/HaulageSystemClient";
import { useGlobalStore } from "./stores/globalStore";
import { useHaulageSystemStore } from "./stores/haulageSystemStore";

const store = useHaulageSystemStore();

const router = useRouter();
const globalStore = useGlobalStore();
const { hasBreadcrumbs, breadcrumbs, isAuthenticated, user, isCheckingAuth } = storeToRefs(globalStore);

const isProfileBarOpen: Ref<boolean> = ref(false);

function onProfileClick() {
  isProfileBarOpen.value = !isProfileBarOpen.value;
}

async function onLogout() {
  await getAuthenticatedClient(AuthClient)
    .logout()
    .then(async () => {
      globalStore.setIsAuthenticated(false);
      router.push({ name: RouterNames.Login });
    })
    .catch((ex) => {
      return false;
    });
}

watch(
  () => router.currentRoute.value,
  (val) => {
    globalStore.setBreadcrumbs(breadcrumbsConfig[router.currentRoute.value.name as RouterNames]);
  }
);

onMounted(async () => {
  await globalStore.getInitialAppData();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans&family=PT+Sans&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@300&display=swap");

.sidebar a:hover {
  color: #f1f1f1;
}
#show-sidebar i {
  font-size: 30px !important;
}
.header-wrapper {
  background-color: var(--blue) !important;
}

.profile-menu {
  position: absolute;
  background-color: var(--dark-grey);
  right: 0px;
}
:deep(.profile-menu-button) {
  width: 100% !important;
  text-align: right;
  padding: 10px 15px;
  padding-right: 1rem;
  white-space: nowrap;
}

.header-action-bar {
  background-color: var(--lightest-blue);
  border-bottom: 1px solid var(--grey);
  box-shadow: var(--bs-box-shadow-sm);
  text-align: right;
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  z-index: 1;
}
.content-container {
  margin: 3rem 4rem;
  position: relative;
}
</style>
