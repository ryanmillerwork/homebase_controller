<template>
  <q-dialog v-model="dialogVisible">
    <q-card class="query-builder-card">
      <!-- Calendar Row (Always First) -->
      <q-card-section class="query-builder-row q-gutter-sm">
        <div class="query-builder-row-content">
          <div class="query-builder-inputs-container">
            <div class="row q-col-gutter-md">
              <!-- Calendar Column -->
              <div class="col-12 col-sm-6">
                <q-date
                  v-model="dateRange"
                  multiple
                  range
                  outlined
                  label="Select Date Ranges"
                  @update:model-value="onDateChange"
                  style="width: 100%"
                ></q-date>
                <q-btn
                  push
                  :color="sortByDate ? 'primary' : 'white'"
                  :text-color="sortByDate ? 'white' : 'primary'"
                  label="Sort by date"
                  class="q-mt-sm full-width"
                  @click="toggleSortByDate"
                />
              </div>

              <!-- Subject Column -->
              <div class="col-6 col-sm-3 q-pl-md">
                <div class="selection-container" style="width: 100%">
                  <div
                    class="row"
                    style="height: 267px; display: flex; align-items: stretch"
                  >
                    <div
                      class="vertical-label"
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                      "
                    >
                      <div class="label-text">Subject</div>
                    </div>
                    <div
                      class="selection-list"
                      style="width: calc(100% - 24px); height: 100%"
                    >
                      <q-scroll-area style="height: 100%">
                        <q-list
                          dense
                          bordered
                          padding
                          class="rounded-borders compact-list"
                          style="
                            height: 100%;
                            box-sizing: border-box;
                            min-height: 267px;
                          "
                        >
                          <q-item
                            v-for="subject in listboxOptions.subject"
                            :key="subject"
                            clickable
                            v-ripple
                            :active="selectedSubjects.includes(subject)"
                            @click="toggleSubject(subject)"
                          >
                            <q-item-section>{{ subject }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>
                  </div>

                  <q-btn
                    push
                    :color="sortBySubject ? 'primary' : 'white'"
                    :text-color="sortBySubject ? 'white' : 'primary'"
                    label="Sort subject"
                    class="q-mt-sm full-width"
                    @click="toggleSortBySubject"
                  />

                  <q-select
                    v-model="filterTrialType"
                    :options="trialTypeOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    outlined
                    class="q-mt-sm full-width"
                    @update:model-value="onRowChange"
                  ></q-select>

                  <q-btn
                    push
                    :color="sortByStatus ? 'primary' : 'white'"
                    :text-color="sortByStatus ? 'white' : 'primary'"
                    label="Sort by Status"
                    class="q-mt-sm full-width"
                    @click="toggleSortByStatus"
                  />
                </div>
              </div>

              <!-- System/Protocol/Variant Column -->
              <div class="col-6 col-sm-3 q-pl-md">
                <div class="selection-container" style="width: 100%">
                  <div class="row q-mb-sm">
                    <div class="vertical-label">
                      <div class="label-text">System</div>
                    </div>
                    <div
                      class="selection-list"
                      style="height: 117px; width: calc(100% - 24px)"
                    >
                      <q-scroll-area style="height: 100%">
                        <q-list
                          dense
                          bordered
                          padding
                          class="rounded-borders compact-list"
                          style="min-height: 117px"
                        >
                          <q-item
                            v-for="system in listboxOptions.system"
                            :key="system"
                            clickable
                            v-ripple
                            :active="selectedSystems.includes(system)"
                            @click="toggleSystem(system)"
                            class="q-mb-xs"
                          >
                            <q-item-section>{{ system }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>
                  </div>

                  <div class="row q-mb-sm">
                    <div class="vertical-label">
                      <div class="label-text">Protocol</div>
                    </div>
                    <div
                      class="selection-list"
                      style="height: 117px; width: calc(100% - 24px)"
                    >
                      <q-scroll-area style="height: 100%">
                        <q-list
                          dense
                          bordered
                          padding
                          class="rounded-borders compact-list"
                          style="min-height: 117px"
                        >
                          <q-item
                            v-for="protocol in listboxOptions.protocol"
                            :key="protocol"
                            clickable
                            v-ripple
                            :active="selectedProtocols.includes(protocol)"
                            @click="toggleProtocol(protocol)"
                            class="q-mb-xs"
                          >
                            <q-item-section>{{ protocol }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>
                  </div>

                  <div class="row q-mb-sm">
                    <div class="vertical-label">
                      <div class="label-text">Variant</div>
                    </div>
                    <div
                      class="selection-list"
                      style="height: 117px; width: calc(100% - 24px)"
                    >
                      <q-scroll-area style="height: 100%">
                        <q-list
                          dense
                          bordered
                          padding
                          class="rounded-borders compact-list"
                          style="min-height: 117px"
                        >
                          <q-item
                            v-for="variant in listboxOptions.variant"
                            :key="variant"
                            clickable
                            v-ripple
                            :active="selectedVariants.includes(variant)"
                            @click="toggleVariant(variant)"
                            class="q-mb-xs"
                          >
                            <q-item-section>{{ variant }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>
                  </div>

                  <q-btn
                    push
                    :color="sortByVariant ? 'primary' : 'white'"
                    :text-color="sortByVariant ? 'white' : 'primary'"
                    label="Sort by Variant"
                    class="q-mt-sm full-width"
                    @click="toggleSortByVariant"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Dynamic Rows for Query Construction -->
      <q-card-section
        v-for="(row, index) in queryRows"
        :key="index"
        class="query-builder-row q-gutter-sm"
      >
        <div class="query-builder-row-content">
          <div class="query-builder-inputs-container">
            <!-- Filter/Group Toggle -->
            <q-btn-toggle
              v-model="row.type"
              unelevated
              :options="[
                { label: 'Include', value: 'filter' },
                { label: 'Sort by', value: 'group' },
              ]"
              @update:model-value="onRowChange"
              class="query-toggle-button"
            ></q-btn-toggle>

            <!-- Field Selection Dropdown -->
            <q-select
              v-model="row.field"
              :options="fields"
              option-value="value"
              option-label="label"
              label="Field"
              outlined
              class="query-field-dropdown"
              @update:model-value="onFieldSelected(index)"
            ></q-select>

            <!-- Filter Inputs (Displayed for "Include") -->
            <div v-if="row.type === 'filter'" class="query-filter-inputs">
              <!-- Text Type: Multiselect -->
              <q-select
                v-if="row.dataType === 'text'"
                v-model="row.value"
                :options="listboxOptions[row.field?.value || row.field] || []"
                multiple
                outlined
                label="Select Values"
                class="query-value-dropdown"
                @blur="onRowChange"
                @update:model-value="onRowChange"
              ></q-select>

              <!-- Number Type: Operator and Input -->
              <div
                v-if="row.dataType === 'int'"
                class="query-operator-value-row"
              >
                <q-select
                  v-model="row.operator"
                  :options="[
                    { label: '=', value: '=' },
                    { label: '>', value: '>' },
                    { label: '<', value: '<' },
                    { label: '>=', value: '>=' },
                    { label: '<=', value: '<=' },
                  ]"
                  outlined
                  label="Operator"
                  class="query-operator-dropdown"
                  @update:model-value="onRowChange"
                ></q-select>
                <q-input
                  v-model="row.value"
                  outlined
                  label="Value"
                  class="query-value-input"
                  @blur="onRowChange"
                  @input="onRowChange"
                ></q-input>
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <q-btn
            flat
            icon="close"
            color="negative"
            class="query-delete-button"
            @click="removeRow(index)"
          ></q-btn>
        </div>
      </q-card-section>

      <!-- Add Row Button -->
      <q-card-section>
        <q-btn
          flat
          icon="add"
          label="Add Filter"
          color="primary"
          class="full-width"
          @click="addRow"
        ></q-btn>
      </q-card-section>

      <!-- Display Generated Query -->
      <q-card-section>
        <div class="q-pa-md">
          <q-table
            style="height: 400px"
            flat
            bordered
            :rows="rows"
            :columns="columns"
            row-key="index"
            dense
            virtual-scroll
            v-model:pagination="pagination"
            :rows-per-page-options="[0]"
          >
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, toRef, toRefs } from "vue";
import { sendMessage } from "src/composables/useWebSocket";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fields: {
    type: Array,
    default: () => [],
  },
  listboxOptions: {
    type: Object,
    default: () => ({
      subject: [],
      system: [],
      protocol: [],
      variant: [],
    }),
  },
  sqlTableResponse: {
    type: Array, // Adjust the type as needed
    required: true,
  },
});

