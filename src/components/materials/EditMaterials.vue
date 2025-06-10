<template>
  <div>
    <h1 class="page-title">Edit Materials</h1>
    <br />
    <DatatableTopBar
      :show-alert-box="showAlertBox"
      :alert-box-text="alertBoxText"
      alert-box-class="alert-success"
      search-placeholder="Search materials"
      @filter="(val) => filterTable(val)"
    >
      <template v-slot:middle-content>
        <Button
          class="btn-green mb-2"
          value="Add New Material"
          :disabled="isLoading"
          :iconBefore="['fas', 'plus']"
          @click="onAddMaterial()"
        />
      </template>
    </DatatableTopBar>

    <ConfirmPopup
      heading="Delete Materials"
      class="popup-sm header-red"
      iconClass="text-dark-red"
      :icon="['fas', 'circle-xmark']"
      :isOpen="isDeleteModalOpen"
      @close-modal="isDeleteModalOpen = false"
    >
      <template v-slot:message>
        <h3>Are you sure you want to delete the materials:</h3>
        <br />
        <h4>
          <b>{{ selectedMaterialNamesString }}</b>
        </h4>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-red ms-3"
          value="Confirm Deletion"
          :iconBefore="['fas', 'trash-can']"
          :disabled="isLoading"
          @click="confirmArchiveMaterial()"
        />
      </template>
    </ConfirmPopup>

    <ConfirmPopup
      heading="Add New Material"
      class="popup-sm header-green"
      :isOpen="isAddMaterialModalOpen"
      @close-modal="isAddMaterialModalOpen = false"
    >
      <template v-slot:message>
        <div class="w-50 d-flex m-auto flex-column text-start">
          <Input
            classes="form-control-bold"
            label="Material Name"
            placeholder="Material name"
            :disabled="isLoading"
            @input="(val) => (newMaterial = val)"
          />
          <VuelidateErrors class="mb-3" :errors="v$.materialName.$errors" />
          <!-- <NumberPicker
            v-for="(unit, index) in allUniqueMaterialPricingUnits"
            classes="form-control-bold"
            placeholder="Material Name"
            class="mb-4"
            :label="`Price per ${unit.unitName.toLowerCase()}`"
            :disabled="isLoading"
            :value="1"
          /> -->
        </div>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-green ms-3"
          value="Save"
          :iconBefore="['fas', 'floppy-disk']"
          :disabled="isLoading"
          @click="confirmAddMaterial()"
        />
      </template>
    </ConfirmPopup>

    <DataTable
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
      <Column style="width: 20%" sortable field="materialName" header="Material Name">
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.materialId)">
            <Input
              classes="form-control-bold"
              :value="getMaterialNameFromMaterialId(slotProps.data.materialId)"
              @input="(val) => setMaterialName(slotProps.data.materialId, val)"
            />
            <VuelidateErrors :errors="getRowValidations(getRowIndex(slotProps.data.materialId)).materialName" />
          </div>
          <span v-else>
            {{ slotProps.data.materialName }}
          </span>
        </template>
      </Column>
      <Column style="width: 20%" sortable field="Pricing" header="Pricing">
        <template #body="slotProps">
          <div v-if="slotProps.data.singlePrice">
            <FontAwesomeIcon role="button" class="pe-3 icon-bg" :icon="['fas', 'sterling-sign']" />
            Price:
            <h5 class="d-inline">
              {{ formatPrice(slotProps.data.singlePrice) }}
            </h5>
          </div>
          <div v-else-if="slotProps.data.highestPrice && slotProps.data.lowestPrice" class="d-flex">
            <div class="text-dark-green">
              <FontAwesomeIcon role="button" class="pe-3 icon-bg" :icon="['fas', 'arrow-up']" />
              Highest Price:
              <h5 class="d-inline">
                {{ formatPrice(slotProps.data.highestPrice) }}
              </h5>
            </div>
            <div class="ps-4 text-dark-red">
              <FontAwesomeIcon role="button" class="pe-3 icon-bg" :icon="['fas', 'arrow-down']" />
              Lowest Price:
              <h5 class="d-inline">
                {{ formatPrice(slotProps.data.lowestPrice) }}
              </h5>
            </div>
          </div>
          <div v-else>No prices set</div>
        </template>
      </Column>
      <Column style="width: 24%" sortable header="Actions">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <div
              v-if="isRowInEditMode(slotProps.data.materialId)"
              class="d-flex text-center"
              style="padding-right: 60px"
            >
              <Button
                class="btn-green btn-sm mx-1"
                value="Save Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'floppy-disk']"
                @click="confirmEditMaterial(slotProps.data.materialId)"
              />
              <Button
                class="btn-dark btn-sm mx-1"
                value="Cancel Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'xmark']"
                @click="onCancelEditDepot(slotProps.data.materialId)"
              />
            </div>

            <Button
              v-else
              class="btn-blue btn-sm d-inline mx-1"
              value="Edit Material"
              :iconOnTop="true"
              :iconBefore="['fas', 'pencil']"
              :disabled="isLoading"
              @click="onEditMaterial(slotProps.data.materialId)"
            />
            <Button
              class="btn-red btn-sm d-inline mx-1"
              value="Archive"
              :iconOnTop="true"
              :iconBefore="['fas', 'trash-can']"
              :disabled="isRowInEditMode(slotProps.data.materialId) || isLoading"
              @click="onArchiveMaterial(slotProps.data.materialId)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { VuelidateErrors, Input, DatatableTopBar, Button, ConfirmPopup } from "../shared";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {
  MaterialClient,
  CreateMaterialCommand,
  DeleteMaterialsCommand,
  UpdateMaterialCommand,
  MaterialInformationDto,
} from "../../api/haulage-system";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { validationRules } from "../../core/constants";
import { setModalOpenState, showAlert } from "../../core/functions/sharedFunctions";
import { formatPrice } from "../../core/functions/financialFunctions";
import { VMaterialTableRow } from "../../core/types/materials";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import cloneDeep from "lodash.clonedeep";
import { storeToRefs } from "pinia";
import { config } from "../../core/constants";
import { Ref, ref, ComputedRef, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps<{
  materialId: number;
}>();

const globalStore = useGlobalStore();
const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

let searchTerm: Ref<string> = ref("");
let rowsInEditMode: Ref<number[]> = ref([]);
let isAddMaterialModalOpen: Ref<boolean> = ref(false);
let isDeleteModalOpen: Ref<boolean> = ref(false);
let newMaterial: Ref<string> = ref(null);
let fullTableRows: Ref<VMaterialTableRow[]> = ref([]);
let uneditedFullTableRows: Ref<VMaterialTableRow[]> = ref([]);
let filteredTableRows: Ref<VMaterialTableRow[]> = ref([]);
let selectedMaterialIds: Ref<number[]> = ref([]);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);

