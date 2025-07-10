<template>
  <q-dialog v-model="dialogVisible">
    <q-card class="query-builder-card">
      <!-- Calendar Row (Always First) -->
      <q-card-section class="query-builder-row q-gutter-sm">
        <div class="query-builder-row-content">
          <div class="query-builder-inputs-container">
            <div class="query-date-picker">
              <div class="flex q-gutter-x-md">
                <q-date
                  v-model="dateRange"
                  multiple
                  range
                  minimal
                  outlined
                  label="Select Date Ranges"
                  @update:model-value="onDateChange"
                ></q-date>

                <div class="selection-container">
                  <q-list
                    dense
                    bordered
                    padding
                    class="rounded-borders selection-list"
                  >
                    <q-item
                      v-for="subject in availableValues.subject"
                      :key="subject"
                      clickable
                      v-ripple
                      :active="selectedSubjects.includes(subject)"
                      @click="toggleSubject(subject)"
                    >
                      <q-item-section>
                        {{ subject }}
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <q-btn
                    push
                    :color="sortBySubject ? 'primary' : 'white'"
                    :text-color="sortBySubject ? 'white' : 'primary'"
                    label="Sort by subject"
                    class="q-mt-sm full-width"
                    @click="toggleSort"
                  />

                  <!-- New single-select list box -->
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

                  <!-- Toggle button for sorting by status -->
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
                :options="availableValues[row.field?.value || row.field] || []"
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
          label="Add Row"
          color="primary"
          class="full-width"
          @click="addRow"
        ></q-btn>
      </q-card-section>

      <!-- Construct Query Button -->
      <q-card-section>
        <q-btn
          unelevated
          color="primary"
          class="full-width"
          label="Generate Query"
          @click="generateQuery"
        ></q-btn>
      </q-card-section>

      <!-- Display Generated Query -->
      <q-card-section>
        <div class="text-subtitle1">Generated Query:</div>
        <pre>{{ generatedQuery }}</pre>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fields: {
    type: Array,
    default: () => [],
  },
  availableValues: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

// Local state
const dialogVisible = ref(props.modelValue);
const dateRange = ref([]);
const selectedSubjects = ref([]);
const sortBySubject = ref(false);
const filterTrialType = ref("responses"); // "responses", "correct", "all"
const sortByStatus = ref(false);

const trialTypeOptions = [
  { label: "Only responses", value: "responses" },
  { label: "Only correct", value: "correct" },
  { label: "All trials", value: "all" },
];

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

function toggleSort() {
  sortBySubject.value = !sortBySubject.value;
  onRowChange();
}

function toggleSortByStatus() {
  sortByStatus.value = !sortByStatus.value;
  onRowChange();
}

const onDateChange = () => {
  generateQuery();
};

function buildFiltersFromRows() {
  const filters = {};

  // Row-based filters
  queryRows.value.forEach((row) => {
    if (row.type === "filter" && row.field) {
      const fieldName = row.field.value;
      if (row.dataType === "int") {
        filters[fieldName] = {
          operator: row.operator?.value,
          value: row.value,
        };
      } else {
        filters[fieldName] = row.value;
      }
    }
  });

  // Subject filters
  if (selectedSubjects.value.length > 0) {
    filters.subject = selectedSubjects.value;
  }

  // Trial Type filters based on filterTrialType
  console.log("checking trial type selection", filterTrialType.value);
  if (filterTrialType.value === "responses") {
    console.log("you chose responses");
    filters.status = { operator: ">=", value: 0 };
  } else if (filterTrialType.value === "correct") {
    console.log("you chose correct");
    filters.status = { operator: "=", value: 1 };
  }
  // "all" adds no status-based filter

  return filters;
}

function buildSQLQueryWithMappings(filters, groupBy, mappingsTable) {
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
  let dateWhereClause = "";
  if (dateRange.value) {
    const dateRanges = [];

    // Handle single range
    if (
      !Array.isArray(dateRange.value) &&
      dateRange.value.from &&
      dateRange.value.to
    ) {
      dateRanges.push(
        `(client_time::date BETWEEN '${dateRange.value.from}' AND '${dateRange.value.to}')`
      );
    }
    // Handle multiple ranges
    else if (Array.isArray(dateRange.value)) {
      dateRange.value.forEach((range) => {
        if (range.from && range.to) {
          dateRanges.push(
            `(client_time::date BETWEEN '${range.from}' AND '${range.to}')`
          );
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
  const filters = buildFiltersFromRows();
  if (dateRange.value.from && dateRange.value.to) {
    filters.date = `${dateRange.value.from} AND ${dateRange.value.to}`;
  }

  generateQueryWithFilters(filters);
}

function generateQueryWithFilters(filters) {
  // Build the groupBy array depending on toggles
  const groupBy = [];
  if (sortBySubject.value) groupBy.push("subject");
  if (sortByStatus.value) groupBy.push("status");

  try {
    const sql = buildSQLQueryWithMappings(filters, groupBy, mappingsTable);
    generatedQuery.value = sql;
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
  padding-right: 16px;
}

.query-builder-row {
  position: relative;
  display: flex;
  width: 100%;
  padding-right: 50px;
  margin-bottom: 8px;
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
</style>