//temp for debugging:
watch(
  () => props.listboxOptions,
  (newVal) => {
    console.log("listboxOptions changed:", newVal);
  },
  { deep: true }
);

const sqlTableResponse = toRef(props, "sqlTableResponse");
const { listboxOptions } = toRefs(props);
const emit = defineEmits(["update:modelValue"]);

// Local state
const dialogVisible = ref(props.modelValue);
const dateRange = ref([]);
const selectedSubjects = ref([]);
const selectedSystems = ref([]);
const selectedProtocols = ref([]);
const selectedVariants = ref([]);
const filterTrialType = ref("responses"); // "responses", "correct", "all"

const sortBySubject = ref(false);
const sortByDate = ref(false);
const sortByStatus = ref(false);
const sortByVariant = ref(false);

const trialTypeOptions = [
  { label: "Only responses", value: "responses" },
  { label: "Only correct", value: "correct" },
  { label: "All trials", value: "all" },
];

// Dynamically generate columns based on the keys of the first row in sqlTableResponse
const columns = computed(() => {
  if (!sqlTableResponse.value || sqlTableResponse.value.length === 0) {
    return [];
  }

  const specialCases = {
    ms: "ms",
    rt: "RT", // Add RT as a special case
  };

  return Object.keys(sqlTableResponse.value[0]).map((key) => {
    const sampleValue = sqlTableResponse.value[0][key];
    const isDateField =
      sampleValue instanceof Date ||
      (typeof sampleValue === "string" && !isNaN(Date.parse(sampleValue)));

    return {
      name: key,
      label: key
        .replace(/_/g, " ")
        .replace(
          /\b\w+\b/g,
          (word) =>
            specialCases[word.toLowerCase()] ||
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .replace(
          /\((\w+)\)/g,
          (match, unit) => `(${specialCases[unit.toLowerCase()] || unit})`
        ),
      align: "center",
      field: key,
      sortable: true,
      format: isDateField ? (val) => (val ? val.split("T")[0] : "") : undefined,
      sort: isDateField ? (a, b) => new Date(a) - new Date(b) : undefined,
      classes: isDateField ? "date-column" : undefined,
    };
  });
});

// Rows are the same as sqlTableResponse
const rows = computed(() => sqlTableResponse.value || []);

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  }
);
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// Data and logic for query building
const generatedQuery = ref("");
const queryRows = ref([
  {
    type: "filter",
    field: null,
    dataType: null,
    value: null,
    operator: null,
  },
]);

