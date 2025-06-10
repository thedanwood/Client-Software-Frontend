<template>
  <div>
    <div class="d-flex mb-4 justify-content-between align-items-center">
      <h1 class="page-title">Saved Quotes</h1>
      <div class="d-flex">
        <Button
          class="btn-green"
          value="Add New Quote"
          :iconBefore="['fas', 'plus']"
          :disabled="isLoading"
          @click="navigateToNewQuote()"
        />
        <Button
          class="btn-red ms-3"
          value="View Past Quotes"
          :iconBefore="['fas', 'rotate-left']"
          :disabled="isLoading"
          @click="navigateToPastQuotes()"
        />
      </div>
    </div>
    <DatatableTopBar
      :legend="datatableConfig.quoteLegend"
      :show-middle-content="checkedTableRows.length > 1"
      :show-alert-box="showAlertBox"
      :alert-box-text="alertBoxText"
      alert-box-class="alert-success"
      search-placeholder="Search quotes"
      @filter="(val) => filterTable(val)"
    >
      <template v-slot:middle-content>
        <Button
          class="btn-dark ms-3"
          :value="`Download Selected Quotes (${checkedTableRows.length})`"
          :disabled="isLoading"
          :iconBefore="['fas', 'download']"
          @click="onDownload(checkedquoteIds)"
        />
        <Button
          class="btn-red ms-3"
          :value="`Delete Selected Quotes (${checkedTableRows.length})`"
          :disabled="isLoading"
          :iconBefore="['fas', 'xmark']"
          @click="onArchive(checkedquoteIds)"
        />
      </template>
    </DatatableTopBar>

    <ConfirmPopup
      heading="Archive Quote"
      class="popup-sm header-red"
      iconClass="text-dark-red"
      :icon="['fas', 'circle-xmark']"
      :isOpen="isArchiveModalOpen"
      @close-modal="isArchiveModalOpen = false"
    >
      <template v-slot:message>
        <h3>Are you sure you want to archive the quotes:</h3>
        <h4>
          <b>#{{ selectedOrderNumbersString }}</b>
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

    <ConfirmPopup
      heading="Email Quote"
      class="popup-sm header-blue"
      iconClass="text-dark-blue"
      :icon="['fas', 'envelopes-bulk']"
      :isOpen="isEmailModalOpen"
      @close-modal="isEmailModalOpen = false"
    >
      <template v-slot:message>
        <h3>
          Are you sure you want to email the quote
          <b>#{{ selectedOrderNumbersString }}</b> to:
        </h3>

        <div class="d-flex justify-items-center flex-column mt-4">
          <div class="d-flex flex-row justify-content-center">
            <Input
              class="w-50"
              :disabled="isLoading"
              :value="emailQuoteToEmail"
              @input="(val) => (emailQuoteToEmail = val)"
            />
            <Button
              class="btn-light-blue"
              value="Reset"
              :disabled="isLoading"
              :iconBefore="['fas', 'rotate-left']"
              @click="emailQuoteToEmail = originalEmailQuoteToEmail"
            />
          </div>

          <VuelidateErrors :errors="v$.emailQuoteToEmail.$errors" />
        </div>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-green ms-3"
          value="Send Email"
          :disabled="isLoading"
          :iconBefore="['fas', 'paper-plane']"
          @click="confirmEmail()"
        />
      </template>
    </ConfirmPopup>

    <ConfirmPopup
      heading="Download Quote"
      class="popup-sm header-dark-grey"
      iconClass="text-dark-grey"
      :icon="['fas', 'circle-down']"
      :isOpen="isDownloadModalOpen"
      @close-modal="isDownloadModalOpen = false"
    >
      <template v-slot:message>
        <h3>Are you sure you want to download the quotes:</h3>
        <h4>
          <b>#{{ selectedOrderNumbersString }}</b>
        </h4>
      </template>
      <template v-slot:buttons>
        <Button
          class="btn-green ms-3"
          value="Confirm Download"
          :iconBefore="['fas', 'download']"
          :disabled="isLoading"
          @click="confirmDownload()"
        />
      </template>
    </ConfirmPopup>
    <Popup
      :showModal="isAdjustPriceModalOpen"
      @close-modal="closeAdjustPriceModal()"
      heading="Adjust Price"
      class="popup-md header-blue"
    >
      <template v-slot:main-content>
        <div class="my-3">
          <label class="input-label"> Creation Information </label>
          <div class="form-control input-element w-50 bg-light-grey" :disabled="true">
            <QuoteCreationInfo
              :customerName="selectedQuotes[0]?.creationInfo?.customerName"
              :companyName="selectedQuotes[0]?.creationInfo?.companyName"
              :createdByName="selectedQuotes[0]?.creationInfo?.createdByName"
              :createdDateTime="selectedQuotes[0]?.creationInfo?.createdDateTime"
            />
          </div>
        </div>
        <div class="my-3">
          <label class="input-label"> Delivery Information </label>
          <div class="form-control input-element w-50 bg-light-grey" :disabled="true">
            <span>{{ getDeliveryDateForTable(selectedQuotes[0]?.deliveryInfo?.deliveryDate) }}</span>
            <br />
            <FontAwesomeIcon :icon="['fas', 'long-arrow-alt-right']" class="pe-3" />
            <span>{{ selectedQuotes[0]?.deliveryInfo?.deliveryLocation }}</span>
          </div>
        </div>
        <Input
          class="my-3 w-50"
          label="Total Quote Price"
          :disabled="true"
          :value="`£${formatPrice(selectedQuotes[0]?.totalQuotePrice)}`"
        />
        <div class="adjust-price-modal-items-container">
          <AdjustPrice
            class="cursor-pointer"
            button-classes="w-100"
            v-for="(pricing, i) in getPricings"
            :id="pricing.id"
            :metrics="toVAdjustQuotePriceParameterMetrics(pricing.deliveryMovementId)"
            :disabled="isLoading"
            :is-open="isAdjustPriceCollapseOpen(pricing.deliveryMovementId)"
            @toggle-is-open="toggleAdjustPriceCollapse(pricing.deliveryMovementId)"
            @journey-time-updated="(time) => setJourneyTime(time, pricing.deliveryMovementId)"
          />
        </div>
      </template>
      <template v-slot:footer-content>
        <Input
          class="my-3"
          label="Reason for price update"
          placeholder="Enter reason for price update"
          :disabled="isLoading"
          :value="adjustPriceReason"
          @input="(val) => (adjustPriceReason = val)"
        />
        <VuelidateErrors :errors="v$.adjustPriceReason.$errors" />
        <div class="d-flex justify-content-center align-items-center">
          <Button class="btn-dark" value="Cancel" :disabled="isLoading" @click="closeAdjustPriceModal()" />
          <Button
            class="btn-green ms-3"
            value="Save"
            :disabled="isLoading"
            :iconBefore="['fas', 'save']"
            @click="confirmAdjustPrice()"
          />
        </div>
      </template>
    </Popup>

    <DataTable
      v-model:selection="checkedTableRows"
      dataKey="id"
      stripedRows
      showGridlines
      paginator
      :loading="isLoading"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :rowClass="(data) => getRowClass(data.quoteType, data.id)"
      :value="filteredTableRows"
      @rowSelect="onRowSelect"
    >
      <Column style="width: 2%" selectionMode="multiple"></Column>
      <Column style="width: 5%" sortable field="quoteNumber" header="Quote Number"></Column>
      <Column style="width: 15%" sortable header="Creation Info" field="creationInfo">
        <template #body="slotProps">
          <div class="p-2 bg-black-opacity-10">
            <QuoteCreationInfo
              :customerName="slotProps.data.creationInfo.customerName"
              :companyName="slotProps.data.creationInfo.companyName"
              :createdByName="slotProps.data.creationInfo.createdByName"
              :createdDateTime="slotProps.data.creationInfo.createdDateTime"
            />
          </div>
        </template>
      </Column>
      <Column style="width: 15%" sortable header="Delivery Info" field="deliveryInfo">
        <template #body="slotProps">
          <div class="bg-black-opacity-10 p-1">
            <div v-if="slotProps.data.quoteType == 2">
              <div class="d-flex">
                <span>
                  <span class="pe-2" v-if="getDeliveryDateForTable(slotProps.data.deliveryInfo.deliveryDate)">{{
                    getDeliveryDateForTable(slotProps.data.deliveryInfo.deliveryDate)
                  }}</span>
                  <FontAwesomeIcon :icon="['fas', 'long-arrow-alt-right']" class="pe-3 ps-1" />
                  <span>{{ slotProps.data.deliveryInfo.deliveryLocation }}</span>
                </span>
              </div>
            </div>
            <div v-if="slotProps.data.quoteType == 1">
              <div @click="$emit('toggle')">
                <div class="d-flex flex-column">
                  <div class="d-flex">
                    <span>{{ getDeliveryDateForTable(slotProps.data.deliveryInfo.deliveryDate) }}</span>
                  </div>
                  <div class="d-flex">
                    <span>
                      <span>{{ slotProps.data.deliveryInfo.startLocation }}</span>
                      <FontAwesomeIcon :icon="['fas', 'long-arrow-alt-right']" class="px-3" />
                      <span>{{ slotProps.data.deliveryInfo.deliveryLocation }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Column>
      <Column style="width: 30% !important" sortable field="movements" header="Movements">
        <template #body="slotProps">
          <div v-if="slotProps.data.quoteType == RecordTypes.DeliveryOnly">
            <QuotesDeliveryOnlyMovementInfoItem
              :start-location="slotProps.data.movements[0].startLocation"
              :vehicle-type="slotProps.data.movements[0].vehicleTypeName"
              :number-of-loads="slotProps.data.movements[0].numberOfLoads"
            />
            <div v-if="slotProps.data.movements.length > 1">
              <CollapsableButton
                :identifier="getMovementCollapseButtonIdentifier(slotProps.data)"
                :isLoading="isLoading"
              >
                <template v-slot:button>
                  <Button
                    class="btn-light-blue btn-sm"
                    :value="`Show ${slotProps.data.movements.length - 1} More`"
                    :iconBefore="['fa', getMovementCollapseIcon(slotProps.data.id)]"
                    @click="toggleMovementsCollapseOpenState(slotProps.data.id)"
                  />
                </template>
              </CollapsableButton>
            </div>
            <CollapsableContainer
              :identifier="getMovementCollapseButtonIdentifier(slotProps.data)"
              :isOpen="isMaterialCollapseOpen(slotProps.data.id)"
              :showCloseButton="false"
              @toggle="toggleMovementsCollapseOpenState(slotProps.data.id)"
            >
              <template v-slot:content>
                <data class="movements-scroll">
                  <div
                    class="quote-movement-table-item"
                    v-for="(movement, index) in slotProps.data.movements.filter((x, i) => i > 0)"
                    :key="index"
                  >
                    <QuotesDeliveryOnlyMovementInfoItem
                      :start-location="movement.startLocation"
                      :vehicle-type="movement.vehicleTypeName"
                      :number-of-loads="movement.numberOfLoads"
                    />
                  </div>
                </data>
              </template>
            </CollapsableContainer>
          </div>
          <div v-else>
            <div class="quote-movement-table-item">
              <QuotesMaterialInfoItem
                class="bg-black-opacity-10 p-2"
                :materialInfo="getMaterialInfo(slotProps.data.movements[0], slotProps.data.deliveryInfo)"
              />
            </div>

            <div v-if="slotProps.data.movements.length > 1">
              <CollapsableButton
                :identifier="getMovementCollapseButtonIdentifier(slotProps.data)"
                :isLoading="isLoading"
              >
                <template v-slot:button>
                  <Button
                    class="btn-light-blue btn-sm"
                    :value="`Show ${slotProps.data.movements.length - 1} More`"
                    :iconBefore="['fa', getMovementCollapseIcon(slotProps.data.id)]"
                    @click="toggleMovementsCollapseOpenState(slotProps.data.id)"
                  />
                </template>
              </CollapsableButton>

              <CollapsableContainer
                :identifier="getMovementCollapseButtonIdentifier(slotProps.data)"
                :isOpen="isMaterialCollapseOpen(slotProps.data.id)"
                :showCloseButton="false"
                @toggle="toggleMovementsCollapseOpenState(slotProps.data.id)"
              >
                <template v-slot:content>
                  <data class="movements-scroll">
                    <div
                      class="quote-movement-table-item"
                      v-for="(movement, index) in slotProps.data.movements.filter((x, i) => i > 0)"
                      :key="index"
                    >
                      <QuotesMaterialInfoItem
                        class="bg-black-opacity-10 my-2 p-2"
                        :materialInfo="getMaterialInfo(movement, slotProps.data.deliveryInfo)"
                      />
                    </div>
                  </data>
                </template>
              </CollapsableContainer>
            </div>
          </div>
        </template>
      </Column>
      <Column style="width: 10%" field="comments" header="Comments" sortable>
        <template #body="slotProps">
          {{ getCommentForTable(slotProps.data.comments) }}
        </template>
      </Column>
      <Column style="width: 10%" field="quotePrice" header="Price">
        <template #body="slotProps">
          £{{ formatPrice(slotProps.data.totalQuotePrice) }}
          <Button
            class="btn-light-blue d-inline mt-3"
            value="Adjust Price"
            :iconBefore="['fa', 'coins']"
            @click="onAdjustPrice(slotProps.data.id)"
          />
        </template>
      </Column>
      <Column sortable header="Actions">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <Button
              class="btn-turquoise btn-sm d-inline mx-1"
              value="Edit"
              :iconBefore="['fas', 'pencil']"
              @click="onEdit(slotProps.data.quoteType, slotProps.data.id)"
            />
            <Button
              class="btn-blue btn-sm d-inline mx-1"
              value="Email"
              :iconBefore="['fas', 'envelope']"
              @click="onEmail([slotProps.data.id], slotProps.data.creationInfo.companyEmail)"
            />
            <Button
              class="btn-dark btn-sm d-inline mx-1"
              value="Download"
              :iconBefore="['fa', 'download']"
              @click="onDownload([slotProps.data.id])"
            />
            <Button
              class="btn-red btn-sm btn-sm d-inline mx-1"
              value="Archive"
              :iconBefore="['fas', 'xmark']"
              @click="onArchive([slotProps.data.id])"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { QuotesMaterialInfoItem, QuoteCreationInfo } from "../../components/quotes";
import { AdjustPrice } from "../../components/pricing";
import {
  Input,
  Button,
  CollapsableButton,
  CollapsableContainer,
  VuelidateErrors,
  DatatableTopBar,
  Popup,
  ConfirmPopup,
} from "../../components/shared";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { formatPrice } from "../../core/functions/financialFunctions";
import {
  RecordTypes,
  QuoteClient,
  UpdateDeliveryMovementPricingDto,
  UpdateMaterialMovementPricingDto,
  UpdateSupplyDeliveryQuotePricingCommandItem,
  UpdateSupplyDeliveryQuotePricingCommand,
  UpdateDeliveryOnlyQuotePricingCommandItem,
  UpdateDeliveryOnlyQuotePricingCommand,
  GetQuoteDto,
  EmailQuoteCommand,
} from "../../api/haulage-system";
import { validationRules, datatableConfig, fieldNames } from "../../core/constants";
import { RouterNames } from "../../core/enums/RouterNames";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { setModalOpenState, showAlert, downloadFile } from "../../core/functions/sharedFunctions";
import {
  toVAdjustQuotePriceForSupplyDelivery,
  toVAdjustQuotePriceForDeliveryOnly,
} from "../../core/mappers/toFrontendMappers";
import { VAdjustQuotePriceParameterMetrics } from "../../core/types/pricing";
import {
  VSavedQuoteTableRow,
  VSavedQuoteTableRowMovementInfo,
  VSavedQuoteTableRowDeliveryInfo,
  VQuoteMaterialInfo,
  VSavedQuoteTableRowCreationInfo,
} from "../../core/types/quotes";
import { useAdjustQuotePriceStore } from "../../stores/adjustQuotePriceStore";
import { useGlobalStore } from "../../stores/globalStore";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import useVuelidate from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import cloneDeep from "lodash.clonedeep";
import moment from "moment";
import { storeToRefs } from "pinia";
import { config } from "../../core/constants";
import { Ref, ref, ComputedRef, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import QuotesDeliveryOnlyMovementInfoItem from "./QuotesDeliveryOnlyMovementInfoItem.vue";
import { moveMessagePortToContext } from "worker_threads";

const router = useRouter();

const props = defineProps<{
  quoteId: number;
}>();

const store = useHaulageSystemStore();
const globalStore = useGlobalStore();
const { deliveryUnit } = storeToRefs(globalStore);

const { isLoading } = storeToRefs(store);

const priceStore = useAdjustQuotePriceStore();
const { getPricings, validationStates } = storeToRefs(priceStore);

const materialCollapseIdentifier: string = "materialCollapse";

let searchTerm: Ref<string> = ref("");
let movementCollapseOpenStates: Ref<{ id: number; isOpen: boolean }[]> = ref([]);

let isAdjustPriceModalOpen: Ref<boolean> = ref(false);
let isDownloadModalOpen: Ref<boolean> = ref(false);
let isArchiveModalOpen: Ref<boolean> = ref(false);
let isEmailModalOpen: Ref<boolean> = ref(false);
let emailQuoteToEmail: Ref<string> = ref(null);
let originalEmailQuoteToEmail: Ref<string> = ref(null);
let adjustPricesOpenStates: Ref<{ id: number; isOpen: boolean }[]> = ref([]);

let adjustPriceReason: Ref<string> = ref(null);
let fullTableRows: Ref<VSavedQuoteTableRow[]> = ref([]);
let checkedTableRows: Ref<VSavedQuoteTableRow[]> = ref([]);
let selectedQuoteIds: Ref<number[]> = ref([]);
let highlightedQuoteIds: Ref<number[]> = ref([]);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);

const filteredTableRows: ComputedRef<VSavedQuoteTableRow[]> = computed(() => {
  return fullTableRows.value.filter(
    (x) =>
      x.quoteNumber.toString().toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      x.creationInfo.customerName?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      x.creationInfo.companyName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      x.creationInfo.createdByName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      x.comments?.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const rules = {
  emailQuoteToEmail: {
    required,
    email,
  },
  adjustPriceReason: validationRules.adjustPrice.reason,
} as any;

const v$ = useVuelidate(rules, {
  emailQuoteToEmail,
  adjustPriceReason: adjustPriceReason,
});

const selectedOrderNumbersString: ComputedRef<string> = computed(() =>
  fullTableRows.value
    .filter((x) => selectedQuoteIds.value.includes(x.id))
    .map((x) => x.quoteNumber)
    .join(", ")
);
const checkedquoteIds: ComputedRef<number[]> = computed(() => {
  return checkedTableRows.value.map((x) => x.id);
});
const selectedQuotes: ComputedRef<VSavedQuoteTableRow[]> = computed(() => {
  return fullTableRows.value.filter((x) => selectedQuoteIds.value.includes(x.id));
});
function setAdjustPriceCollapseOpenState(id: number, isOpen: boolean) {
  let hasEntry = movementCollapseOpenStates.value.some((x) => x.id == id);
  if (!hasEntry) {
    movementCollapseOpenStates.value.push({ id: id, isOpen: isOpen });
  } else {
    let openState = movementCollapseOpenStates.value.find((x) => x.id == id);
    openState.isOpen = isOpen;
  }
}
function isMaterialCollapseOpen(id: number) {
  return movementCollapseOpenStates.value.some((x) => x.isOpen == true && x.id == id);
}
function getMovementCollapseIcon(id: number) {
  let isOpen = isMaterialCollapseOpen(id);
  return isOpen ? "chevron-up" : "chevron-down";
}
function toggleMovementsCollapseOpenState(id: number) {
  let isOpen = isMaterialCollapseOpen(id);
  setAdjustPriceCollapseOpenState(id, !isOpen);
}
function getMovementCollapseButtonIdentifier(row: VSavedQuoteTableRow) {
  return row.id + materialCollapseIdentifier;
}
function isAdjustPriceCollapseOpen(id: number) {
  return adjustPricesOpenStates.value.some((x) => x.id == id && x.isOpen == true);
}
function toggleAdjustPriceCollapse(id: number) {
  let isOpen = isAdjustPriceCollapseOpen(id);
  let openState = adjustPricesOpenStates.value.find((x) => x.id == id);
  if (isOpen) {
    openState.isOpen = false;
  } else {
    let isOpenStateFound = openState != null;
    if (!isOpenStateFound) {
      adjustPricesOpenStates.value.push({ id: id, isOpen: true });
    } else {
      openState.isOpen = true;
    }
  }
}

function setselectedQuoteIds(ids: number[]) {
  selectedQuoteIds.value = ids;
}

function getMaterialInfo(
  movement: VSavedQuoteTableRowMovementInfo,
  deliveryInfo: VSavedQuoteTableRowDeliveryInfo
): VQuoteMaterialInfo {
  return {
    materialName: movement.materialName,
    quantity: movement.quantity,
    materialUnitName: movement.materialUnitName,
    pricePerUnit: movement.materialPricePerQuantityUnit,
    totalPrice: movement.materialTotalPrice,
    vehicleType: movement.vehicleTypeName,
    depotName: movement.depotName,
    deliveryLocation: deliveryInfo.deliveryLocation,
    onewayJourneyTime: movement.onewayJourneyTime,
  } as VQuoteMaterialInfo;
}

function getRowClass(type: number, id: number) {
  let classes = [];
  if (type == 1) {
    classes.push("row-highlight-border-grey");
  } else {
    classes.push("row-highlight-border-blue");
  }

  if (highlightedQuoteIds.value.map((x) => x.toString()).includes(id.toString())) {
    classes.push("row-highlight-bg-light-green");
  }

  return classes.join(" ");
}

function onEdit(quoteType: number, quoteId: number) {
  if (quoteType == RecordTypes.DeliveryOnly) {
    router.push({
      name: RouterNames.DeliveryQuote,
      params: {
        quoteId: quoteId,
      },
    });
  } else if (RecordTypes.SupplyAndDelivery) {
    router.push({
      name: RouterNames.SupplyDeliveryQuote,
      params: {
        quoteId: quoteId,
      },
    });
  }
}

function onRowSelect() {
  selectedQuoteIds.value = checkedTableRows.value.map((x) => x.id);
}

function onArchive(quoteIds: number[]) {
  setselectedQuoteIds(quoteIds);
  setModalOpenState(isArchiveModalOpen, true);
}
function onEmail(quoteIds: number[], companyEmail: string) {
  setselectedQuoteIds(quoteIds);
  setModalOpenState(isEmailModalOpen, true);

  emailQuoteToEmail.value = companyEmail;
  originalEmailQuoteToEmail.value = cloneDeep(companyEmail);
}
function onDownload(quoteId: number[]) {
  setselectedQuoteIds(quoteId);
  setModalOpenState(isDownloadModalOpen, true);
}
async function isAdjustPriceFormValid() {
  let isPricingValid = true;
  for (const validationObject of validationStates.value) {
    let isValid = await validationObject.validation.$validate();
    if (!isValid) {
      isPricingValid = false;
      setAdjustPriceCollapseOpenState(validationObject.id, true);
    }
  }

  let isReasonValid = await v$.value.adjustPriceReason.$validate();
  return isPricingValid && isReasonValid;
}
async function confirmAdjustPrice() {
  let isValid = await isAdjustPriceFormValid();
  if (!isValid) {
    return;
  }
  let selectedQuote = selectedQuotes.value[0];
  if (selectedQuote.quoteType == RecordTypes.DeliveryOnly) {
    store.setIsLoading(true);
    await getAuthenticatedClient(QuoteClient)
      .updateDeliveryOnlyQuotePricing(selectedQuote.id, toUpdateDeliveryOnlyQuotePricingCommand())
      .then(async () => {})
      .catch((ex) => {
        globalStore.handleBackendError(ex);
      });
    store.setIsLoading(false);
  } else if (selectedQuote.quoteType == RecordTypes.SupplyAndDelivery) {
    store.setIsLoading(true);
    await getAuthenticatedClient(QuoteClient)
      .updateSupplyDeliveryQuotePricing(selectedQuote.id, toUpdateSupplyDeliveryQuotePricingCommand())
      .then(async () => {})
      .catch((ex) => {
        globalStore.handleBackendError(ex);
      });
    store.setIsLoading(false);
  }

  resetAdjustPriceForm();
  alertBoxText.value = config.successMessages.priceAdjusted(getOrderNumberFromquoteId(selectedQuoteIds.value[0]));
  highlightRow(selectedQuote.id);
  showAlert(showAlertBox);
  setModalOpenState(isAdjustPriceModalOpen, false);
}

function toUpdateSupplyDeliveryQuotePricingCommand() {
  let selectedQuote = selectedQuotes.value[0];
  return {
    pricings: getPricings.value.map((x) => {
      let movement = selectedQuote.movements.find((y) => y.deliveryMovementId == x.deliveryMovementId);
      return {
        materialMovementId: x.materialMovementId,
        deliveryMovementId: x.deliveryMovementId,
        deliveryPricing: {
          defaultOnewayJourneyTime: x.defaultOnewayJourneyTime,
          onewayJourneyTime: movement.onewayJourneyTime,
          defaultTotalDeliveryPrice: x.deliveryPricing.defaultTotalDeliveryPrice,
          totalDeliveryPrice: x.deliveryPricing.totalDeliveryPrice,
          defaultDeliveryPricePerMinute: x.deliveryPricing.defaultDeliveryPricePerTimeUnit,
          deliveryPricePerMinute: x.deliveryPricing.deliveryPricePerTimeUnit,
        } as UpdateDeliveryMovementPricingDto,
        materialPricing: {
          totalMaterialPrice: x.materialPricing.totalMaterialPrice,
          defaultTotalMaterialPrice: x.materialPricing.defaultTotalMaterialPrice,
          materialPricePerQuantityUnit: x.materialPricing.materialPricePerQuantityUnit,
          defaultMaterialPricePerQuantityUnit: x.materialPricing.defaultMaterialPricePerQuantityUnit,
        } as UpdateMaterialMovementPricingDto,
      } as UpdateSupplyDeliveryQuotePricingCommandItem;
    }),
  } as UpdateSupplyDeliveryQuotePricingCommand;
}

function toUpdateDeliveryOnlyQuotePricingCommand() {
  let selectedQuote = selectedQuotes.value[0];
  return {
    pricings: getPricings.value.map((x) => {
      let movement = selectedQuote.movements.find((y) => y.deliveryMovementId == x.id);
      return {
        deliveryMovementId: x.deliveryMovementId,
        pricing: {
          defaultOnewayJourneyTime: x.defaultOnewayJourneyTime,
          onewayJourneyTime: movement.onewayJourneyTime,
          defaultTotalDeliveryPrice: x.deliveryPricing.defaultTotalDeliveryPrice,
          totalDeliveryPrice: x.deliveryPricing.totalDeliveryPrice,
          defaultDeliveryPricePerMinute: x.deliveryPricing.defaultDeliveryPricePerTimeUnit,
          deliveryPricePerMinute: x.deliveryPricing.deliveryPricePerTimeUnit,
        } as UpdateDeliveryMovementPricingDto,
      } as UpdateDeliveryOnlyQuotePricingCommandItem;
    }),
  } as UpdateDeliveryOnlyQuotePricingCommand;
}

async function confirmEmail() {
  let isValid = await v$.value.emailQuoteToEmail.$validate();
  if (isValid) {
    store.setIsLoading(true);
    await getAuthenticatedClient(QuoteClient)
      .emailQuote(selectedQuoteIds.value[0], { companyEmail: emailQuoteToEmail.value } as EmailQuoteCommand)
      .then(async () => {
        resetEmailQuoteToEmailForm();
        resetAdjustPriceForm();
        let quoteId = selectedQuoteIds.value[0];
        alertBoxText.value = config.successMessages.quoteEmailed(
          getOrderNumberFromquoteId(quoteId),
          getCompanyNameFromQuoteId(quoteId)
        );
        showAlert(showAlertBox);
        setModalOpenState(isEmailModalOpen, false);
      })
      .catch((ex) => {
        globalStore.handleBackendError(ex);
      });
    store.setIsLoading(false);
  }
}
function getCommentForTable(comment: string) {
  return comment ?? "N/A";
}
function getDeliveryDateForTable(date: string) {
  if (date == null) {
    return null;
  } else {
    return `Delivery on ${date}`;
  }
}
async function confirmDownload() {
  let quoteNumbers = selectedQuoteIds.value.map((x) => getOrderNumberFromquoteId(x));

  store.setIsLoading(true);
  for (var quoteId of selectedQuoteIds.value) {
    await getAuthenticatedClient(QuoteClient)
      .downloadQuote(quoteId)
      .then(async (response) => {
        let companyName = getCompanyNameFromQuoteId(quoteId);
        let formattedDate = moment(new Date()).format("DD-MM-YYYY");
        let fileName = `Quote#${quoteId}-${companyName}-${formattedDate}.pdf`;
        downloadFile(response.data, fileName);
      })
      .catch((ex) => {
        globalStore.handleBackendError(ex);
      });
  }
  store.setIsLoading(false);

  alertBoxText.value = config.successMessages.quotesDownloaded(quoteNumbers);
  setModalOpenState(isDownloadModalOpen, false);
  showAlert(showAlertBox);
}
async function confirmArchive() {
  store.setIsLoading(true);
  for (var quoteId of selectedQuoteIds.value) {
    await getAuthenticatedClient(QuoteClient)
      .deleteQuote(quoteId)
      .then(async () => {})
      .catch((ex) => {
        globalStore.handleBackendError(ex);
      });
  }
  store.setIsLoading(false);

  let quoteNumbers = selectedQuoteIds.value.map((x) => getOrderNumberFromquoteId(x));
  fullTableRows.value = fullTableRows.value.filter((x) => !selectedQuoteIds.value.includes(x.id));
  alertBoxText.value = config.successMessages.quotesArchived(quoteNumbers);
  showAlert(showAlertBox);
  setModalOpenState(isArchiveModalOpen, false);
}

function toVAdjustQuotePriceParameterMetrics(deliveryMovementId: number): VAdjustQuotePriceParameterMetrics {
  let quote = selectedQuotes.value[0];
  let movement = quote.movements.find((x) => x.deliveryMovementId == deliveryMovementId);
  return {
    quoteType: quote.quoteType,
    onewayJourneyTime: movement.onewayJourneyTime,
    numberOfLoads: movement.numberOfLoads,
    quantity: movement.quantity,
    vehicleTypeName: movement.vehicleTypeName,
    materialUnitName: movement.materialUnitName,
    materialName: movement.materialName,
    startLocation: movement.startLocation,
    deliveryLocation: quote.deliveryInfo.deliveryLocation,
    deliveryUnitName: deliveryUnit.value.deliveryUnitName,
    depotName: movement.depotName,
  } as VAdjustQuotePriceParameterMetrics;
}

async function onAdjustPrice(quoteId: number): Promise<void> {
  setselectedQuoteIds([quoteId]);

  store.setIsLoading(true);
  if (selectedQuotes.value[0].quoteType == RecordTypes.SupplyAndDelivery) {
    await getAuthenticatedClient(QuoteClient)
      .getSavedSupplyDeliveryMovementPricings(quoteId)
      .then((response) => {
        response.forEach((movement) => {
          let priceObject = toVAdjustQuotePriceForSupplyDelivery(movement, movement.deliveryMovementId);
          priceStore.setPricing(priceObject);
        });
      })
      .catch((ex) => globalStore.handleBackendError(ex));
  } else if (selectedQuotes.value[0].quoteType == RecordTypes.DeliveryOnly) {
    await getAuthenticatedClient(QuoteClient)
      .getSavedDeliveryOnlyMovementPricings(quoteId)
      .then((response) => {
        response.forEach((movement) => {
          let priceObject = toVAdjustQuotePriceForDeliveryOnly(movement, movement.deliveryMovementId);
          priceStore.setPricing(priceObject);
        });
      })
      .catch((ex) => globalStore.handleBackendError(ex));
  }
  store.setIsLoading(false);

  setModalOpenState(isAdjustPriceModalOpen, true);
}

function closeAdjustPriceModal(): void {
  setModalOpenState(isAdjustPriceModalOpen, false);
  adjustPricesOpenStates.value = [];
  priceStore.resetPricing();
}
function resetAdjustPriceForm() {
  adjustPriceReason.value = null;
  adjustPricesOpenStates.value = [];
  v$.value.adjustPriceReason.$reset();
}
function resetEmailQuoteToEmailForm() {
  emailQuoteToEmail.value = null;
  v$.value.emailQuoteToEmail.$reset();
}
//#endregion Modal

function highlightRow(id: number) {
  highlightedQuoteIds.value.push(id);
  setTimeout(() => {
    highlightedQuoteIds.value = highlightedQuoteIds.value.filter((x) => x != id);
  }, 6000);
}

function setJourneyTime(journeyTime: number, deliveryMovementId) {
  selectedQuotes.value[0].movements.find((x) => x.deliveryMovementId == deliveryMovementId).onewayJourneyTime =
    journeyTime;
}

function navigateToPastQuotes() {
  router.push({
    name: RouterNames.PastQuotes,
  });
}

function navigateToNewQuote() {
  router.push({
    name: RouterNames.AddQuoteSelection,
  });
}

function toVSavedQuoteTableRows(data: GetQuoteDto[]) {
  return data.map((quote) => {
    let deliveryDate = null;
    if (quote.deliveryInfo.deliveryDate != null)
      deliveryDate = moment(quote.deliveryInfo.deliveryDate).format("DD/MM/YYYY");
    return {
      id: quote.quoteId,
      quoteNumber: quote.quoteNumber,
      quoteType: quote.quoteType,
      creationInfo: {
        customerName: quote.creationInfo.customerName,
        companyId: quote.creationInfo.company.id,
        companyName: quote.creationInfo.company.name,
        companyEmail: quote.creationInfo.company.email,
        createdByName: quote.creationInfo.createdByName,
        createdDateTime: moment(quote.creationInfo.createdDateTime).format("HH:mm DD/MM/YYYY"),
      } as VSavedQuoteTableRowCreationInfo,
      deliveryInfo: {
        deliveryDate: deliveryDate,
        deliveryLocation: quote.deliveryInfo.deliveryLocation,
      } as VSavedQuoteTableRowDeliveryInfo,
      movements: quote.movements.map((movement) => {
        return {
          deliveryMovementId: movement.deliveryMovement.deliveryMovementId,
          materialMovementId: movement.materialMovement.materialMovementId,
          materialName: movement.materialMovement.material.materialName,
          quantity: movement.materialMovement.quantity,
          materialUnitName: movement.materialMovement.materialUnit.unitName,
          numberOfLoads: movement.deliveryMovement.numberOfLoads,
          vehicleTypeName: movement.deliveryMovement.vehicleType.name,
          depotName: movement.materialMovement.depotName,
          onewayJourneyTime: movement.deliveryMovement.onewayJourneyTime,
          startLocation: movement.deliveryMovement.startLocation.fullAddress,
          materialTotalPrice: movement.materialMovement.totalPrice,
          materialPricePerQuantityUnit: movement.materialMovement.pricePerQuantityUnit,
        } as VSavedQuoteTableRowMovementInfo;
      }),
      comments: quote.comments,
      totalQuotePrice: quote.totalQuotePrice,
    } as VSavedQuoteTableRow;
  });
}

async function loadQuoteTableRows() {
  store.setIsLoading(true);
  await getAuthenticatedClient(QuoteClient)
    .getSavedQuotes()
    .then(async (response) => {
      let formattedRows = toVSavedQuoteTableRows(response);
      fullTableRows.value = formattedRows;
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

function getOrderNumberFromquoteId(id: number) {
  return fullTableRows.value.find((x) => x.id == id).quoteNumber;
}

function getCompanyNameFromQuoteId(id: number) {
  return fullTableRows.value.find((x) => x.id == id).creationInfo.companyName;
}

function filterTable(value) {
  if (value !== null || value !== "") {
    searchTerm.value = value;
  }
}
onBeforeMount(async () => {
  priceStore.resetPricing();
  fullTableRows.value = [];
  await loadQuoteTableRows();

  if (props.quoteId) {
    highlightRow(props.quoteId);
  }
});
</script>

<style scoped>
.p-datatable-table {
  box-sizing: content-box;
  border-collapse: collapse;
  padding: 10px;
}
.material-info-container {
  width: 100%;
}
.adjust-price-modal-items-container {
  max-height: 700px;
  overflow-y: scroll;
  padding: 20px;
  background-color: var(--lightest-blue);
}
</style>
