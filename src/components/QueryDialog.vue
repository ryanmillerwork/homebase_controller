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
                  label="Group by date"
                  class="q-mt-sm full-width"
                  @click="
                    sortByDate = !sortByDate;
                    onRowChange();
                  "
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
                            v-for="subject in listboxOptions.subjects"
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
                    label="Group by subject"
                    class="q-mt-sm full-width"
                    @click="
                      sortBySubject = !sortBySubject;
                      onRowChange();
                    "
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
                    label="Group by Status"
                    class="q-mt-sm full-width"
                    @click="
                      sortByStatus = !sortByStatus;
                      onRowChange();
                    "
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
                            v-for="system in listboxOptions.systems"
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
                            v-for="protocol in listboxOptions.protocols"
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
                            v-for="variant in listboxOptions.variants"
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
                    label="Group by Variant"
                    class="q-mt-sm full-width"
                    @click="
                      sortByVariant = !sortByVariant;
                      onRowChange();
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-btn
        push
        label="Remove all filters"
        class="full-width"
        text-color="red"
        color="white"
        @click="removeAllFilters"
      />
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
                { label: 'Group by', value: 'group' },
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
      <q-card-section class="q-pb-none">
        <!-- q-pb-none removes bottom padding -->
        <div class="q-px-md">
          <!-- Maintain consistent padding with table/graph -->
          <q-btn-toggle
            v-model="viewMode"
            spread
            class="full-width"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { label: 'Table', value: 'table' },
              { label: 'Graph', value: 'graph' },
            ]"
          />
          <div
            v-if="
              viewMode === 'graph' && (!chartSeries || chartSeries.length === 0)
            "
            class="text-amber-700 text-center q-mt-md"
          >
            To view the graph, please enable "Sort by date" in the options
            above.
          </div>
        </div>
      </q-card-section>

      <!-- Table section -->
      <q-card-section v-show="viewMode === 'table'">
        <div class="q-pa-md">
          <q-table
            style="height: 400px"
            flat
            bordered
            :rows="localRows"
            :columns="columns"
            row-key="index"
            dense
            virtual-scroll
            v-model:pagination="pagination"
            :rows-per-page-options="[0]"
          />
        </div>
      </q-card-section>

      <!-- Graph section -->
      <q-card-section v-show="viewMode === 'graph'">
        <div class="q-pa-md">
          <apexchart
            v-if="chartSeries.length > 0"
            type="line"
            height="350"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, toRef, toRefs } from "vue";
import { sendMessage } from "src/composables/useWebSocket";
// import VueApexCharts from "vue3-apexcharts";

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
      subjects: [],
      systems: [],
      protocols: [],
      variants: [],
    }),
  },
  sqlTableResponse: {
    type: Array, // Adjust the type as needed
    required: true,
  },
});

const pagination = ref({
  // pagination properties like
  page: 1,
  rowsPerPage: 10,
  // etc
});

const viewMode = ref("table"); // Default to table view
const sqlTableResponse = toRef(props, "sqlTableResponse");
const { listboxOptions } = toRefs(props);
const emit = defineEmits([
  "update:modelValue",
  "update:sqlTableResponse",
  "update:listboxOptions",
]);

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

  const sample = sqlTableResponse.value[0];
  const specialCases = {
    ms: "ms",
    rt: "RT",
  };

  return Object.keys(sample).map((key) => {
    const sampleValue = sample[key];

    // Detect if it's a date
    const isDateField =
      sampleValue instanceof Date ||
      (typeof sampleValue === "string" && !isNaN(Date.parse(sampleValue)));

    // Detect if it's numeric (even if stored as string)
    const numericVal = parseFloat(sampleValue);
    const isNumericField =
      !isNaN(numericVal) &&
      sampleValue !== null &&
      sampleValue !== "" &&
      !isDateField;

    return {
      name: key,
      field: key,
      align: "center",
      // Transform key into a nicer label
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

      sortable: true,

      // If it's a date, do date formatting & date sorting
      format: isDateField ? (val) => (val ? val.split("T")[0] : "") : undefined,
      sort: isDateField
        ? (a, b) => new Date(a) - new Date(b)
        : isNumericField
        ? // If numeric, do numeric sorting
          (a, b) => parseFloat(a) - parseFloat(b)
        : undefined,

      classes: isDateField ? "date-column" : undefined,
    };
  });
});