const mappingsTable = [
  {
    name: "side",
    path: "(trialinfo->'stiminfo'->>'side')",
    type: "int",
    defaultAlias: "side",
  },
  { name: "variant", path: "variant", type: "text", defaultAlias: "variant" },
  { name: "date", path: "client_time", type: "date", defaultAlias: "date" },
  { name: "status", path: "status", type: "int", defaultAlias: "status" },
  { name: "subject", path: "subject", type: "text", defaultAlias: "subject" },
  {
    name: "system",
    path: "state_system",
    type: "text",
    defaultAlias: "system",
  },
  {
    name: "protocol",
    path: "protocol",
    type: "text",
    defaultAlias: "protocol",
  },
  { name: "variant", path: "variant", type: "text", defaultAlias: "variant" },
];

function toggleSubject(subject) {
  if (selectedSubjects.value.includes(subject)) {
    selectedSubjects.value = selectedSubjects.value.filter(
      (s) => s !== subject
    );
  } else {
    selectedSubjects.value.push(subject);
  }
  onRowChange();
}

function toggleSystem(system) {
  if (selectedSystems.value.includes(system)) {
    selectedSystems.value = selectedSystems.value.filter((s) => s !== system);
  } else {
    selectedSystems.value.push(system);
  }
  onRowChange();
}

