<template>
  <div>
    <h1 class="page-title">Edit Depots</h1>
    <br />
    <DatatableTopBar
      :show-alert-box="showAlertBox"
      :alert-box-text="alertBoxText"
      alert-box-class="alert-success"
      search-placeholder="Search depots"
      @filter="(val) => filterTable(val)"
    >
      <template v-slot:middle-content>
        <Button
          :disabled="isLoading"
          class="btn-green mb-2"
          value="Add New Depot"
          :iconBefore="['fas', 'plus']"
          @click="isAddDepotModalOpen = true"
        />
      </template>
    </DatatableTopBar>

    <ConfirmPopup
      heading="Delete Depots"
      class="popup-sm header-red"
      iconClass="text-dark-red"
      :icon="['fas', 'circle-xmark']"
      :isOpen="isDeleteModalOpen"
      @close-modal="isDeleteModalOpen = false"
    >
      <template v-slot:message>
        <h3>Are you sure you want to delete the depots:</h3>
        <br />
        <h4>
          <strong>
            {{ selectedDepotNamesString }}
          </strong>
        </h4>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-red ms-3"
          value="Confirm Deletion"
          :iconBefore="['fas', 'trash-can']"
          :disabled="isLoading"
          @click="confirmDeleteDepot()"
        />
      </template>
    </ConfirmPopup>

    <ConfirmPopup
      heading="Add New Depot"
      class="popup-sm header-green"
      :isOpen="isAddDepotModalOpen"
      @close-modal="isAddDepotModalOpen = false"
    >
      <template v-slot:message>
        <div class="w-50 d-flex m-auto flex-column text-start">
          <Input
            classes="form-control-bold"
            label="Depot Name"
            placeholder="Depot name"
            :value="newDepot.name"
            :disabled="isLoading"
            @input="(val) => (newDepot.name = val)"
          />
          <VuelidateErrors :errors="v$.newDepot.name.$errors" />
          <div class="mt-4">
            <AddressLookupInput
              label="Address"
              class="form-control-bold"
              :location="newDepot.address"
              :disabled="isLoading"
              @change="(val) => (newDepot.address = val)"
            />
            <VuelidateErrors :errors="v$.newDepot.address.$errors" />
          </div>
        </div>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-green ms-3"
          value="Save"
          :iconBefore="['fas', 'floppy-disk']"
          :disabled="isLoading"
          @click="confirmAddDepot()"
        />
      </template>
    </ConfirmPopup>
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
      <Column style="width: 15%" sortable field="name" header="Name">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.id)">
            <Input
              classes="form-control-bold"
              :value="getDepotNameFromDepotId(slotProps.data.id)"
              @input="(val) => setDepotName(slotProps.data.id, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.id)).name" />
          </div>
          <span v-else>
            {{ slotProps.data.name }}
          </span>
        </template>
      </Column>
      <Column style="width: 15%" sortable header="Address" field="address">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.id)">
            <AddressLookupInput
              class="form-control-bold"
              :location="getDepotAddress(slotProps.data.id)"
              @change="(val) => setDepotAddress(slotProps.data.id, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.id)).address" />
          </div>
          <span v-else>
            {{ slotProps.data.address.fullAddress }}
          </span>
        </template>
      </Column>
      <Column style="width: 10%" sortable header="Number of Materials Supplied" field="numberOfMaterialsSupplied">
      </Column>
      <Column style="width: 20%" sortable header="Actions">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <div v-if="isRowInEditMode(slotProps.data.id)" class="d-flex text-center" style="padding-right: 60px">
              <Button
                class="btn-green btn-sm mx-1"
                value="Save Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'floppy-disk']"
                @click="confirmEditDepot(slotProps.data.id)"
              />
              <Button
                class="btn-dark btn-sm mx-1"
                value="Cancel Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'xmark']"
                @click="onCancelEditDepot(slotProps.data.id)"
              />
            </div>

            <Button
              v-else
              class="btn-blue btn-sm d-inline mx-1"
              value="Edit Depot"
              :iconOnTop="true"
              :iconBefore="['fas', 'pencil']"
              :disabled="isLoading"
              @click="onEditDepot(slotProps.data.id)"
            />
            <Button
              class="btn-turquoise btn-sm d-inline mx-1"
              value="Edit Pricing"
              :iconOnTop="true"
              :iconBefore="['fas', 'tag']"
              :disabled="isRowInEditMode(slotProps.data.id) || isLoading"
              @click="onEditPricing(slotProps.data.id)"
            />
            <Button
              class="btn-red btn-sm d-inline mx-1"
              value="Delete"
              :iconOnTop="true"
              :iconBefore="['fas', 'trash-can']"
              :disabled="isRowInEditMode(slotProps.data.id) || isLoading"
              @click="onArchiveOrder(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import {
  AddressLookupInput,
  Input,
  Button,
  VuelidateErrors,
  DatatableTopBar,
  ConfirmPopup,
} from "../../components/shared";
import {
  DepotClient,
  CreateDepotCommand,
  DeleteDepotsCommand,
  UpdateDepotCommand,
  DepotsInformationDto,
} from "../../api/haulage-system";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { RouterNames } from "../../core/enums/RouterNames";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { setModalOpenState, showAlert } from "../../core/functions/sharedFunctions";
import { toAddressDto } from "../../core/mappers/toBackendMappers";
import { toVAddress } from "../../core/mappers/toFrontendMappers";
import { VDepotTableRow } from "../../core/types/depots";
import { VAddress } from "../../core/types/shared";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import cloneDeep from "lodash.clonedeep";
import { storeToRefs } from "pinia";
import { config } from "../../core/constants";
import { Ref, ref, ComputedRef, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();
const { isLoading } = storeToRefs(store);

const priceStore = useAdjustQuotePriceStore();

let searchTerm: Ref<string> = ref("");
let rowsInEditMode: Ref<number[]> = ref([]);
let isAddDepotModalOpen: Ref<boolean> = ref(false);
let isDeleteModalOpen: Ref<boolean> = ref(false);
let newDepot: Ref<VDepotTableRow> = ref({} as VDepotTableRow);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);
let uneditedFullTableRows: Ref<VDepotTableRow[]> = ref([]);
let fullTableRows: Ref<VDepotTableRow[]> = ref([]);
let filteredTableRows: Ref<VDepotTableRow[]> = ref([]);
let checkedTableRows: Ref<VDepotTableRow[]> = ref([]);
let selectedDepotIds: Ref<number[]> = ref([]);