// Rows are the same as sqlTableResponse
// const rows = computed(() => sqlTableResponse.value || []);

const localRows = computed({
  get: () => props.sqlTableResponse,
  set: (value) => emit("update:sqlTableResponse", value),
});

const getDateColumn = computed(() => {
  const dateCol = columns.value.find((col) => col.classes === "date-column");
  console.log("Date column found:", dateCol); // Debug log
  return dateCol;
});

const getPercentCorrectColumn = computed(() => {
  const percentCol = columns.value.find((col) =>
    col.name.toLowerCase().includes("% correct")
  );
  console.log("Percent correct column found:", percentCol); // Debug log
  return percentCol;
});

// Let's see what columns we're identifying as sorting columns
const getSortingColumns = computed(() => {
  // Debug log to see all columns and their properties
  console.log(
    "All columns:",
    columns.value.map((col) => ({
      name: col.name,
      label: col.label,
      classes: col.classes,
    }))
  );

  return columns.value.filter((col) => {
    const name = col.name.toLowerCase();

    // These are the columns we want to exclude from sorting
    const isSpecialColumn =
      col.classes === "date-column" || // date column
      name.includes("% correct") || // percent correct
      name === "rt (ms)" || // RT column
      name === "trials"; // Trials column

    // Debug which columns are being filtered and why
    console.log(`Column ${col.name}: excluded=${isSpecialColumn}`);

    return !isSpecialColumn;
  });
});

const chartSeries = computed(() => {
  const dateColumn = getDateColumn.value;
  const percentColumn = getPercentCorrectColumn.value;
  const sortingColumns = getSortingColumns.value;

  // If we don't have the required columns, return empty series
  if (!dateColumn || !percentColumn || !localRows.value?.length) {
    return [];
  }

  // If we have no sorting columns, create a single series for % Correct
  if (sortingColumns.length === 0) {
    const data = localRows.value
      .map((row) => {
        const dateStr = row[dateColumn.name];
        // FIX: Append time and timezone info to avoid UTC conversion issues
        const date = new Date(dateStr + "T00:00:00");
        const value = parseFloat(row[percentColumn.name]);
        return { x: date, y: value };
      })
      .sort((a, b) => a.x - b.x); // Ensure data is sorted by date

    return [{ name: percentColumn.label, data }];
  }

  // If we have sorting columns, create a series for each unique combination
  const seriesMap = new Map();

  localRows.value.forEach((row) => {
    // Create a unique key for the series
    const seriesKey = sortingColumns
      .map((col) => row[col.name])
      .filter(Boolean) // Remove null/undefined values
      .join(" - ");

    // If the key is empty, skip this row
    if (!seriesKey) return;

    // Get or create the series array
    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, []);
    }
    const seriesData = seriesMap.get(seriesKey);

    // Add the data point
    const dateStr = row[dateColumn.name];
    // FIX: Append time and timezone info to avoid UTC conversion issues
    const date = new Date(dateStr + "T00:00:00");
    const value = parseFloat(row[percentColumn.name]);

    seriesData.push({ x: date, y: value });
  });

  // Convert map to array and sort each series by date
  return Array.from(seriesMap.entries()).map(([name, data]) => ({
    name,
    data: data.sort((a, b) => a.x - b.x),
  }));
});