function toggleProtocol(protocol) {
  if (selectedtoggleProtocols.value.includes(protocol)) {
    selectedtoggleProtocols.value = selectedtoggleProtocols.value.filter(
      (s) => s !== protocol
    );
  } else {
    selectedtoggleProtocols.value.push(protocol);
  }
  onRowChange();
}

function toggleVariant(variant) {
  if (selectedVariants.value.includes(variant)) {
    selectedVariants.value = selectedVariants.value.filter(
      (s) => s !== variant
    );
  } else {
    selectedVariants.value.push(variant);
  }
  onRowChange();
}

function toggleSortByDate() {
  sortByDate.value = !sortByDate.value;
  onRowChange();
}

function toggleSortBySubject() {
  sortBySubject.value = !sortBySubject.value;
  onRowChange();
}

function toggleSortByStatus() {
  sortByStatus.value = !sortByStatus.value;
  onRowChange();
}

function toggleSortByVariant() {
  sortByVariant.value = !sortByVariant.value;
  onRowChange();
}

const onDateChange = () => {
  getSubjectsOnDate();
  generateQuery();
};

function getSubjectsOnDate() {
  let dateWhereClause = "";
  if (dateRange.value && dateRange.value.length > 0) {
    const dateRanges = [];

    dateRange.value.forEach((range) => {
      const from = range.from ? formatDate(range.from) : formatDate(range);
      const to = range.to ? formatDate(range.to) : formatDate(range);
      dateRanges.push(`(client_time::date BETWEEN '${from}' AND '${to}')`);
    });

    if (dateRanges.length > 0) {
      dateWhereClause = `WHERE ${dateRanges.join(" OR ")}`;
    }
  }

  // Four separate queries, each getting unique values for one column
  const sql = `
    WITH unique_values AS (
      SELECT ARRAY_AGG(DISTINCT subject) as subjects,
             ARRAY_AGG(DISTINCT state_system) as systems,
             ARRAY_AGG(DISTINCT protocol) as protocols,
             ARRAY_AGG(DISTINCT variant) as variants
      FROM server_trial
      ${dateWhereClause}
    )
    SELECT * FROM unique_values`;

  console.log(sql);
  sendMessage("get_options", "localhost", sql);

  // Assuming you're using some database client that returns a promise
  // You would then parse the result like this:
  // executeQuery(sql).then((result) => {
  //   // result will be an object with arrays for each column
  //   availableValues.value = {
  //     subject: result.subjects,
  //     system: result.systems,
  //     protocol: result.protocols,
  //     variant: result.variants,
  //   };
  // });

  // return sql;
}

// Helper function to format Date objects to YYYY-MM-DD
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

