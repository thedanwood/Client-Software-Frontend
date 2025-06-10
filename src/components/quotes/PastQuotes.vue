<template>
  <h1 class="page-title">This page is a work in progress...</h1>
</template>

<script lang="ts" setup>
import { datatableConfig } from "../../core/constants";
import { RouterNames } from "../../core/enums/RouterNames";
import { setModalOpenState, showAlert } from "../../core/functions/sharedFunctions";
import { formatPrice } from "../../core/functions/financialFunctions";
import { VSavedQuoteTableRow } from "../../core/types/quotes";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { storeToRefs } from "pinia";
import { config } from "../../core/constants";
import { Ref, ref, ComputedRef, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps<{
  orderIds: number[];
}>();

const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);

const materialCollapseIdentifier: string = "materialCollapse";

let searchTerm: Ref<string> = ref("");
let isMaterialCollapseOpen: Ref<boolean> = ref(false);
let isRestoreModalOpen: Ref<boolean> = ref(false);
let isDeleteModalOpen: Ref<boolean> = ref(false);
let fullTableRows: Ref<VSavedQuoteTableRow[]> = ref([]);
let filteredTableRows: Ref<VSavedQuoteTableRow[]> = ref([]);
let checkedTableRows: Ref<VSavedQuoteTableRow[]> = ref([]);
let selectedOrderIds: Ref<number[]> = ref([]);
let alertBoxText: Ref<string> = ref(null);
let showAlertBox: Ref<boolean> = ref(false);

let checkedOrderIds: ComputedRef<number[]> = computed(() => {
  return checkedTableRows.value.map((x) => x.id);
});
let materialCollapseIcon: ComputedRef<string> = computed(() => {
  return isMaterialCollapseOpen.value ? "chevron-up" : "chevron-down";
});
let selectedOrderNumbersString: ComputedRef<string> = computed(() =>
  fullTableRows.value
    .filter((x) => selectedOrderIds.value.includes(x.id))
    .map((x) => x.quoteNumber)
    .join(", ")
);

function setSelectedOrders(ids: number[]) {
  selectedOrderIds.value = ids;
}

function getRowClass(type: number) {
  if (type == 1) {
    return "row-highlight-border-grey";
  } else {
    return "row-highlight-border-blue";
  }
}

function toggleMaterialsCollapse() {
  isMaterialCollapseOpen.value = !isMaterialCollapseOpen.value;
}

function onRowSelect() {
  selectedOrderIds.value = checkedTableRows.value.map((x) => x.id);
}

// #region Modals
function onDeleteOrder(orderIds: number[]) {
  setSelectedOrders(orderIds);
  setModalOpenState(isDeleteModalOpen, true);
}
function onRestoreOrder(orderIds: number[]) {
  setSelectedOrders(orderIds);
  setModalOpenState(isRestoreModalOpen, true);
}
function confirmDeletion() {
  let quoteNumbers = selectedOrderIds.value.map((x) => getOrderNumberFromOrderId(x));
  alertBoxText.value = config.successMessages.quotesDeleted(quoteNumbers);
  showAlert(showAlertBox);
  setSelectedOrders([]);
  setModalOpenState(isDeleteModalOpen, false);
}
function confirmRestore() {
  let quoteNumbers = selectedOrderIds.value.map((x) => getOrderNumberFromOrderId(x));
  alertBoxText.value = config.successMessages.quotesRestored(quoteNumbers);
  showAlert(showAlertBox);
  setSelectedOrders([]);
  setModalOpenState(isRestoreModalOpen, false);
}
// #endregion

function getOrderNumberFromOrderId(id: number) {
  return fullTableRows.value.find((x) => x.id == id).quoteNumber;
}

function navigateToSavedQuote() {
  router.push({
    name: RouterNames.SavedQuotes,
  });
}

function navigateToNewQuote() {
  router.push({
    name: RouterNames.AddQuoteSelection,
  });
}

onMounted(() => {});

function filterTable(value) {
  searchTerm.value = value;
  if (value !== null || value !== "") {
    filteredTableRows.value = fullTableRows.value.filter(
      (x) =>
        x.quoteNumber.toString().toLowerCase().includes(value.toLowerCase()) ||
        x.creationInfo.customerName.toLowerCase().includes(value.toLowerCase()) ||
        x.creationInfo.companyName.toLowerCase().includes(value.toLowerCase()) ||
        x.creationInfo.createdByName.toLowerCase().includes(value.toLowerCase()) ||
        x.comments.toLowerCase().includes(value.toLowerCase())
    );
  }
}
</script>

<style scoped></style>
