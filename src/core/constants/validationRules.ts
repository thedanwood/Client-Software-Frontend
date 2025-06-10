import { helpers, required, numeric, decimal, minLength, email } from "@vuelidate/validators";
import { Ref } from "vue";
import { VDepotMaterialPricingTableRow } from "../types/depots";

const validationRules = {
  material: {
    list: {
      required: helpers.withMessage("You must add at least one material", required),
    },
    materialName: { required, minLength: minLength(2) },
    materialId: (hasPricingAlready: Ref<boolean>, newPricing?: Ref<VDepotMaterialPricingTableRow>) => {
      return {
        hasId: helpers.withMessage("You must select a material", () => newPricing.value.materialId !== null),
        //keep hasPricingCheck same name as string in EditDepotPricing.showExistingMaterialActions
        hasPricingCheck: helpers.withMessage("Pricing for this material already exists", () => {
          return !hasPricingAlready.value;
        }),
      };
    },
    addNewPrice: (prices: Ref<number[]>) =>
      helpers.withMessage("You must input at least one price", () => {
        return prices.value.length > 0;
      }),
    price: { numeric, decimal },
  },
  list: {
    required: helpers.withMessage("You must add at least one material", required),
  },
  companyInfo: {
    companyName: { required, minLength: minLength(2) },
    email: { email },
    phoneNumber: {
      minLength: helpers.withMessage("You must enter a valid phone number", minLength(8)),
    },
  },
  adjustPrice: {
    reason: { required, minLength: minLength(3) },
    price: { required },
  },
  deliveryInfO: {
    deliveryLocation: { required },
  },
};

export default validationRules;