function buildFiltersFromRows() {
  const filters = {};
  const groupBy = [];

  // Row-based filters
  queryRows.value.forEach((row) => {
    console.log("row: ", row);
    if (row.type === "filter" && row.field) {
      const fieldName = row.field.value;
      console.log("fieldName: ", fieldName);
      if (row.dataType === "int") {
        filters[fieldName] = {
          operator: row.operator?.value,
          value: row.value,
        };
      } else {
        filters[fieldName] = row.value;
      }
      console.log(filters[fieldName]);
    } else if (row.type === "group" && row.field) {
      console.log("group filter: ", row.type, row.field.value);
      groupBy.push(row.field.value);
    }
  });

  // Subject filters
  if (selectedSubjects.value.length > 0) {
    filters.subject = selectedSubjects.value;
  }
  if (selectedSystems.value.length > 0) {
    filters.system = selectedSystems.value;
  }
  if (selectedProtocols.value.length > 0) {
    filters.protocol = selectedProtocols.value;
  }
  if (selectedVariants.value.length > 0) {
    filters.variant = selectedVariants.value;
  }
  // Trial Type filters based on filterTrialType
  if (filterTrialType.value === "responses") {
    filters.status = { operator: ">=", value: 0 };
  } else if (filterTrialType.value === "correct") {
    filters.status = { operator: "=", value: 1 };
  }
  // sort filters
  if (sortByDate.value) groupBy.push("date");
  if (sortBySubject.value) groupBy.push("subject");
  if (sortByStatus.value) groupBy.push("status");
  if (sortByVariant.value) groupBy.push("variant");

  console.log("buildFiltersFromRows groupBy: ", groupBy);

  return [filters, groupBy];
}

function buildSQLQueryWithMappings(filters, groupBy, mappingsTable) {
  console.log("buildSQLQueryWithMappings", groupBy);

  const castTypes = {
    int: "::int",
    text: "::text",
    date: "::date",
  };

  const selectColumns =
    groupBy.length > 0
      ? groupBy.map((col) => {
          const mapping = mappingsTable.find((m) => m.name === col);
          if (!mapping)
            throw new Error(`No mapping found for groupBy column: ${col}`);
          const cast = castTypes[mapping.type] || "";
          return (
            mapping.path +
            cast +
            (mapping.defaultAlias ? ` AS ${mapping.defaultAlias}` : "")
          );
        })
      : [];

  const baseSelect = `
    SELECT
      ${selectColumns.join(", ")}${selectColumns.length > 0 ? "," : ""}
      ROUND(AVG(status) * 100) AS "% Correct",
      ROUND(AVG(rt)) AS "RT (ms)",
      COUNT(status) AS trials
    FROM server_trial
  `;

  // Process date ranges separately
  // Process date ranges separately
  let dateWhereClause = "";
  if (dateRange.value) {
    const dateRanges = [];

    // Handle single range
    if (!Array.isArray(dateRange.value)) {
      const from = dateRange.value.from || dateRange.value; // Support both formats
      const to = dateRange.value.to || dateRange.value; // Single day case
      dateRanges.push(`(client_time::date BETWEEN '${from}' AND '${to}')`);
    }
    // Handle multiple ranges
    else if (Array.isArray(dateRange.value)) {
      dateRange.value.forEach((range) => {
        const from = range.from || range; // Support both formats
        const to = range.to || range; // Single day case
        if (from && to) {
          dateRanges.push(`(client_time::date BETWEEN '${from}' AND '${to}')`);
        }
      });
    }

    if (dateRanges.length > 0) {
      dateWhereClause = `(${dateRanges.join(" OR ")})`;
    }
  }

  // Process other filters
  const otherWhereClauses = Object.entries(filters)
    .filter(
      ([key, value]) => key !== "date" && value !== undefined && value !== null
    )
    .map(([key, value]) => {
      const mapping = mappingsTable.find((m) => m.name === key);
      if (!mapping) throw new Error(`No mapping found for filter key: ${key}`);
      const cast = castTypes[mapping.type] || "";

      if (Array.isArray(value)) {
        return `${mapping.path}${cast} IN (${value
          .map((v) => `'${v}'`)
          .join(", ")})`;
      } else if (
        value &&
        typeof value === "object" &&
        value.operator !== undefined &&
        value.value !== undefined
      ) {
        return `${mapping.path}${cast} ${value.operator} ${value.value}`;
      } else if (typeof value === "string" && value.trim() !== "") {
        return `${mapping.path}${cast} = '${value}'`;
      }
      return "";
    })
    .filter((clause) => clause);

  const allWhereClauses = [
    ...(dateWhereClause ? [dateWhereClause] : []),
    ...otherWhereClauses,
  ];
  const whereClause =
    allWhereClauses.length > 0 ? `WHERE ${allWhereClauses.join(" AND ")}` : "";

  const groupByColumns = groupBy.map((col) => {
    const mapping = mappingsTable.find((m) => m.name === col);
    if (!mapping)
      throw new Error(`No mapping found for groupBy column: ${col}`);
    const cast = castTypes[mapping.type] || "";
    return mapping.path + cast;
  });

  const groupByClause =
    groupByColumns.length > 0 ? `GROUP BY ${groupByColumns.join(", ")}` : "";

  // Add ORDER BY if we are grouping by subject
  let orderByClause = "";
  if (groupBy.includes("subject")) {
    orderByClause = "ORDER BY subject";
  }

  const sqlQuery = `
    ${baseSelect}
    ${whereClause}
    ${groupByClause}
    ${orderByClause};
  `;

  return sqlQuery.trim();
}

