<template>
  <div>
    <h1 class="page-title">Edit Customers</h1>
    <br />
    <DatatableTopBar
      :show-alert-box="showAlertBox"
      :alert-box-text="alertBoxText"
      alert-box-class="alert-success"
      search-placeholder="Search customers"
      @filter="(val) => filterTable(val)"
    >
      <template v-slot:middle-content>
        <Button
          class="btn-green mb-2"
          value="Add New Customer"
          :disabled="isLoading"
          :iconBefore="['fas', 'plus']"
          @click="onAddCustomer()"
        />
      </template>
    </DatatableTopBar>

    <ConfirmPopup
      heading="Delete Customers"
      class="popup-sm header-red"
      iconClass="text-dark-red"
      :icon="['fas', 'circle-xmark']"
      :isOpen="isArchiveModalOpen"
      @close-modal="closeArchiveModal()"
    >
      <template v-slot:message>
        <h3>Are you sure you want to delete the customers:</h3>
        <br />
        <h4>
          <strong>
            {{ selectedCustomerNamesString }}
          </strong>
        </h4>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-red ms-3"
          value="Confirm Deletion"
          :iconBefore="['fas', 'trash-can']"
          :disabled="isLoading"
          @click="confirmArchive()"
        />
      </template>
    </ConfirmPopup>

    <AddNewCustomer
      :isAddCustomerModalOpen="isAddCustomerModalOpen"
      @set-is-modal-open="closeAddCustomerModal()"
      @customer-added="(customerId) => onCustomerAdded(customerId)"
    />

    <DataTable
      v-model:selection="checkedTableRows"
      dataKey="id"
      editMode="row"
      stripedRows
      showGridlines
      paginator
      :loading="isLoading"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :value="filteredTableRows"
    >
      <Column style="width: 15%" sortable field="companyName" header="Company Name">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.companyId)">
            <Input
              classes="form-control-bold"
              :value="getCompany(slotProps.data.companyId)?.companyName"
              @input="(val) => setCustomerName(slotProps.data.companyId, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.companyId)).companyName" />
          </div>
          <span v-else>
            {{ slotProps.data.companyName }}
          </span>
        </template>
      </Column>
      <Column style="width: 15%" sortable header="Email Address" field="email">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.companyId)">
            <Input
              classes="form-control-bold"
              :value="getCompany(slotProps.data.companyId)?.email"
              @input="(val) => setCustomerEmail(slotProps.data.companyId, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.companyId)).email" />
          </div>
          <span v-else>
            {{ slotProps.data.email }}
          </span>
        </template>
      </Column>
      <Column style="width: 10%" sortable header="Phone Number" field="phoneNumber">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.companyId)">
            <Input
              classes="form-control-bold"
              :value="getCompany(slotProps.data.companyId)?.phoneNumber"
              @input="(val) => setCustomerPhoneNumber(slotProps.data.companyId, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.companyId)).phoneNumber" />
          </div>
          <span v-else>
            {{ slotProps.data.phoneNumber }}
          </span>
        </template>
      </Column>
      <Column style="width: 20%" sortable header="Actions">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <div
              v-if="isRowInEditMode(slotProps.data.companyId)"
              class="d-flex text-center"
              style="padding-right: 60px"
            >
              <Button
                class="btn-green btn-sm mx-1"
                value="Save Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'floppy-disk']"
                @click="confirmEditCustomer(slotProps.data.companyId)"
              />
              <Button
                class="btn-dark btn-sm mx-1"
                value="Cancel Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'xmark']"
                @click="onCancelEditCustomer(slotProps.data.companyId)"
              />
            </div>

            <Button
              v-else
              class="btn-blue btn-sm d-inline mx-1"
              value="Edit Customer"
              :iconOnTop="true"
              :iconBefore="['fas', 'pencil']"
              :disabled="isLoading"
              @click="onEditCustomer(slotProps.data.companyId)"
            />
            <Button
              class="btn-red btn-sm d-inline mx-1"
              value="Delete"
              :iconOnTop="true"
              :iconBefore="['fas', 'trash-can']"
              :disabled="isRowInEditMode(slotProps.data.companyId)"
              @click="onDeleteCustomer(slotProps.data.companyId)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { VuelidateErrors, Input, Button, DatatableTopBar, ConfirmPopup } from "../../components/shared";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {
  CompanyClient,
  CreateCompanyCommand,
  DeleteCompaniesCommand,
  UpdateCompanyCommand,
  CompanyDto,
} from "../../api/haulage-system";
import { validationRules } from "../../core/constants";
import { setModalOpenState, showAlert } from "../../core/functions/sharedFunctions";
import { VCustomerTableRow } from "../../core/types/customers";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import cloneDeep from "lodash.clonedeep";
import { storeToRefs } from "pinia";
import { config } from "../../core/constants";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { Ref, ref, ComputedRef, computed, onBeforeMount } from "vue";
import { AddNewCustomer } from ".";

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();
const { isLoading } = storeToRefs(store);

