<template>
  <div>
    <h1 class="page-title">
      Edit Depot Pricing for
      <span class="text-turquoise">{{ depotName }}</span>
    </h1>
    <br />
    <DatatableTopBar
      alert-box-class="alert-success"
      search-placeholder="Search material pricings"
      :show-alert-box="showAlertBox"
      :alert-box-text="alertBoxText"
      @filter="(val) => filterTable(val)"
    >
      <template v-slot:middle-content>
        <Button
          class="btn-green mb-2"
          value="Add New Price"
          :iconBefore="['fas', 'plus']"
          :disabled="isLoading"
          @click="onAddPricing()"
        />
      </template>
    </DatatableTopBar>

    <!-- #region popups -->
    <ConfirmPopup
      heading="Delete Depots"
      class="popup-sm header-red"
      iconClass="text-dark-red"
      :icon="['fas', 'circle-xmark']"
      :isOpen="isDeleteModalOpen"
      @close-modal="isDeleteModalOpen = false"
    >
      <template v-slot:message>
        <h3>
          Are you sure you want to delete the pricing from
          <b>{{ depotName }}</b> for materials:
        </h3>
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
          @click="confirmArchivePricing()"
        />
      </template>
    </ConfirmPopup>

    <ConfirmPopup
      heading="Add New Material Pricing"
      class="popup-sm header-green"
      :isOpen="isAddDepotPricingModalOpen"
      @close-modal="isAddDepotPricingModalOpen = false"
    >
      <template v-slot:message>
        <div class="w-50 d-flex m-auto flex-column text-start">
          <Select
            label="Material *"
            placeholder="Select a material"
            :disabled="isLoading"
            :isSearchable="true"
            :options="materialOptions"
            :value="newPricing.materialId"
            @change="(newVal) => onMaterialUpdate(newVal)"
          />
          <VuelidateErrors :errors="v$.newPricing.materialId.$errors">
            <template v-slot:above-message-content v-if="showExistingMaterialActions">
              <Button
                class="btn-orange p-1 my-3"
                :value="`Edit '${newPricing.materialName}' Prices`"
                :iconBefore="['fas', 'pencil']"
                @click="onEditMaterialPrices()"
              />
            </template>
          </VuelidateErrors>
          <data class="my-3" v-for="(unit, index) in allUniqueMaterialPricingUnits">
            <NumberPicker
              classes="form-control-bold"
              :is-price="true"
              :disabled="isLoading"
              :label="`Price per ${unit.unitName.toLowerCase()}`"
              :value="getNewMaterialPrice(index)"
              @change="(val) => setNewMaterialPrice(unit, val)"
            />
            <VuelidateErrors :errors="getNewPriceValidations(index)" />
          </data>
        </div>
      </template>
      <template v-slot:buttons>
        <Button class="btn-green ms-3" value="Save" :iconBefore="['fas', 'floppy-disk']" @click="confirmAddPricing()" />
      </template>
    </ConfirmPopup>
    <!-- #endregion -->

    <DataTable
      dataKey="id"
      editMode="row"
      stripedRows
      showGridlines
      paginator
      :loading="isLoading"
      :rows="10"
      :rowClass="(data) => getRowClass(data.id)"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :value="filteredTableRows"
    >
      <Column style="width: 20%" sortable field="materialName" header="Material Name">
        <template #body="slotProps">
          <TextLink
            :text="slotProps.data.materialName"
            @click="onMaterialNameClick(slotProps.data.materialId)"
          ></TextLink>
        </template>
      </Column>
      <Column
        v-for="(unit, index) in allUniqueMaterialPricingUnits"
        :key="index"
        style="width: 15%"
        sortable
        :header="`Price per ${unit.unitName.toLowerCase()}`"
        field="address"
      >
        <template #body="slotProps">
          <div v-if="isRowInEditMode(slotProps.data.id)">
            <NumberPicker
              class="form-control-bold"
              :value="getMaterialPriceOfUnit(slotProps.data.id, unit.unitId)"
              @change="
                (val: number) =>
                  setMaterialPriceOfUnit(
                    slotProps.data.materialId,
                    unit.unitId,
                    val
                  )
              "
            />
            <VuelidateErrors :errors="getPriceValidations(getRowIndex(slotProps.data.id), index)" />
          </div>
          <span v-else :class="getPriceForDisplayClass(slotProps.data.id, unit.unitId)">
            {{ getPriceForDisplay(slotProps.data.id, unit.unitId) }}
          </span>
        </template>
      </Column>
      <Column style="width: 24%" sortable header="Actions">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <div v-if="isRowInEditMode(slotProps.data.id)" class="d-flex text-center" style="padding-right: 60px">
              <Button
                class="btn-green btn-sm mx-1"
                value="Save Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'floppy-disk']"
                @click="confirmEditPricing(slotProps.data.id)"
              />
              <Button
                class="btn-dark btn-sm mx-1"
                value="Cancel Edit"
                :iconOnTop="true"
                :iconBefore="['fas', 'xmark']"
                @click="onCancelEditPricing(slotProps.data.id)"
              />
            </div>

            <Button
              v-else
              class="btn-blue btn-sm d-inline mx-1"
              value="Edit Pricing"
              :iconOnTop="true"
              :iconBefore="['fas', 'tag']"
              :disabled="isLoading"
              @click="onEditPricing(slotProps.data.id)"
            />

            <Button
              class="btn-red btn-sm d-inline mx-1"
              value="Archive"
              :iconOnTop="true"
              :iconBefore="['fas', 'trash-can']"
              :disabled="isRowInEditMode(slotProps.data.id) || isLoading"
              @click="onArchivePricing(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import {
  NumberPicker,
  VuelidateErrors,
  DatatableTopBar,
  Button,
  ConfirmPopup,
  TextLink,
  Select,
} from "../../components/shared";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {
  UpdateMaterialPricingCommand,
  UpdateMaterialPricingItemCommand,
  MaterialPricingClient,
  DeleteMaterialPricingCommand,
  CreateMaterialPricingsCommand,
  CreateMaterialPricingPriceCommand,
  DepotMaterialPricingsDto,
  DepotMaterialPricingDto,
  MaterialUnitDto,
  MaterialDto,
} from "../../api/haulage-system";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { validationRules } from "../../core/constants";
import { RouterNames } from "../../core/enums/RouterNames";
import { setModalOpenState, showAlert, sortAscendingAlphabetical } from "../../core/functions/sharedFunctions";
import { formatPrice } from "../../core/functions/financialFunctions";
import { toVSelectOptionItem } from "../../core/mappers/toFrontendMappers";
import { VDepotMaterialPricingTableRow, VMaterialPriceItem } from "../../core/types/depots";
import { VMaterialUnit } from "../../core/types/materials";
import { VSelectOptionItem } from "../../core/types/shared";
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
  depotId: number;
}>();

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();
const { isLoading, materials } = storeToRefs(store);

