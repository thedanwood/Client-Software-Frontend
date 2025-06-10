const config = {
  errorMessages: {
    invalidCredentials: "Invalid credentials. Please try again.",
    unauthorised: "You are unauthorised to access the current resource. Please login to gain access.",
    invalidLoginCredentials: "The credentials you entered do not match an active account. Please try again.",
    generic: "An unknown error occured. Please try again or contact support if the problem persists.",
    noDeliveryLocationSelectedForMaterialSelect: "You must enter a delivery location before getting material prices",
  },
  successMessages: {
    journeyAdded: "Successfully added journey",
    journeyUpdated: "Successfully updated journey",
    priceAdjusted: (quoteNumber: number) => `Succesfully updated pricing for quote #${quoteNumber}`,
    quotesDownloaded: (quoteNumbers: number[]) => `Succesfully downloaded quotes #${quoteNumbers.join(", ")}`,
    quotesArchived: (quoteNumbers: number[]) => `Succesfully archived quotes #${quoteNumbers.join(", ")}`,
    quotesDeleted: (quoteNumbers: number[]) => `Succesfully deleted quotes #${quoteNumbers.join(", ")}`,
    quotesRestored: (quoteNumbers: number[]) => `Succesfully restored quotes #${quoteNumbers.join(", ")}`,
    quoteEmailed: (quoteNumber: number, customerName: string) =>
      `Succesfully emailed quote #${quoteNumber} to "${customerName}"`,
    depotDeleted: (depotName: string) => `Succesfully deleted depot ${depotName}`,
    depotUpdated: (depotName: string) => `Succesfully updated depot ${depotName}`,
    depotAdded: "Succesfully added depot",
    materialPricingDeleted: (materialName: string) => `Succesfully deleted pricing for ${materialName}`,
    materialPricingAdded: (materialName: string) => `Succesfully added pricing for ${materialName}`,
    materialPricingUpdated: (materialName: string) => `Succesfully updated pricing for ${materialName}`,
    materialAdded: "Successfully added material",
    materialDeleted: (materialName: string) => `Succesfully deleted material: ${materialName}`,
    materialUpdated: (materialName: string) => `Succesfully updated material: ${materialName}`,
    customerAdded: (customerName: string) => `Succesfully added customer: ${customerName}`,
    customerUpdated: (customerName: string) => `Succesfully updated customer: ${customerName}`,
    customerDeleted: (customerName: string) => `Succesfully deleted customer: ${customerName}`,
  },
  keys: {
    googleMaps: "",
  },
};

export default config;
