import { NavButtons, RouterNames } from "../enums";

const navButtonConfig: Record<NavButtons, RouterNames[]> = {
  [NavButtons.AddNewQuote]: [RouterNames.AddQuoteSelection, RouterNames.DeliveryQuote, RouterNames.SupplyDeliveryQuote],
  [NavButtons.SavedQuotes]: [RouterNames.SavedQuotes],
  [NavButtons.PastQuotes]: [RouterNames.PastQuotes],
  [NavButtons.EditDepots]: [RouterNames.EditDepots, RouterNames.EditDepotPricing],
  [NavButtons.EditMaterials]: [RouterNames.EditMaterials],
  [NavButtons.EditCustomers]: [RouterNames.EditCustomers],
};

export default navButtonConfig;