let searchTerm: Ref<string> = ref("");
let rowsInEditMode: Ref<number[]> = ref([]);
let isAddCustomerModalOpen: Ref<boolean> = ref(false);
let isArchiveModalOpen: Ref<boolean> = ref(false);
let newCustomer: Ref<VCustomerTableRow> = ref({} as VCustomerTableRow);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);

let uneditedFullTableRows: Ref<VCustomerTableRow[]> = ref([]);
let fullTableRows: Ref<VCustomerTableRow[]> = ref([]);
let filteredTableRows: Ref<VCustomerTableRow[]> = ref([]);
let checkedTableRows: Ref<VCustomerTableRow[]> = ref([]);
let selectedCompanyIds: Ref<number[]> = ref([]);

const rules = {
  rows: {
    $each: helpers.forEach({
      companyName: validationRules.companyInfo.companyName,
      email: validationRules.companyInfo.email,
      phoneNumber: validationRules.companyInfo.phoneNumber,
    }),
  },
  newCustomer: {
    companyName: validationRules.companyInfo.companyName,
    email: validationRules.companyInfo.email,
    phoneNumber: validationRules.companyInfo.phoneNumber,
  },
} as any;

const v$ = useVuelidate(rules, {
  rows: fullTableRows,
  newCustomer: newCustomer,
});

let selectedCustomerNamesString: ComputedRef<string> = computed(() =>
  fullTableRows.value
    .filter((x) => selectedCompanyIds.value.includes(x.companyId))
    .map((x) => x.companyName)
    .toString()
);

function isRowInEditMode(id: number) {
  return rowsInEditMode.value.includes(id);
}

function setSelectedCompanyIds(ids: number[]) {
  selectedCompanyIds.value = ids;
}