const priceNotSetValue = "Not set";

let searchTerm: Ref<string> = ref("");
let rowsInEditMode: Ref<number[]> = ref([]);
let isAddDepotPricingModalOpen: Ref<boolean> = ref(false);
let isDeleteModalOpen: Ref<boolean> = ref(false);

let depotName: Ref<string> = ref();
let fullTableRows: Ref<VDepotMaterialPricingTableRow[]> = ref([]);
let uneditedFullTableRows: Ref<VDepotMaterialPricingTableRow[]> = ref([]);
let filteredTableRows: Ref<VDepotMaterialPricingTableRow[]> = ref([]);
let selectedPricingIds: Ref<number[]> = ref([]);
let highlightedMaterialIds: Ref<number[]> = ref([]);
let newPricing: Ref<VDepotMaterialPricingTableRow> = ref({
  prices: [],
  materialId: null,
} as VDepotMaterialPricingTableRow);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);

let newValidPricing: ComputedRef<number[]> = computed(() => {
  return newPricing.value.prices.map((x) => x.price).filter((x) => x !== null);
});

let materialAlreadyHasPricing: ComputedRef<boolean> = computed(() => {
  return fullTableRows.value.some((x) => x.materialId === newPricing.value.materialId);
});

let materialOptions: ComputedRef<VSelectOptionItem[]> = computed(() => {
  return materials.value.map((x) => toVSelectOptionItem(x.id, x.materialName));
});

let showExistingMaterialActions: ComputedRef<boolean> = computed(() => {
  return v$.value.newPricing.materialId.$errors.map((x) => x.$validator).includes("hasPricingCheck");
});

