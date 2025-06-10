import { RouterNames } from "../enums";
import { VBreadcrumbItem } from "../types/shared";

const breadcrumbsConfig: Record<string, VBreadcrumbItem[]> = {
  [RouterNames.AddQuoteSelection]: [
    {
      isActive: true,
      text: "Home",
      isNavigatable: true,
      navigateToRouteName: RouterNames.Home,
    },
    {
      isActive: false,
      text: "Select Quote Type",
      isNavigatable: true,
      navigateToRouteName: RouterNames.AddQuoteSelection,
    },
    {
      isActive: true,
      text: "Create Quote",
      isNavigatable: true,
      isFaded: true,
      navigateToRouteName: RouterNames.DeliveryQuote,
    },
  ],
  [RouterNames.DeliveryQuote]: [
    {
      isActive: true,
      text: "Home",
      isNavigatable: true,
      navigateToRouteName: RouterNames.Home,
    },
    {
      isActive: true,
      text: "Select Quote Type",
      isNavigatable: true,
      navigateToRouteName: RouterNames.AddQuoteSelection,
    },
    {
      isActive: false,
      text: "Create Quote",
      isNavigatable: true,
      navigateToRouteName: RouterNames.DeliveryQuote,
    },
  ],
  [RouterNames.SupplyDeliveryQuote]: [
    {
      isActive: true,
      text: "Home",
      isNavigatable: true,
      navigateToRouteName: RouterNames.Home,
    },
    {
      isActive: true,
      text: "Select Quote Type",
      isNavigatable: true,
      navigateToRouteName: RouterNames.AddQuoteSelection,
    },
    {
      isActive: false,
      text: "Create Quote",
      isNavigatable: true,
      navigateToRouteName: RouterNames.DeliveryQuote,
    },
  ],
  [RouterNames.EditDepots]: [
    { isActive: false, text: "Edit Depots", isNavigatable: false },
    {
      isActive: true,
      text: "Edit Pricing",
      isNavigatable: true,
      isFaded: true,
      navigateToRouteName: RouterNames.EditDepotPricing,
    },
  ],
  [RouterNames.EditDepotPricing]: [
    {
      isActive: true,
      text: "Edit Depots",
      isNavigatable: true,
      navigateToRouteName: RouterNames.EditDepots,
    },
    {
      isActive: false,
      text: "Edit Pricing",
      isNavigatable: false,
      navigateToRouteName: RouterNames.EditDepotPricing,
    },
  ],
};

export default breadcrumbsConfig;
