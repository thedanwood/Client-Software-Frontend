import { defineStore } from "pinia";
import {
  VAdjustDeliveryQuotePrice,
  VAdjustMaterialQuotePrice,
  VAdjustQuotePrice,
  VAdjustQuotePriceRecalcMetrics,
  VValidationStateAndId,
} from "../core/types/pricing";
import { fieldNames } from "../core/constants";
import { Validation } from "@vuelidate/core";
import { RecordTypes } from "../api/haulage-system/index";

export const useAdjustQuotePriceStore = defineStore({
  id: "adjustPrice",

  state: () => ({
    trackingHistory: [],
    pricings: [] as VAdjustQuotePrice[],
    recalculationMetrics: [] as VAdjustQuotePriceRecalcMetrics[],
    validationStates: [] as VValidationStateAndId[],
  }),

  getters: {
    getRecalcMetrics: (state: any) => (id) => {
      return state.recalculationMetrics.find((x) => x.id == id);
    },
    getValidationState: (state: any) => (id) => {
      return state.validationStates?.find((x) => x.id == id)?.validation;
    },
    getPricings: (state: any): VAdjustQuotePrice[] => {
      return state.pricings;
    },
    getPricing:
      (state: any) =>
      (id): VAdjustQuotePrice => {
        return state.pricings?.find((x) => x.id === id);
      },
    getDeliveryPricing:
      (state: any) =>
      (id): VAdjustDeliveryQuotePrice => {
        return state.pricings?.find((x) => x.id === id).deliveryPricing;
      },
    getMaterialPricing:
      (state: any) =>
      (id): VAdjustMaterialQuotePrice => {
        return state.pricings?.find((x) => x.id === id).materialPricing;
      },
    getMostRecentlyChangedField: (state: any) => (itemsToLookFor: string[]) => {
      for (let i = state.trackingHistory.length - 1; i >= 0; i--) {
        if (itemsToLookFor.includes(state.trackingHistory[i])) {
          return state.trackingHistory[i];
        }
      }
      return null;
    },
    getTotalQuotesPrice: (state: any): number => {
      return state.pricings.reduce((sum, current) => {
        let totalSum = sum + state.getTotalDeliveryPrice(current?.id);
        if (current.quoteType == RecordTypes.SupplyAndDelivery) {
          totalSum += state.getTotalMaterialPrice(current?.id);
        }
        return totalSum;
      }, 0);
    },
    getDeliveryPricePerTimeUnit: (state: any) => (id) => {
      let metrics = state.getRecalcMetrics(id);
      let pricing = state.pricings.find((x) => x.id === id).deliveryPricing;
      switch (
        state.getMostRecentlyChangedField([
          fieldNames.priceStore.deliveryPricePerTimeUnit,
          fieldNames.priceStore.totalDeliveryPrice,
          fieldNames.priceStore.quantity,
          fieldNames.priceStore.onewayJourneyTime,
        ])
      ) {
        case fieldNames.priceStore.deliveryPricePerTimeUnit:
        case fieldNames.priceStore.quantity:
        case fieldNames.priceStore.onewayJourneyTime:
        default:
          return pricing.deliveryPricePerTimeUnit;
        case fieldNames.priceStore.totalDeliveryPrice:
          return pricing.totalDeliveryPrice / metrics.onewayJourneyTime / metrics.numberOfLoads;
      }
    },
    getTotalDeliveryPrice: (state: any) => (id) => {
      let pricing = state.pricings.find((x) => x.id === id).deliveryPricing;
      let metrics = state.getRecalcMetrics(id);
      debugger;
      switch (
        state.getMostRecentlyChangedField([
          fieldNames.priceStore.totalDeliveryPrice,
          fieldNames.priceStore.onewayJourneyTime,
          fieldNames.priceStore.deliveryPricePerTimeUnit,
          fieldNames.priceStore.quantity,
          fieldNames.priceStore.numberOfLoads,
        ])
      ) {
        case fieldNames.priceStore.totalDeliveryPrice:
        default:
          return pricing.totalDeliveryPrice;
        case fieldNames.priceStore.onewayJourneyTime:
        case fieldNames.priceStore.quantity:
        case fieldNames.priceStore.deliveryPricePerTimeUnit:
        case fieldNames.priceStore.numberOfLoads:
          return pricing.deliveryPricePerTimeUnit * metrics.onewayJourneyTime * metrics.numberOfLoads;
      }
    },
    getTotalMaterialAndDeliveryPrice:
      (state: any) =>
      (id: number): number => {
        let totalMaterialPrice = state.getTotalMaterialPrice(id);
        let totalDeliveryPrice = state.getTotalDeliveryPrice(id);
        return totalMaterialPrice + totalDeliveryPrice;
      },
    getMaterialPricePerQuantityUnit: (state: any) => (id: number) => {
      let materialPricing = state.pricings.find((x) => x.id === id).materialPricing;
      let metrics = state.getRecalcMetrics(id);

      let fieldArray = [
        fieldNames.priceStore.materialAndDeliveryPricePerQuantity,
        fieldNames.priceStore.totalMaterialPrice,
        fieldNames.priceStore.materialAndDeliveryPricePerQuantity,
      ];
      switch (state.getMostRecentlyChangedField(fieldArray)) {
        case fieldNames.priceStore.totalMaterialPrice:
        case fieldNames.priceStore.materialAndDeliveryPricePerQuantity:
          return state.getTotalMaterialPrice(id, metrics.quantity) / metrics.quantity;
        case fieldNames.priceStore.materialPricePerQuantityUnit:
        default:
          return materialPricing.materialPricePerQuantityUnit;
      }
    },
    getTotalMaterialPrice: (state: any) => (id: number) => {
      let pricing = state.pricings.find((x) => x.id === id);
      let metrics = state.getRecalcMetrics(id);

      switch (
        state.getMostRecentlyChangedField([
          fieldNames.priceStore.materialAndDeliveryPricePerQuantity,
          fieldNames.priceStore.materialPricePerQuantityUnit,
          fieldNames.priceStore.totalMaterialPrice,
        ])
      ) {
        case fieldNames.priceStore.materialPricePerQuantityUnit:
          return pricing.materialPricing.materialPricePerQuantityUnit * metrics.quantity * metrics.numberOfLoads;
        case fieldNames.priceStore.materialAndDeliveryPricePerQuantity:
          let totalMaterialAndDeliveryPrice =
            pricing.materialAndDeliveryPricePerQuantityUnit * metrics.quantity * metrics.numberOfLoads;
          let newTotalMaterialPrice = totalMaterialAndDeliveryPrice - pricing.deliveryPricing.totalDeliveryPrice;
          return newTotalMaterialPrice;
        default:
          return pricing.materialPricing.totalMaterialPrice;
      }
    },
    getMaterialAndDeliveryPricePerQuantityUnit: (state: any) => (id: number) => {
      let pricing = state.pricings.find((x) => x.id === id);
      let metrics = state.getRecalcMetrics(id);

      switch (
        state.getMostRecentlyChangedField([
          fieldNames.priceStore.materialAndDeliveryPricePerQuantity,
          fieldNames.priceStore.deliveryPricePerTimeUnit,
          fieldNames.priceStore.totalDeliveryPrice,
          fieldNames.priceStore.materialPricePerQuantityUnit,
          fieldNames.priceStore.totalMaterialPrice,
          fieldNames.priceStore.onewayJourneyTime,
        ])
      ) {
        case fieldNames.priceStore.materialAndDeliveryPricePerQuantity:
          return pricing.materialAndDeliveryPricePerQuantityUnit;
        case fieldNames.priceStore.materialPricePerQuantityUnit:
        default:
          let totalMaterialPricing = pricing.materialPricing.materialPricePerQuantityUnit * metrics.quantity;
          return (pricing.deliveryPricing.totalDeliveryPrice + totalMaterialPricing) / metrics.quantity;
        case fieldNames.priceStore.deliveryPricePerTimeUnit:
          let totalDeliveryPricing = pricing.deliveryPricing.deliveryPricePerTimeUnit * metrics.onewayJourneyTime;
          return (pricing.materialPricing.totalMaterialPrice + totalDeliveryPricing) / metrics.quantity;
        case fieldNames.priceStore.totalMaterialPrice:
        case fieldNames.priceStore.onewayJourneyTime:
        case fieldNames.priceStore.totalDeliveryPrice:
          let totalMaterialAndDeliveryPricing =
            pricing.materialPricing.totalMaterialPrice + pricing.deliveryPricing.totalDeliveryPrice;
          return totalMaterialAndDeliveryPricing / metrics.quantity;
      }
    },
    getDefaultMaterialAndDeliveryPricePerQuantityUnit: (state: any) => (id: number) => {
      let pricing = state.pricings.find((x) => x.id === id);
      let metrics = state.getRecalcMetrics(id);

      return (
        pricing.deliveryPricing.defaultTotalDeliveryPrice / metrics.quantity +
        pricing.materialPricing.defaultMaterialPricePerQuantityUnit
      );
    },
  },

  actions: {
    setRecalculationMetrics(newMetrics: VAdjustQuotePriceRecalcMetrics) {
      const index = this.recalculationMetrics.findIndex((x) => x.id === newMetrics.id);
      if (index !== -1) {
        this.setRecalculationMetricsTrackingHistories(newMetrics.id, this.recalculationMetrics[index], newMetrics);
        this.recalculationMetrics[index] = newMetrics;
      } else {
        this.recalculationMetrics.push(newMetrics);
      }
    },
    setRecalculationMetricsTrackingHistories(
      id: number,
      oldMetrics: VAdjustQuotePriceRecalcMetrics,
      newMetrics: VAdjustQuotePriceRecalcMetrics
    ) {
      if (newMetrics.numberOfLoads != null && oldMetrics.numberOfLoads !== newMetrics.numberOfLoads) {
        this.setTrackingHistoryItem(fieldNames.priceStore.numberOfLoads, id);
      }
      if (newMetrics.quantity != null && oldMetrics.quantity !== newMetrics.quantity) {
        this.setTrackingHistoryItem(fieldNames.priceStore.quantity, id);
      }
      if (newMetrics.onewayJourneyTime != null && oldMetrics.onewayJourneyTime !== newMetrics.onewayJourneyTime) {
        this.setTrackingHistoryItem(fieldNames.priceStore.onewayJourneyTime, id);
      }
    },
    setValidationStates(pricingId: number, newValidationState: Validation) {
      let oldState = this.validationStates?.find((x) => x.id == pricingId);
      let validationObject = {
        id: pricingId,
        validation: newValidationState,
      } as VValidationStateAndId;
      if (oldState) {
        oldState = newValidationState;
      } else {
        this.validationStates.push(validationObject);
      }
    },
    setTrackingHistoryItem(field: string, id: number) {
      this.trackingHistory.push(field);
      this.setChangeEffects(id);
    },
    setChangeEffects(id: number) {
      let pricing = this.getPricing(id);
      let metrics = this.getRecalcMetrics(id);
      let liveTotalDeliveryPrice = this.getTotalDeliveryPrice(id);
      let liveDeliveryPricePerTimeUnit = this.getDeliveryPricePerTimeUnit(id);

      debugger;
      if (pricing.deliveryPricing.totalDeliveryPrice !== liveTotalDeliveryPrice) {
        this.setTotalDeliveryPrice(liveTotalDeliveryPrice, id, false);
      }
      if (pricing.deliveryPricing.deliveryPricePerTimeUnit !== liveDeliveryPricePerTimeUnit) {
        this.setDeliveryPricePerTimeUnit(liveDeliveryPricePerTimeUnit, id, false);
      }

      if (metrics.quoteType == RecordTypes.SupplyAndDelivery) {
        let liveMaterialAnDeliveryPricePerQuantityUnit = this.getMaterialAndDeliveryPricePerQuantityUnit(id);
        let liveTotalMaterialPrice = this.getTotalMaterialPrice(id);
        let liveMaterialpricePerQuantityUnit = this.getMaterialPricePerQuantityUnit(id);

        if (pricing.materialAndDeliveryPricePerQuantityUnit !== liveMaterialAnDeliveryPricePerQuantityUnit) {
          this.setMaterialAndDeliveryPricePerQuantityUnit(liveMaterialAnDeliveryPricePerQuantityUnit, id, false);
        }
        if (pricing.totalMaterialPrice !== liveTotalMaterialPrice) {
          this.setTotalMaterialPrice(liveTotalMaterialPrice, id, false);
        }
        if (pricing.materialPricePerQuantityUnit !== liveMaterialpricePerQuantityUnit) {
          this.setMaterialPricePerQuantityUnit(liveMaterialpricePerQuantityUnit, id, false);
        }
      }
    },
    removePricing(id: number) {
      this.pricings = this.pricings.filter((x) => x.id !== id);
    },
    resetPricing() {
      this.pricings = [];
      this.recalculationMetrics = [];
    },
    setPricings(pricing: VAdjustQuotePrice[]) {
      this.pricings = pricing;
    },
    setPricing(pricing: VAdjustQuotePrice) {
      let priceExists = this.pricings.some((x) => x.id === pricing.id);
      if (priceExists) {
        this.pricings = this.pricings.filter((x) => x.deliveryMovementId !== pricing.deliveryMovementId);
        this.pricings.push(pricing);
      } else {
        this.pricings.push(pricing);
      }
    },
    setDeliveryPricePerTimeUnit(price: number, id: number, setTracking: boolean = true) {
      this.pricings.find((x) => x.id === id).deliveryPricing.deliveryPricePerTimeUnit = price;

      if (setTracking) {
        this.setTrackingHistoryItem(fieldNames.priceStore.deliveryPricePerTimeUnit, id);
      }
    },
    setTotalDeliveryPrice(price: number, id: number, setTracking: boolean = true) {
      this.pricings.find((x) => x.id === id).deliveryPricing.totalDeliveryPrice = price;
      if (setTracking) {
        this.setTrackingHistoryItem(fieldNames.priceStore.totalDeliveryPrice, id);
      }
    },
    setMaterialAndDeliveryPricePerQuantityUnit(price: number, id: number, setTracking: boolean = true) {
      this.pricings.find((x) => x.id === id).materialAndDeliveryPricePerQuantityUnit = price;
      if (setTracking) {
        this.setTrackingHistoryItem(fieldNames.priceStore.materialAndDeliveryPricePerQuantity, id);
      }
    },
    setTotalMaterialPrice(price: number, id: number, setTracking: boolean = true) {
      this.pricings.find((x) => x.id === id).materialPricing.totalMaterialPrice = price;
      if (setTracking) {
        this.setTrackingHistoryItem(fieldNames.priceStore.totalMaterialPrice, id);
      }
    },
    setMaterialPricePerQuantityUnit(price: number, id: number, setTracking: boolean = true) {
      this.pricings.find((x) => x.id === id).materialPricing.materialPricePerQuantityUnit = price;
      if (setTracking) {
        this.setTrackingHistoryItem(fieldNames.priceStore.materialPricePerQuantityUnit, id);
      }
    },
  },
});