// Update chart options to handle multiple series
const chartOptions = computed(() => {
  const dateColumn = getDateColumn.value;
  const percentColumn = getPercentCorrectColumn.value;

  if (!dateColumn || !percentColumn) {
    return { chart: { type: "line" } };
  }

  return {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      padding: {
        right: 20, // Add padding at the chart level
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: false,
        datetimeUTC: false,
        format: "MMM dd",
        formatter: function (value) {
          return new Date(value).toLocaleDateString();
        },
        trim: false,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      // Removed duplicate keys for clarity
      position: "bottom",
      crosshairs: {
        show: true,
      },
      tooltip: {
        enabled: true,
      },
      tickPlacement: "on", // Change from "between" to "on"
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value.toFixed(1)}%`,
      },
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    // Configure the legend
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      floating: false,
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        strokeColor: "#fff",
        radius: 12,
      },
      onItemClick: {
        toggleDataSeries: true, // Enable clicking to show/hide series
      },
      onItemHover: {
        highlightDataSeries: true, // Highlight series when hovering over legend
      },
    },
    // Configure different colors for each line
    colors: [
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#3F51B5",
      "#546E7A",
      "#D4526E",
      "#8D5B4C",
      "#F86624",
    ],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `${value.toFixed(1)}%`,
      },
    },
  };
});

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
  {
    name: "nhit",
    path: "(trialinfo->'stiminfo'->>'nhit')",
    type: "int",
    defaultAlias: "nhit",
  },
  {
    name: "nplanks",
    path: "(trialinfo->'stiminfo'->>'nplanks')",
    type: "int",
    defaultAlias: "nplanks",
  },
  {
    name: "nonmatch_transparency",
    path: "(trialinfo->'stiminfo'->>'nonmatch_transparency')",
    type: "float",
    defaultAlias: "nonmatch_transparency",
  },
];

function removeAllFilters() {
  dateRange.value = [];
  selectedSubjects.value = [];
  selectedSystems.value = [];
  selectedProtocols.value = [];
  selectedVariants.value = [];
  filterTrialType.value = "responses";
  sortBySubject.value = false;
  sortByDate.value = false;
  sortByStatus.value = false;
  sortByVariant.value = false;

  emit("update:sqlTableResponse", []);

  emit("update:listboxOptions", {
    subjects: [],
    systems: [],
    protocols: [],
    variants: [],
  });
}

function toggleSubject(subject) {
  if (selectedSubjects.value.includes(subject)) {
    selectedSubjects.value = selectedSubjects.value.filter(
      (s) => s !== subject
    );
  } else {
    selectedSubjects.value.push(subject);
  }
  onRowChange();
  getSystemsOnSubject();
}

function toggleSystem(system) {
  if (selectedSystems.value.includes(system)) {
    selectedSystems.value = selectedSystems.value.filter((s) => s !== system);
  } else {
    selectedSystems.value.push(system);
  }
  onRowChange();
  getProtocolsOnSystem();
}

function toggleProtocol(protocol) {
  if (selectedProtocols.value.includes(protocol)) {
    selectedProtocols.value = selectedProtocols.value.filter(
      (s) => s !== protocol
    );
  } else {
    selectedProtocols.value.push(protocol);
  }
  onRowChange();
  getVariantsOnProtocol();
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

const onDateChange = () => {
  getSubjectsOnDate();
  generateQuery();
};

function getDistinct(column, alias, whereClause) {
  const sql = `
   SELECT ARRAY_AGG(DISTINCT ${column}) as ${alias}
   FROM server_trial
   WHERE ${whereClause}`;

  sendMessage(`get_options`, "localhost", sql);
}

function getSubjectsOnDate() {
  let whereClause = getDateWhereClause();

  getDistinct("subject", "subjects", whereClause);
  getDistinct("state_system", "systems", whereClause);
  getDistinct("protocol", "protocols", whereClause);
  getDistinct("variant", "variants", whereClause);
}

function getSystemsOnSubject() {
  let whereClause = getDateWhereClause();
  whereClause = appendWhereClause(whereClause, selectedSubjects, "subject");

  getDistinct("state_system", "systems", whereClause);
  getDistinct("protocol", "protocols", whereClause);
  getDistinct("variant", "variants", whereClause);
}

function getProtocolsOnSystem() {
  let whereClause = getDateWhereClause();
  whereClause = appendWhereClause(whereClause, selectedSubjects, "subject");
  whereClause = appendWhereClause(whereClause, selectedSystems, "state_system");

  getDistinct("protocol", "protocols", whereClause);
  getDistinct("variant", "variants", whereClause);
}

function getVariantsOnProtocol() {
  let whereClause = getDateWhereClause();
  whereClause = appendWhereClause(whereClause, selectedSubjects, "subject");
  whereClause = appendWhereClause(whereClause, selectedSystems, "state_system");
  whereClause = appendWhereClause(whereClause, selectedProtocols, "protocol");

  getDistinct("variant", "variants", whereClause);
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

function getDateWhereClause() {
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
  return dateWhereClause;
}

function appendWhereClause(whereClause, selected, column) {
  if (selected.value.length > 0) {
    const list = selected.value.map((item) => `'${item}'`).join(", ");
    return whereClause !== ""
      ? `${whereClause} AND ${column} IN (${list})`
      : `WHERE ${column} IN (${list})`;
  }
  return whereClause;
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

  const dateWhereClause = getDateWhereClause();

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