function addRow() {
  queryRows.value.push({
    type: "group",
    field: null,
    dataType: null,
    operator: null,
    value: null,
  });
}

function removeRow(index) {
  queryRows.value.splice(index, 1);
  generateQuery();
}

function onFieldSelected(index) {
  const selectedField = queryRows.value[index].field.value;
  const mapping = mappingsTable.find((m) => m.name === selectedField);
  if (mapping) {
    queryRows.value[index].dataType = mapping.type;
  } else {
    queryRows.value[index].dataType = null;
  }
  queryRows.value[index].value = null;
  queryRows.value[index].operator = null;
  onRowChange();
}

function onRowChange() {
  console.log("onRowChange");
  generateQuery();
}

function generateQuery() {
  const [filters, groupBy] = buildFiltersFromRows();

  console.log("generateQuery filters and groups: ", filters, groupBy);

  if (dateRange.value.from && dateRange.value.to) {
    filters.date = `${dateRange.value.from} AND ${dateRange.value.to}`;
  }

  generateQueryWithFilters(filters, groupBy);
}

function generateQueryWithFilters(filters, groupBy) {
  // Build the groupBy array depending on toggles
  // const groupBy = [];
  // if (sortBySubject.value) groupBy.push("subject");
  // if (sortByStatus.value) groupBy.push("status");
  // if (sortByVariant.value) groupBy.push("variant");

  try {
    const sql = buildSQLQueryWithMappings(filters, groupBy, mappingsTable);
    generatedQuery.value = sql;
    sendMessage("sql_query", "localhost", sql);
  } catch (e) {
    generatedQuery.value = `Error: ${e.message}`;
  }
}
</script>

<style scoped>
.query-builder-card {
  width: 90vw;
  max-width: 1200px;
  position: relative;
}

.query-builder-row {
  position: relative;
  display: flex;
  width: 100%;
}

.query-builder-row-content {
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
}

.query-builder-inputs-container {
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
  min-height: 40px;
  width: calc(100% - 40px);
}

.query-date-picker {
  width: 100%;
}

.selection-container {
  display: flex;
  flex-direction: column;
  width: 150px;
}

.selection-list {
  flex: 1;
}

.q-item.q-item--active {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.query-toggle-button {
  flex: 0 0 auto;
}

.query-field-dropdown {
  flex: 0 0 20%;
  max-width: 200px;
  min-width: 150px;
}

.query-value-dropdown {
  flex: 0 0 30%;
  max-width: 250px;
}

.query-operator-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.query-operator-dropdown {
  flex: 0 0 15%;
  max-width: 100px;
}

.query-value-input {
  flex: 0 0 25%;
  max-width: 150px;
}

.query-delete-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.query-filter-inputs {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: calc(100% - 40px);
}

.vertical-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background: #e1e1e1;
  border: 1px solid #ddd;
  border-radius: 0 4px 4px 0;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-text {
  font-weight: 500;
  font-size: 14px;
  padding: 4px 2px;
}

/* Remove margin from last item in each list */
.q-list .q-item:last-child {
  margin-bottom: 0 !important;
}

/* More compact item styling */
.compact-list .q-item {
  min-height: 25px;
  padding: 2px 8px;
}
</style>