let selectedMaterialNamesString: ComputedRef<string> = computed(() => {
  let materialNames = fullTableRows.value
    .filter((x) => {
      let flatPricingIds = x.prices.flatMap((y) => y.pricingId).filter((x) => x);
      return selectedPricingIds.value.some((z) => flatPricingIds.includes(z));
    })
    .map((x) => x.materialName)
    .toString();
  return materialNames.toString();
});

let allUniqueMaterialPricingUnits: Ref<VMaterialUnit[]> = ref([]);

const rules = {
  rows: {
    $each: helpers.forEach({
      prices: {
        $each: helpers.forEach({
          price: validationRules.material.price,
        }),
      },
    }),
  },
  newPricing: {
    materialId: {
      isValid: validationRules.material.materialId(materialAlreadyHasPricing, newPricing),
    },
    prices: {
      $each: helpers.forEach({
        price: {
          hasValidPrice: validationRules.material.addNewPrice(newValidPricing),
        },
      }),
    },
  },
} as any;

const v$ = useVuelidate(rules, {
  rows: fullTableRows,
  newPricing: newPricing,
});

function isRowInEditMode(id: number) {
  return rowsInEditMode.value.includes(id);
}

function isRowValid(id: number) {
  let isValid = true;
  allUniqueMaterialPricingUnits.value.forEach((unit, index) => {
    let validations = getRowValidations(getRowIndex(id)).prices.map((x) => x.$response);
    if (validations.length > 0) {
      isValid = false;
    }
  });
  return isValid;
}

function highlightRow(id: number) {
  highlightedMaterialIds.value = [id];
  setTimeout(() => {
    highlightedMaterialIds.value = highlightedMaterialIds.value.filter((x) => x !== id);
  }, 6000);
}

function onEditMaterialPrices() {
  setModalOpenState(isAddDepotPricingModalOpen, false);
  let materialRow = fullTableRows.value.find((x) => x.materialId == newPricing.value.materialId);
  filteredTableRows.value = filteredTableRows.value.filter((x) => x.materialId != newPricing.value.materialId);
  filteredTableRows.value.unshift(materialRow);
  highlightRow(newPricing.value.materialId);
  editRow(materialRow.id);
}

function getNewPriceValidations(index: number) {
  let errors = v$.value.newPricing.prices.$each.$response.$errors;
  if (errors.length > index) {
    return errors[index].price;
  }
}

function getRowValidations(index: number) {
  return v$.value.rows.$each.$response.$errors[index];
}

function getPriceForDisplayClass(id: number, unitId: number) {
  let price = getPriceForDisplay(id, unitId);
  if (price == priceNotSetValue) {
    return "text-grey";
  }
}

function getPriceForDisplay(id: number, unitId: number) {
  let price = getMaterialPriceOfUnit(id, unitId);
  if (price) {
    return `£${formatPrice(price)}`;
  }
  return priceNotSetValue;
}

function getMaterialPriceOfUnit(rowId: number, unitId: number): number {
  let materialPricing = fullTableRows.value.find((x) => x.id == rowId);
  return materialPricing.prices.find((x) => x.unitId == unitId)?.price;
}

function getPriceValidations(rowIndex: number, columnIndex: number) {
  let pricesValidation = v$.value.rows.$each.$response.$errors[rowIndex].prices;
  if (pricesValidation.length > 0) {
    return pricesValidation[0].$response.$errors.map((x) => x.price)[columnIndex];
  } else {
    return null;
  }
}

function getRowIndex(id: number) {
  return fullTableRows.value.findIndex((row) => row.id === id);
}

function getUpdateMaterialPricingCommand(id: number): UpdateMaterialPricingCommand {
  let row = fullTableRows.value.find((x) => x.id == id);
  let rowPricings = row.prices
    .filter((x) => x.isUpdated)
    .map((x) => {
      return {
        depotMaterialPriceId: x.pricingId,
        unitId: x.unitId,
        price: x.price,
      } as UpdateMaterialPricingItemCommand;
    });

  return {
    materialId: row.materialId,
    depotId: props.depotId,
    pricings: rowPricings,
  } as UpdateMaterialPricingCommand;
}

