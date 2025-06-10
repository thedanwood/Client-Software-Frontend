import { createApp } from "vue";
import { createPinia } from "pinia";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/main.scss";
import "@vueform/multiselect/themes/default.css";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  fas,
  faSave,
  faPlus,
  faCoins,
  faChevronDown,
  faChevronUp,
  faPencil,
  faHistory,
  faEye,
  faCheck,
  faTruckLoading,
  faRotateLeft,
  faBars,
  faTag,
  faTriangleExclamation,
  faMagnifyingGlass,
  faTruckRampBox,
  faArrowDown,
  faArrowUp,
  faCircleCheck,
  faCircleArrowLeft,
  faFloppyDisk,
  faPaperPlane,
  faTrashCan,
  faCircleXmark,
  faTruck,
  faSterlingSign,
  faEnvelopesBulk,
  faStopwatch,
  faLeftLong,
  faCircleDown,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  fas,
  faSave,
  faSterlingSign,
  faPlus,
  faCoins,
  faCircleDown,
  faArrowDown,
  faArrowUp,
  faMagnifyingGlass,
  faTag,
  faPaperPlane,
  faEnvelopesBulk,
  faChevronDown,
  faFloppyDisk,
  faChevronUp,
  faPencil,
  faHistory,
  faEye,
  faCheck,
  faTruckLoading,
  faCircleArrowLeft,
  faRotateLeft,
  faBars,
  faTrashCan,
  faTriangleExclamation,
  faTruckRampBox,
  faTruck,
  faStopwatch,
  faLeftLong,
  faCircleXmark,
  faCircleCheck
);

import router from "./router";
import { useHaulageSystemStore } from "./stores/haulageSystemStore";
import config from "./core/constants/config";
import PrimeVue from "primevue/config";
import Material from "@primevue/themes/material";

const app = createApp(App);
app
  .use(createPinia())
  .use(router)
  .use(VueGoogleMaps, {
    load: {
      key: config.keys.googleMaps,
      libraries: "places",
    },
  })
  .use(PrimeVue, {
    theme: {
      preset: Material,
      options: {
        darkModeSelector: ".has-dark-mode",
      },
    },
  })
  .component("FontAwesomeIcon", FontAwesomeIcon)
  .provide("haulageSystemStore", useHaulageSystemStore())
  .mount("#app");
