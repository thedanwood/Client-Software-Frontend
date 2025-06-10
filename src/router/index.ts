import { EditDepotPricing, EditDepots } from "../components/depots";
import { AddQuoteSelection, DeliveryQuote, PastQuotes, SavedQuotes, SupplyDeliveryQuote } from "../components/quotes";
import { FatalError, NotFound } from "../components/shared";
import { RouterNames } from "../core/enums/RouterNames";
import { useGlobalStore } from "../stores/globalStore";
import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { EditMaterials } from "../components/materials";
import { EditCustomers } from "../components/customers";
import { Login } from "../components/account";
import { useHaulageSystemStore } from "@/stores/haulageSystemStore";
import { useAdjustQuotePriceStore } from "@/stores/adjustQuotePriceStore";

const accountLoginPath = "/account/login";
const addQuotePath = "/";

const router = createRouter({
  history: createWebHistory(""),
  routes: [
    { path: "/:pathMatch(.*)*", component: NotFound },
    {
      path: "/error",
      name: RouterNames.FatalError,
      component: FatalError,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: addQuotePath,
      alias: "/quote/add-quote",
      name: RouterNames.AddQuoteSelection,
      component: AddQuoteSelection,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/quote/delivery-only/:quoteId?",
      name: RouterNames.DeliveryQuote,
      component: DeliveryQuote,
      props: (route) => ({
        quoteId: route.params.quoteId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/quote/supply-delivery/:quoteId?",
      name: RouterNames.SupplyDeliveryQuote,
      component: SupplyDeliveryQuote,
      props: (route) => ({
        quoteId: route.params.quoteId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/saved-quotes/:quoteId?",
      name: RouterNames.SavedQuotes,
      component: SavedQuotes,
      props: (route) => ({
        quoteId: route.params.quoteId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/past-quotes/:orderId?",
      name: RouterNames.PastQuotes,
      component: PastQuotes,
      props: (route) => ({
        orderId: route.params.orderId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/depots/:depotId?",
      name: RouterNames.EditDepots,
      component: EditDepots,
      props: (route) => ({
        depotId: route.params.depotId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/depot-pricing/:depotId?",
      name: RouterNames.EditDepotPricing,
      component: EditDepotPricing,
      props: (route) => ({
        depotId: route.params.depotId,
        depotName: route.params.depotName,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/materials/:materialId?",
      name: RouterNames.EditMaterials,
      component: EditMaterials,
      props: (route) => ({
        materialId: route.params.materialId,
      }),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/customers",
      name: RouterNames.EditCustomers,
      component: EditCustomers,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: accountLoginPath,
      name: RouterNames.Login,
      component: Login,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const globalStore = useGlobalStore();
  const appStore = useHaulageSystemStore();
  const priceStore = useAdjustQuotePriceStore();
  const { isAuthenticated } = storeToRefs(globalStore);

  await globalStore.checkAuth();
  priceStore.$reset();
  appStore.$reset();

  if (to.name == RouterNames.Login && isAuthenticated.value) {
    next(addQuotePath);
  }

  if (to.meta.requiresAuth) {
    if (isAuthenticated.value) {
      next();
    } else {
      next(accountLoginPath);
    }
  } else {
    next();
  }
});

export default router;