const rules = {
  rows: {
    $each: helpers.forEach({
      materialName: validationRules.material.materialName,
    }),
  },
  materialName: validationRules.material.materialName,
} as any;

const v$ = useVuelidate(rules, {
  rows: fullTableRows,
  materialName: newMaterial,
});

let selectedMaterialNamesString: ComputedRef<string> = computed(() =>
  fullTableRows.value
    .filter((x) => selectedMaterialIds.value.includes(x.materialId))
    .map((x) => x.materialName)
    .toString()
);

function getRowIndex(id: number) {
  return fullTableRows.value.findIndex((row) => row.materialId === id);
}

function getRowValidations(index: number) {
  return v$.value.rows.$each.$response.$errors[index];
}

function isRowInEditMode(id: number) {
  return rowsInEditMode.value.includes(id);
}

function setSelectedSupplyDeliveryJourneys(ids: number[]) {
  selectedMaterialIds.value = ids;
}

// #region modals
function onAddMaterial() {
  setModalOpenState(isAddMaterialModalOpen, true);
}
function onArchiveMaterial(id: number) {
  setSelectedSupplyDeliveryJourneys([id]);
  setModalOpenState(isDeleteModalOpen, true);
}
async function confirmAddMaterial() {
  let isValid = await v$.value.materialName.$validate();
  if (!isValid) {
    return;
  }

  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialClient)
    .createMaterial({
      materialName: newMaterial.value,
    } as CreateMaterialCommand)
    .then(async (response) => {
      await loadTableData();
      alertBoxText.value = config.successMessages.materialAdded;
      showAlert(showAlertBox);
      setSelectedSupplyDeliveryJourneys([]);
      setModalOpenState(isAddMaterialModalOpen, false);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}
async function confirmArchiveMaterial() {
  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialClient)
    .deleteMaterial({
      materialIds: selectedMaterialIds.value,
    } as DeleteMaterialsCommand)
    .then(async (response) => {
      alertBoxText.value = config.successMessages.materialDeleted(
        getMaterialNameFromMaterialId(selectedMaterialIds.value[0])
      );
      await loadTableData();
      showAlert(showAlertBox);
      setModalOpenState(isDeleteModalOpen, false);
      setSelectedSupplyDeliveryJourneys([]);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}
//#endregion

function isRowValid(id: number) {
  let nameValidations = getRowValidations(getRowIndex(id)).materialName.flatMap((x) => x.$response);
  return nameValidations.length == 0;
}

async function confirmEditMaterial(id: number) {
  if (!isRowValid(id)) {
    return;
  }

  let current = fullTableRows.value.find((x) => x.materialId == id);
  let original = uneditedFullTableRows.value.find((x) => x.materialId == id);
  original.materialName = current.materialName;

  if (current == original) {
    return;
  }

  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialClient)
    .updateMaterial(id, {
      materialName: current.materialName,
    } as UpdateMaterialCommand)
    .then(async () => {
      await loadTableData();
      alertBoxText.value = config.successMessages.materialUpdated(getMaterialNameFromMaterialId(id));
      showAlert(showAlertBox);
      unEditRow(id);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function onCancelEditDepot(id: number) {
  unEditRow(id);
  resetRow(id);
}

function onEditMaterial(id: number) {
  editRow(id);
}

function editRow(id: number) {
  rowsInEditMode.value.push(id);
}
function unEditRow(id: number) {
  rowsInEditMode.value = rowsInEditMode.value.filter((x) => x !== id);
}

function resetRow(id: number) {
  let current = fullTableRows.value.find((x) => x.materialId == id);
  let original = uneditedFullTableRows.value.find((x) => x.materialId == id);
  current.materialName = original.materialName;
}

function getMaterialFromMaterialId(id: number) {
  return fullTableRows.value.find((x) => x.materialId == id);
}

function getMaterialNameFromMaterialId(id: number) {
  return getMaterialFromMaterialId(id)?.materialName;
}

function setMaterialName(id: number, name: string) {
  let depot = getMaterialFromMaterialId(id);
  depot.materialName = name;
}

function filterTable(value) {
  searchTerm.value = value;
  if (value !== null || value !== "") {
    filteredTableRows.value = fullTableRows.value.filter((x) =>
      x.materialName.toString().toLowerCase().includes(value.toLowerCase())
    );
  }
}

async function loadTableData() {
  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialClient)
    .getMaterials()
    .then((response) => {
      let formattedResponse = getVMaterialTableRows(response);
      fullTableRows.value = formattedResponse;
      uneditedFullTableRows.value = cloneDeep(formattedResponse);
      filteredTableRows.value = formattedResponse;
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function getVMaterialTableRows(materials: MaterialInformationDto[]) {
  return materials.map((x) => {
    return {
      materialId: x.materialId,
      materialName: x.materialName,
      lowestPrice: x.lowestPrice,
      highestPrice: x.highestPrice,
      singlePrice: x.singlePrice,
    } as VMaterialTableRow;
  });
}

onMounted(async () => {
  await loadTableData();
});
</script>

<style scoped></style>
