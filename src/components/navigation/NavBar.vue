<template>
  <div :class="{ header: true, 'sidebar-margin-for-content': isAuthenticated }" class="move-smooth">
    <div class="header-container">
      <h2 class="mb-0 system-name-text text-white">Haulage Planner</h2>
    </div>
    <div class="header-title-container">
      <img
        src="../../images/rjh-logo.png"
        class="company-logo"
        alt="company-logo"
        role="button"
        @click="$router.push({ name: RouterNames.Home })"
      />
    </div>
  </div>

  <div
    v-if="isAuthenticated"
    :class="{
      sidebar: true,
      'sidebar-open': true,
    }"
  >
    <div class="sidebar-section">
      <div class="sidebar-page-button">
        <p
          id="home-nav-button"
          role="button"
          :class="{
            'nav-btn-active': isNavBarSelected(NavButtons.AddNewQuote),
          }"
          @click="router.push({ name: RouterNames.AddQuoteSelection })"
        >
          Home
        </p>
      </div>
    </div>
    <div class="sidebar-section" v-if="isAdmin">
      <div class="sidebar-page-button">
        <p id="quotes-nav-button">Admin</p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{
            'nav-btn-active': isNavBarSelected(NavButtons.EditCustomers),
          }"
          @click="router.push({ name: RouterNames.EditCustomers })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'user']" />
          Customers
        </p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{
            'nav-btn-active': isNavBarSelected(NavButtons.EditMaterials),
          }"
          @click="router.push({ name: RouterNames.EditMaterials })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'pencil']" />
          Materials
        </p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{ 'nav-btn-active': isNavBarSelected(NavButtons.EditDepots) }"
          @click="router.push({ name: RouterNames.EditDepots })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'truck-loading']" />
          Depots
        </p>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-page-button">
        <p id="quotes-nav-button">Quotes</p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{
            'nav-btn-active': isNavBarSelected(NavButtons.AddNewQuote),
          }"
          @click="router.push({ name: RouterNames.AddQuoteSelection })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'plus']" />
          Add New
        </p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{
            'nav-btn-active': isNavBarSelected(NavButtons.SavedQuotes),
          }"
          @click="router.push({ name: RouterNames.SavedQuotes })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'save']" />
          Saved Quotes
        </p>
      </div>
      <div class="sidebar-subpage-button" role="button">
        <p
          :class="{ 'nav-btn-active': isNavBarSelected(NavButtons.PastQuotes) }"
          @click="router.push({ name: RouterNames.PastQuotes })"
        >
          <FontAwesomeIcon role="button" :icon="['fas', 'history']" />
          Past Quotes
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { isNavigationBarSelected } from "../../core/functions/navigationBarFunctions";
import { NavButtons, RouterNames } from "../../core/enums";
import { useGlobalStore } from "../../stores/globalStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();
const globalStore = useGlobalStore();
const { isAuthenticated, isAdmin } = storeToRefs(globalStore);

function isNavBarSelected(navButton: NavButtons) {
  return isNavigationBarSelected(navButton, router.currentRoute.value.name as RouterNames);
}
</script>

<style lang="scss">
.nav-btn-active {
  color: black !important;
}

.sidebar-open {
  width: 250px !important;
}

.sidebar {
  height: 100%;
  width: 0px;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  background-color: var(--blue);
  color: white;
  overflow-x: hidden;
  padding-top: 60px;
  overflow: hidden;
}

.sidebar-subpage-button {
  padding-left: 15px;
}

.sidebar-subpage-button:hover {
  * {
    color: black !important;
  }
}

.sidebar-section {
  padding-left: 20px;
  padding-right: 15px;
}
.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 20px;
  color: white !important;
}

.close-btn:hover {
  color: black !important;
  text-decoration: none !important;
}
.header {
  display: flex;
  padding: 10px 10px 10px 15px;
  background-color: var(--blue);
  justify-content: space-between;
  align-items: center;
}
.company-logo {
  display: inline;
  height: 30px;
  width: auto;
}
.header-container {
  display: flex;
  align-items: center;
}
.shaded-arch-logo {
  display: inline;
  height: 30px;
  width: auto;
}
.company-name-text * {
  display: inline;
  font-family: "Oswald", sans-serif;
  color: var(--lightest-blue);
  padding-left: 0.4rem;
}

.header-title-container {
  display: flex;
  align-items: center;

  * {
    color: white !important;
  }
}
.collapse-sidebar {
  position: absolute;
  margin-left: 1rem;
  z-index: 2;
  font-size: 30px;
  color: var(--dark-grey);
  :hover {
    color: black;
  }
}

.system-name-text {
  display: inline;
  font-family: "Oswald", sans-serif;
}
.error-message-container {
  text-align: left;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--dark-red);
}
</style>
