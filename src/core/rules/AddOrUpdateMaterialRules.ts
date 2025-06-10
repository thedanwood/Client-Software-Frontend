import { helpers, minLength, minValue, required } from "@vuelidate/validators";

function AddOrUpdateSupplyDeliveryJourneyRules(
  isDeliveryLocationSelected: boolean
) {
  return {
    material: {
      isDeliveryLocationSelected: helpers.withMessage(
        "You must enter a delivery location.",
        (): boolean => isDeliveryLocationSelected
      ),
      required,
      $autoDirty: true,
    },
    quantity: {
      minValue: minValue(1),
      required,
      $autoDirty: true,
    },
    materialUnit: {
      required,
      $autoDirty: true,
    },
    depot: {
      minValue: minValue(1),
      required,
      $autoDirty: true,
    },
    vehicleType: {
      required,
      minLength: helpers.withMessage(
        "You must select at least 1 vehicle type",
        minLength(1)
      ),
      $autoDirty: true,
    },
  };
}

export default AddOrUpdateSupplyDeliveryJourneyRules;
