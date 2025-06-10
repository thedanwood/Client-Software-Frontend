<template>
  <ConfirmPopup
    heading="Add New Customer"
    class="popup-sm header-green z-index-1"
    :isOpen="props.isAddCustomerModalOpen"
    @close-modal="onCloseModal()"
  >
    <template v-slot:message>
      <div class="w-50 d-flex m-auto flex-column text-start">
        <Input
          classes="form-control-bold"
          label="Customer Name"
          :value="newCustomer.companyName"
          :disabled="isLoading"
          @input="(val) => (newCustomer.companyName = val)"
        />
        <VuelidateErrors :errors="v$.newCustomer.companyName.$errors" />
        <Input
          class="mt-4"
          classes="form-control-bold"
          label="Email"
          :value="newCustomer.email"
          :disabled="isLoading"
          @input="(val) => (newCustomer.email = val)"
        />
        <VuelidateErrors :errors="v$.newCustomer.email.$errors" />
        <Input
          class="mt-4"
          classes="form-control-bold"
          label="Phone"
          :value="newCustomer.phoneNumber"
          :disabled="isLoading"
          @input="(val) => (newCustomer.phoneNumber = val)"
        />
        <VuelidateErrors :errors="v$.newCustomer.phoneNumber.$errors" />
      </div>
    </template>
    <template v-slot:buttons>
      <Button
        class="btn-green ms-3"
        value="Save"
        :iconBefore="['fas', 'floppy-disk']"
        :disabled="isLoading"
        @click="confirmAddCustomer()"
      />
    </template>
  </ConfirmPopup>
</template>

<script lang="ts" setup>
import { CompanyClient, CreateCompanyCommand } from "../../api/haulage-system";
import { validationRules } from "../../core/constants";
import { VCustomerTableRow } from "../../core/types/customers";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { storeToRefs } from "pinia";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { Ref, ref } from "vue";
import { VuelidateErrors, Input, Button, DatatableTopBar, ConfirmPopup } from "../../components/shared";

const props = defineProps<{
  isAddCustomerModalOpen: boolean;
}>();

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();
const { isLoading } = storeToRefs(store);

const emit = defineEmits(["customer-added", "set-is-modal-open"]);

let newCustomer: Ref<VCustomerTableRow> = ref({} as VCustomerTableRow);

const rules = {
  newCustomer: {
    companyName: validationRules.companyInfo.companyName,
    email: validationRules.companyInfo.email,
    phoneNumber: validationRules.companyInfo.phoneNumber,
  },
} as any;

const v$ = useVuelidate(
  rules,
  { newCustomer: newCustomer },
  {
    $scope: "add-new-customer",
  }
);

function getCreateCompanyCommand() {
  return {
    name: newCustomer.value.companyName,
    email: newCustomer.value.email,
    phone: newCustomer.value.phoneNumber,
  } as CreateCompanyCommand;
}
async function confirmAddCustomer() {
  let isValid = await v$.value.newCustomer.$validate();
  if (isValid) {
    await getAuthenticatedClient(CompanyClient)
      .createCompany(getCreateCompanyCommand())
      .then(async (customerId) => {
        newCustomer.value.companyId = customerId;
        emit("customer-added", newCustomer.value);
        resetNewCustomer();
      })
      .catch((ex) => globalStore.handleBackendError(ex));
  }
}

function onCloseModal() {
  emit("set-is-modal-open", false);
}

function resetNewCustomer() {
  newCustomer.value = {} as VCustomerTableRow;
  v$.value.newCustomer.$reset();
}
</script>

<style scoped></style>
