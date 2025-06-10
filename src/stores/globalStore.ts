import {
  UserRoles,
  DeliveryUnitDto,
  AuthClient,
  SettingsClient,
  ApplyMaximumCapacitySettingDto,
} from "../api/haulage-system";
import { HttpResponseStatuses, RouterNames } from "../core/enums";
import { VBreadcrumbItem, VDeliveryUnit, VLoggedInUser, VAxiosError } from "../core/types/shared";
import router from "../router";
import { defineStore } from "pinia";
import { config } from "../core/constants";
import { getAuthenticatedClient } from "../core/functions/HaulageSystemClient";
import { VApplyMaximumCapacitySettings } from "../core/types/profile";

export const useGlobalStore = defineStore({
  id: "global",

  state: () => ({
    breadcrumbs: [] as VBreadcrumbItem[],
    orderId: null as number,
    applyMaximumCapacitySettings: [] as VApplyMaximumCapacitySettings[],
    deliveryUnit: null as VDeliveryUnit,
    isAuthenticated: false as boolean,
    isCheckingAuth: false as boolean,
    userRoles: [] as UserRoles[],
    errorMessage: null as string,
    user: null as VLoggedInUser,
  }),

  getters: {
    hasBreadcrumbs: (state: any) => state.breadcrumbs?.length > 0,
    isAdmin: (state: any) => state.userRoles.includes(UserRoles.Admin),
  },

  actions: {
    async getInitialAppData() {
      await this.checkAuth();

      if (this.isAuthenticated) {
        await getAuthenticatedClient(SettingsClient)
          .getInitialData()
          .then((response) => {
            this.setDeliveryUnit(response.deliveryUnit);
            this.setApplyMaximumCapacitySettings(response.applyMaximumCapacitySettings);
          })
          .catch((ex) => this.handleBackendError(ex));
      }
    },
    async checkAuth() {
      this.isCheckingAuth = true;
      await getAuthenticatedClient(AuthClient)
        .checkAuth()
        .then(async (response) => {
          this.setIsAuthenticated(response.isAuthenticated);
          this.setUser({ username: response.username } as VLoggedInUser);
          if (response.roles) {
            this.setUserRoles(response.roles);
          }
        })
        .catch((ex) => {
          this.setIsAuthenticated(false);
        });
      this.isCheckingAuth = false;
    },
    handleBackendError(exception: VAxiosError) {
      debugger;
      switch (exception.status) {
        case HttpResponseStatuses.Unauthorised:
          if (router.currentRoute.value.name == RouterNames.Login) {
            this.setErrorMessage(config.errorMessages.invalidCredentials);
          } else {
            this.setErrorMessage(config.errorMessages.unauthorised);
          }
          router.push({ name: RouterNames.Login });
          break;
        default:
          router.push({ name: RouterNames.FatalError });
      }
    },
    setBreadcrumbs(items: VBreadcrumbItem[]) {
      this.breadcrumbs = items;
    },
    setQuoteId(id: number) {
      this.orderId = id;
    },
    setDeliveryUnit(deliveryUnit: DeliveryUnitDto) {
      this.deliveryUnit = {
        deliveryUnitId: deliveryUnit.deliveryUnitId,
        deliveryUnitName: deliveryUnit.deliveryUnitName,
      } as VDeliveryUnit;
    },
    setApplyMaximumCapacitySettings(settings: ApplyMaximumCapacitySettingDto[]) {
      this.applyMaximumCapacitySettings = settings.map((x) => {
        return {
          materialUnitId: x.materialUnitId,
          applyMaximumCapacityFromVehicleTypes: x.applyMaximumCapacityFromVehicleTypes,
        } as VApplyMaximumCapacitySettings;
      });
    },
    setIsAuthenticated(isAuthenticated: boolean) {
      this.isAuthenticated = isAuthenticated;
    },
    setUserRoles(userRoles: UserRoles[]) {
      this.userRoles = userRoles;
    },
    setErrorMessage(message: string) {
      this.errorMessage = message;
    },
    setUser(user: VLoggedInUser) {
      this.user = user;
    },
  },
});