function closeArchiveModal() {
  setModalOpenState(isArchiveModalOpen, false);
}
function onDeleteCustomer(id: number) {
  setSelectedCompanyIds([id]);
  setModalOpenState(isArchiveModalOpen, true);
}
function onAddCustomer() {
  setModalOpenState(isAddCustomerModalOpen, true);
}
async function onCustomerAdded(newCustomer: VCustomerTableRow) {
  await loadTableData();
  alertBoxText.value = config.successMessages.customerAdded(newCustomer.companyName);
  showAlert(showAlertBox);
  closeAddCustomerModal();
}
function closeAddCustomerModal() {
  setModalOpenState(isAddCustomerModalOpen, false);
}
async function confirmArchive() {
  store.setIsLoading(true);
  await getAuthenticatedClient(CompanyClient)
    .deleteCompanies({
      companyIds: selectedCompanyIds.value,
    } as DeleteCompaniesCommand)
    .then(async () => {
      alertBoxText.value = config.successMessages.customerDeleted(
        getCustomerNameFromCustomerId(selectedCompanyIds.value[0])
      );
      await loadTableData();
      showAlert(showAlertBox);
      setModalOpenState(isArchiveModalOpen, false);
      setSelectedCompanyIds([]);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

async function confirmEditCustomer(id: number): Promise<void> {
  if (!isRowValid(id)) {
    return;
  }

  let current = fullTableRows.value.find((x) => x.companyId == id);
  let original = uneditedFullTableRows.value.find((x) => x.companyId == id);
  original.companyName = current.companyName;
  original.email = current.email;
  original.phoneNumber = current.phoneNumber;

  if (current == original) {
    return;
  }

  store.setIsLoading(true);
  await getAuthenticatedClient(CompanyClient)
    .updateCompany(current.companyId, {
      name: current.companyName,
      email: current.email,
      phone: current.phoneNumber,
    } as UpdateCompanyCommand)
    .then(async () => {
      unEditRow(id);
      alertBoxText.value = config.successMessages.customerUpdated(getCustomerNameFromCustomerId(current.companyId));
      await loadTableData();
      showAlert(showAlertBox);
      setSelectedCompanyIds([]);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function getCustomerNameFromCustomerId(id: number) {
  return fullTableRows.value.find((x) => x.companyId == id)?.companyName;
}

function getRowIndex(id: number) {
  return fullTableRows.value.findIndex((row) => row.companyId === id);
}

function isRowValid(id: number) {
  let nameValidations = getRowValidations(getRowIndex(id)).companyName.flatMap((x) => x.$response);
  let emailValidations = getRowValidations(getRowIndex(id)).email.flatMap((x) => x.$response);
  let phoneValidations = getRowValidations(getRowIndex(id)).email.flatMap((x) => x.$response);
  let totalErrors = nameValidations.length + phoneValidations.length + emailValidations.length;
  return totalErrors == 0;
}

function onCancelEditCustomer(id: number) {
  unEditRow(id);
  resetRow(id);
}

function onEditCustomer(id: number) {
  editRow(id);
}

function editRow(id: number) {
  rowsInEditMode.value.push(id);
}
function unEditRow(id: number) {
  rowsInEditMode.value = rowsInEditMode.value.filter((x) => x !== id);
}

function resetRow(id: number) {
  let current = fullTableRows.value.find((x) => x.companyId == id);
  let original = uneditedFullTableRows.value.find((x) => x.companyId == id);
  current.companyName = original.companyName;
  current.email = original.email;
  current.phoneNumber = original.phoneNumber;
}

function getCompany(id: number) {
  return fullTableRows.value.find((x) => x.companyId == id);
}

function setCustomerName(id: number, name: string) {
  let customer = getCompany(id);
  customer.companyName = name;
}

function setCustomerEmail(id: number, email: string) {
  let customer = getCompany(id);
  customer.email = email;
}

function setCustomerPhoneNumber(id: number, phone: string) {
  let customer = getCompany(id);
  customer.phoneNumber = phone;
}

function filterTable(value) {
  searchTerm.value = value;
  if (value !== null || value !== "") {
    filteredTableRows.value = fullTableRows.value.filter(
      (x) =>
        x.companyName.toLowerCase().includes(value.toLowerCase()) ||
        x.email?.toLowerCase().includes(value.toLowerCase()) ||
        x.phoneNumber?.toLowerCase().includes(value.toLowerCase())
    );
  }
}

function getRowValidations(index: number) {
  return v$.value.rows.$each.$response.$errors[index];
}

function getVCustomerTableRows(companies: CompanyDto[]) {
  return companies.map((x) => {
    return {
      companyId: x.id,
      phoneNumber: x.phone,
      companyName: x.name,
      email: x.email,
    };
  });
}

async function loadTableData() {
  store.setIsLoading(true);
  await getAuthenticatedClient(CompanyClient)
    .searchCompanies(null)
    .then((response) => {
      let formattedResponse = getVCustomerTableRows(response);
      fullTableRows.value = formattedResponse;
      uneditedFullTableRows.value = cloneDeep(formattedResponse);
      filteredTableRows.value = formattedResponse;
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

onBeforeMount(async () => {
  loadTableData();
});
</script>

<style scoped></style>
