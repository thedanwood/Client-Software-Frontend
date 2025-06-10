<template>
  <AddNewCustomer
    :isAddCustomerModalOpen="isAddCustomerModalOpen"
    @set-is-modal-open="closeAddCustomerModal()"
    @customer-added="(customer) => onCustomerAdded(customer)"
  />

  <div class="my-3">
    <div class="row">
      <div class="col">
        <Select
          placeholder="Enter a company name"
          name="company-select"
          :isDynamicLoading="true"
          :disabled="isLoading"
          :value="selectedCompanyId"
          :options="companyOptions"
          @change="setCompanyInfo"
          @input="onCompanySearchTermChange"
        >
          <template v-slot:between-label-and-input>
            <div class="d-flex justify-content-between">
              <label>Customer *</label>
              <Button
                class="btn-light-green btn-sm mb-2 float-end"
                value="Add New"
                @click="isAddCustomerModalOpen = true"
              />
            </div>
          </template>
        </Select>
        <VuelidateErrors :errors="v$.company.$errors" />
      </div>
      <div class="col">
        <Input
          label="Customer Name"
          :disabled="isLoading"
          :value="customerName"
          placeholder="Enter a customer name"
          @input="(customerName) => store.setCustomerName(customerName)"
        />
      </div>
    </div>

    <div class="my-3">
      <slot name="middle"></slot>
    </div>

    <DatePicker
      class="mt-3"
      label="Delivery Date"
      :value="deliveryDate"
      :disabled="isLoading"
      @change="(date) => store.setDeliveryDate(date)"
    />
    <Input
      class="mt-3"
      label="Comments"
      placeholder="Enter any comments"
      :disabled="isLoading"
      :value="comments"
      @input="(comments) => store.setComments(comments)"
    />
  </div>
</template>

<script lang="ts" setup>
import { VuelidateErrors, DatePicker, Select, Input, Button } from "../../components/shared";
import { CompanyClient } from "../../api/haulage-system";
import { toVSelectOptionItem } from "../../core/mappers/toFrontendMappers";
import { VSelectOptionItem } from "../../core/types/shared";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import debounce from "lodash.debounce";
import { storeToRefs } from "pinia";
import { ComputedRef, Ref, computed, ref } from "vue";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { setModalOpenState } from "../../core/functions/sharedFunctions";
import { VCustomerTableRow } from "@/core/types/customers";
import { AddNewCustomer } from "../customers";

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();

const { companies, companyId, customerName, deliveryLocation, deliveryDate, comments, isLoading } = storeToRefs(store);

let customerSearchTerm: string = "";

let isAddCustomerModalOpen: Ref<boolean> = ref(false);

const selectedCompanyId: ComputedRef<number> = computed(() => {
  return companyId.value ?? 0;
});
const companyOptions: ComputedRef<VSelectOptionItem[]> = computed(() => {
  return companies.value.map((x) => toVSelectOptionItem(x.id, x.name));
});

const rules = {
  company: {
    required,
    minValue: helpers.withMessage("You must select a company", minValue(1)),
    $autoDirty: true,
  },
} as any;

const v$ = useVuelidate(
  rules,
  {
    deliveryLocation: deliveryLocation,
    company: selectedCompanyId,
  },
  {
    $scope: "add-new-quote",
  }
);

const getCompanies = debounce(() => {
  getAuthenticatedClient(CompanyClient)
    .searchCompanies(customerSearchTerm)
    .then((results) => {
      store.setCompanies(results);
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
      store.setCompanies([]);
    });
}, 500);

function onCompanySearchTermChange(searchTerm: string) {
  if (!searchTerm) return;
  store.setIsLoading(true);
  customerSearchTerm = searchTerm;
  getCompanies();
  store.setIsLoading(false);
}

function closeAddCustomerModal() {
  setModalOpenState(isAddCustomerModalOpen, false);
}

async function onCustomerAdded(company: VCustomerTableRow) {
  onCompanySearchTermChange(company.companyName);
  debugger;
  setCompanyInfo(company.companyId);
  closeAddCustomerModal();
}

function setCompanyInfo(companyId: number) {
  store.setCompanyId(companyId);
}
</script>

<style scoped>
.form-item {
  position: block;
}
</style>