async function confirmEditPricing(id: number) {
  if (!isRowValid(id)) {
    return;
  }

  let command = getUpdateMaterialPricingCommand(id);
  if (command.pricings.length == 0) {
    unEditRow(id);
    return;
  }

  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialPricingClient)
    .updateMaterialPricing(getUpdateMaterialPricingCommand(id))
    .then(async () => {
      alertBoxText.value = config.successMessages.materialPricingUpdated(getMaterialNameFromId(id));
      showAlert(showAlertBox);
      unEditRow(id);
      loadTableData();
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}
function onCancelEditPricing(id: number) {
  resetRow(id);
  unEditRow(id);
}
function onEditPricing(id: number) {
  editRow(id);
}

function editRow(id: number) {
  rowsInEditMode.value.push(id);
}
function unEditRow(id: number) {
  rowsInEditMode.value = rowsInEditMode.value.filter((x) => x !== id);
}
function unEditAllRows() {
  rowsInEditMode.value = [];
}
function resetRow(id: number) {
  let current = fullTableRows.value.find((x) => x.id == id);
  let original = uneditedFullTableRows.value.find((x) => x.id == id);
  current.prices = original.prices;
}
function getNewMaterial(index: number) {
  let prices = newPricing.value.prices;
  if (prices && prices.length > index) {
    return prices[index];
  }
  return null;
}

function getNewMaterialPrice(index: number) {
  let material = getNewMaterial(index);
  if (!material) {
    return null;
  }
  return material.price;
}

function setMaterialPriceOfUnit(materialId: number, unitId: number, price: number) {
  let row = fullTableRows.value.find((x) => x.materialId == materialId);
  let rowPrice = row.prices.find((x) => x.unitId == unitId);
  rowPrice.price = price;
  rowPrice.isUpdated = isPriceUpdated(rowPrice.pricingId);
}

function isPriceUpdated(pricingId: number) {
  let newPrice = fullTableRows.value.flatMap((x) => x.prices).find((x) => x.pricingId == pricingId);
  let originalPrice = uneditedFullTableRows.value.flatMap((x) => x.prices).find((x) => x.pricingId == pricingId);
  return newPrice.price !== originalPrice.price;
}

function onMaterialNameClick(id: number) {
  router.push({
    name: RouterNames.EditMaterials,
    params: {
      materialId: id,
    },
  });
}

function setSelectedPricingIds(ids: number[]) {
  selectedPricingIds.value = ids;
}

function onMaterialUpdate(materialId: number) {
  v$.value.newPricing.materialId.$touch();
  newPricing.value.materialId = materialId;
  newPricing.value.materialName = materials.value.find((x) => x.id == materialId).materialName;
}

function getPricingIdsFromRowId(id: number) {
  return fullTableRows.value
    .filter((x) => x.id == id)
    .flatMap((x) => x.prices)
    .flatMap((x) => x.pricingId);
}
async function onArchivePricing(id: number) {
  setSelectedPricingIds(getPricingIdsFromRowId(id));
  setModalOpenState(isDeleteModalOpen, true);
}
function onAddPricing() {
  setModalOpenState(isAddDepotPricingModalOpen, true);
}
async function confirmArchivePricing() {
  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialPricingClient)
    .deleteMaterialPricings({
      depotMaterialPriceIds: selectedPricingIds.value,
    } as DeleteMaterialPricingCommand)
    .then(async (response) => {
      setModalOpenState(isDeleteModalOpen, false);
      alertBoxText.value = config.successMessages.materialPricingDeleted(
        getMaterialNameFromPricingId(selectedPricingIds.value[0])
      );
      showAlert(showAlertBox);
      setSelectedPricingIds([]);
      loadTableData();
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}
async function confirmAddPricing() {
  if (!(await isAddPricingFormValid())) {
    return;
  }

  let command = getCreateMaterialPricingCommand();

  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialPricingClient)
    .createMaterialPricing(command)
    .then(async (response) => {
      alertBoxText.value = config.successMessages.materialPricingAdded(newPricing.value.materialName);
      showAlert(showAlertBox);
      loadTableData();
      setModalOpenState(isAddDepotPricingModalOpen, false);
      unEditAllRows();
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

function getRowClass(id: number) {
  let materialRow = fullTableRows.value.find((x) => x.id == id);
  return highlightedMaterialIds.value.includes(materialRow.materialId) ? "row-highlight-bg-light-orange" : "";
}

function getCreateMaterialPricingCommand(): CreateMaterialPricingsCommand {
  return {
    materialId: newPricing.value.materialId,
    depotId: props.depotId,
    isActive: true,
    prices: newPricing.value.prices.map((x) => {
      return {
        unitId: x.unitId,
        price: x.price,
      } as CreateMaterialPricingPriceCommand;
    }),
  } as CreateMaterialPricingsCommand;
}

async function isAddPricingFormValid() {
  allUniqueMaterialPricingUnits.value.forEach((unit) => {
    //used to force validation as .$validate didnt work for the prices
    setNewMaterialPrice(unit, getNewMaterialPrice(getNewMaterialUnitIndexFromId(unit.unitId)));
  });

  let isValid = await v$.value.newPricing.$validate();
  return isValid;
}

function getNewMaterialUnitIndexFromId(unitId: number) {
  return allUniqueMaterialPricingUnits.value.findIndex((x) => x.unitId == unitId);
}

function setNewMaterialPrice(unit: VMaterialUnit, value: number) {
  let material = getNewMaterial(getNewMaterialUnitIndexFromId(unit.unitId));
  if (!material) {
    newPricing.value.prices.push({
      price: value,
      unitId: unit.unitId,
      unitName: unit.unitName,
    } as any);
  } else {
    material.price = value;
  }
}

function getMaterialNameFromPricingId(id: number) {
  return fullTableRows.value.find((x) => x.prices.map((x) => x.pricingId).includes(id))?.materialName;
}

function getMaterialNameFromId(id: number) {
  return fullTableRows.value.find((x) => x.id == id).materialName;
}

function filterTable(value) {
  searchTerm.value = value;
  if (value !== null || value !== "") {
    filteredTableRows.value = fullTableRows.value.filter((x) =>
      x.materialName.toString().toLowerCase().includes(value.toLowerCase())
    );
  }
}
function toVMaterialPricingTableRow(materialPricingsDtos: DepotMaterialPricingsDto[]) {
  return materialPricingsDtos.map((pricing, index) => {
    return {
      id: index,
      materialId: pricing.materialId,
      materialName: pricing.materialName,
      prices: getPricesWithEmptyPriceAsNull(pricing.pricings),
    } as VDepotMaterialPricingTableRow;
  });
}

function getPricesWithEmptyPriceAsNull(pricing: DepotMaterialPricingDto[]): VMaterialPriceItem[] {
  let prices = [];
  allUniqueMaterialPricingUnits.value.forEach((unit) => {
    let data = pricing.find((x) => x.unitId == unit.unitId);
    prices.push({
      unitId: unit.unitId,
      unitName: unit.unitName,
      price: data?.price,
      pricingId: data?.depotMaterialPriceId,
      isUpdated: false,
    } as VMaterialPriceItem);
  });
  return prices;
}

function setUniqueMaterialUnitIds(units: MaterialUnitDto[]) {
  let formattedUnits = units.map((x) => {
    return {
      unitId: x.id,
      unitName: x.unitName,
    } as VMaterialUnit;
  });

  allUniqueMaterialPricingUnits.value = sortAscendingAlphabetical(formattedUnits, "unitName");
}

async function loadTableData() {
  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialPricingClient)
    .getDepotMaterialPricingsInitialData(props.depotId)
    .then(async (response) => {
      setUniqueMaterialUnitIds(response.allMaterialUnits);
      let formattedResponse = toVMaterialPricingTableRow(response.depotMaterials);
      fullTableRows.value = formattedResponse;
      uneditedFullTableRows.value = cloneDeep(formattedResponse);
      filteredTableRows.value = cloneDeep(formattedResponse);
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

async function loadIntitialData() {
  store.setIsLoading(true);
  await getAuthenticatedClient(MaterialPricingClient)
    .getMaterialPricingInitialData(props.depotId)
    .then(async (response) => {
      store.setMaterials(
        response.materials.map((x) => {
          return { id: x.id, materialName: x.materialName } as MaterialDto;
        })
      );
      depotName.value = response.depotName;
    })
    .catch((ex) => globalStore.handleBackendError(ex));
  store.setIsLoading(false);
}

onMounted(async () => {
  await loadIntitialData();
  await loadTableData();
});
</script>

<style scoped></style>