const rules = {
  rows: {
    $each: helpers.forEach({
      name: {
        required,
      },
      address: {
        required,
      },
    }),
  },
  newDepot: {
    name: {
      required,
    },
    address: {
      required,
    },
  },
} as any;

const v$ = useVuelidate(rules, { rows: fullTableRows, newDepot: newDepot });

let selectedDepotNamesString: ComputedRef<string> = computed(() =>
  fullTableRows.value
    .filter((x) => selectedDepotIds.value.includes(x.id))
    .map((x) => x.name)
    .toString()
);

function isRowInEditMode(id: number) {
  return rowsInEditMode.value.includes(id);
}
// #region modals
function onArchiveOrder(id: number) {
  selectedDepotIds.value = [id];
  setModalOpenState(isDeleteModalOpen, true);
}
async function confirmAddDepot() {
  let isValid = await v$.value.newDepot.$validate();
  if (isValid) {
    store.setIsLoading(true);
    await getAuthenticatedClient(DepotClient)
      .createDepot(toCreateDepotCommand(newDepot.value))
      .then(async () => {
        alertBoxText.value = config.successMessages.depotAdded;
        showAlert(showAlertBox);
        resetNewDepotForm();
        loadTableData();
        setModalOpenState(isAddDepotModalOpen, false);
      })
      .catch((ex) => globalStore.handleBackendError(ex));
    store.setIsLoading(false);
  }
}
function toCreateDepotCommand(depot: VDepotTableRow): CreateDepotCommand {
  return {
    depotName: depot.name,
    address: toAddressDto(depot.address.latitude, depot.address.longitude, depot.address.fullAddress),
    isActive: true,
  } as CreateDepotCommand;
}
async function confirmDeleteDepot() {
  store.setIsLoading(true);
  await getAuthenticatedClient(DepotClient)
    .deleteDepots({ depotIds: selectedDepotIds.value } as DeleteDepotsCommand)
    .then(async () => {
      alertBoxText.value = config.successMessages.depotDeleted(getDepotNameFromDepotId(selectedDepotIds.value[0]));
      showAlert(showAlertBox);
      selectedDepotIds.value = [];
      loadTableData();
      setModalOpenState(isDeleteModalOpen, false);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}
//#endregion

function resetNewDepotForm() {
  newDepot.value = {} as VDepotTableRow;
  v$.value.newDepot.$reset();
}

function getRowIndex(id: number) {
  return fullTableRows.value.findIndex((row) => row.id === id);
}

function onEditPricing(id: number) {
  router.push({
    name: RouterNames.EditDepotPricing,
    params: {
      depotId: id,
    },
  });
}

function isRowValid(id: number) {
  let nameValidations = getRowValidations(getRowIndex(id)).name.flatMap((x) => x.$response);
  let addressValidations = getRowValidations(getRowIndex(id)).address.flatMap((x) => x.$response);
  let totalErrors = nameValidations.length + addressValidations.length;
  return totalErrors == 0;
}

async function confirmEditDepot(id: number): Promise<void> {
  if (!isRowValid(id)) {
    return;
  }

  let current = fullTableRows.value.find((x) => x.id == id);
  let original = uneditedFullTableRows.value.find((x) => x.id == id);
  original.address = current.address;
  original.name = current.name;

  if (current == original) {
    return;
  }

  store.setIsLoading(true);
  await getAuthenticatedClient(DepotClient)
    .updateDepot(current.id, toUpdateDepotCommand(current))
    .then(async (response) => {
      unEditRow(id);
      selectedDepotIds.value = [];
      alertBoxText.value = config.successMessages.depotUpdated(getDepotNameFromDepotId(id));
      loadTableData();
      showAlert(showAlertBox);
      store.setIsLoading(false);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function toUpdateDepotCommand(depot: VDepotTableRow): UpdateDepotCommand {
  return {
    depotId: depot.id,
    depotName: depot.name,
    address: toAddressDto(depot.address.latitude, depot.address.longitude, depot.address.fullAddress),
    isActive: true,
  } as UpdateDepotCommand;
}

function onCancelEditDepot(id: number) {
  unEditRow(id);
  resetRow(id);
}

function onEditDepot(id: number) {
  editRow(id);
}

function editRow(id: number) {
  rowsInEditMode.value.push(id);
}
function unEditRow(id: number) {
  rowsInEditMode.value = rowsInEditMode.value.filter((x) => x !== id);
}

function resetRow(id: number) {
  let current = fullTableRows.value.find((x) => x.id == id);
  let original = uneditedFullTableRows.value.find((x) => x.id == id);
  current.name = original.name;
  current.address = original.address;
}

function getDepotAddress(id: number) {
  let depot = getDepotFromDepotId(id);
  return depot.address;
}

function setDepotAddress(id: number, address: VAddress) {
  let depot = getDepotFromDepotId(id);
  depot.address = address;
}

function getDepotFromDepotId(id: number) {
  return fullTableRows.value.find((x) => x.id == id);
}

function getDepotNameFromDepotId(id: number) {
  return getDepotFromDepotId(id)?.name;
}

function setDepotName(id: number, name: string) {
  let depot = getDepotFromDepotId(id);
  depot.name = name;
}

function filterTable(value) {
  searchTerm.value = value;
  if (value !== null || value !== "") {
    filteredTableRows.value = fullTableRows.value.filter(
      (x) =>
        x.numberOfMaterialsSupplied.toString().toLowerCase().includes(value.toLowerCase()) ||
        x.address.fullAddress.toLowerCase().includes(value.toLowerCase()) ||
        x.name.toLowerCase().includes(value.toLowerCase())
    );
  }
}

function getRowValidations(index: number) {
  return v$.value.rows.$each.$response.$errors[index];
}

async function loadTableData() {
  store.setIsLoading(true);
  await getAuthenticatedClient(DepotClient)
    .getDepots()
    .then(async (response) => {
      let formattedResponse = response.map((x) => toVDepotTableRow(x));
      fullTableRows.value = formattedResponse;
      uneditedFullTableRows.value = cloneDeep(formattedResponse);
      filteredTableRows.value = formattedResponse;
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function toVDepotTableRow(data: DepotsInformationDto): VDepotTableRow {
  return {
    id: data.depotId,
    name: data.depotName,
    address: toVAddress(
      data.depotAddress.addressPoint.latitude,
      data.depotAddress.addressPoint.latitude,
      data.depotAddress.fullAddress
    ),
    numberOfMaterialsSupplied: data.numberOfSuppliedMaterials,
  };
}

onMounted(() => {
  loadTableData();
});
</script>

<style scoped></style>
