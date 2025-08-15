<template>
  <div v-if="Object.keys(commStatus).length">
    <div class="q-pa-md" style="width: 100%; overflow-x: auto">
      <q-list bordered class="rounded-borders">
        <q-expansion-item
          v-for="device in commStatus"
          :key="device.device"
          group="variantGroup"
          expand-separator
          header-class="text-primary"
        >
          <template v-slot:header>
            <div
              class="header-container row items-center justify-between full-width"
            >
              <!-- wifi and battery status -->
              <div class="col-auto" style="position: relative">
                <div class="icon-container">
                  <q-icon
                    :name="getLinkStatus(device.device) ? 'link' : 'link_off'"
                    :color="getLinkColor(device.device)"
                    size="24px"
                    class="q-pr-md"
                  ></q-icon>
                  <q-tooltip :delay="500">
                    {{ getPingSuccess(device.device) }}
                  </q-tooltip>
                </div>
                <div class="icon-container">
                  <q-icon
                    :name="getBatteryIcon(device.address)"
                    size="24px"
                    style="transform: rotate(-90deg)"
                  ></q-icon>
                  <q-tooltip :delay="500">
                    {{ getBatteryLevel(device.address) }}
                  </q-tooltip>
                </div>
              </div>

              <!-- Box and subject names -->
              <div class="col-auto">
                <div
                  class="host-text"
                  style="position: relative; display: inline-block"
                >
                  {{ device.device }}

                  <!-- only show tooltip if we have a screenshot for this device -->

                  <q-tooltip
                    v-if="imageSourcesByHost[device.address]?.screenshotSrc"
                    anchor="bottom middle"
                    self="top middle"
                  >
                    <img
                      :src="imageSourcesByHost[device.address].screenshotSrc"
                      alt="screenshot"
                      style="max-width: 200px; border-radius: 4px"
                    />
                  </q-tooltip>
                </div>

                <div class="subject-caption">
                  {{ getsubject(device.address) }}

                  <q-tooltip
                    v-if="imageSourcesByHost[device.address]?.photoCartoonSrc"
                    anchor="bottom middle"
                    self="top middle"
                  >
                    <img
                      :src="imageSourcesByHost[device.address].photoCartoonSrc"
                      alt="cartoon photo"
                      style="max-width: 200px; border-radius: 4px"
                    />
                  </q-tooltip>
                </div>
              </div>

              <!-- Play/stop icon -->
              <div class="col-auto" style="transform: translateX(4px)">
                <q-icon
                  :name="
                    getRunningStatus(device.address) ? 'play_arrow' : 'stop'
                  "
                  :color="getRunningStatus(device.address) ? 'green' : 'red'"
                  size="40px"
                ></q-icon>
              </div>

              <!-- Progress bar -->
              <div class="col text-center">
                <q-linear-progress
                  :value="getProgress(device.address)"
                  size="30px"
                  color="primary"
                  style="position: relative"
                >
                  <template v-slot:default>
                    <div class="progress-text">
                      {{ getTrialsComplete(device.address) }} /
                      {{ getTrialsInBlock(device.address) }}
                    </div>
                  </template>
                </q-linear-progress>
              </div>

              <!-- Timer: Concentric Circles -->
              <div
                class="col-auto concentric-circles"
                style="transform: translateY(8px) translateX(4px)"
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    width: 30px;
                    height: 40px;
                  "
                >
                  <div
                    class="circle-container"
                    style="position: relative; width: 30px; height: 30px"
                    @click.stop
                  >
                    <!-- Outer Circle for Seconds -->
                    <q-circular-progress
                      :value="getSecondsValue(device.address)"
                      :thickness="0.25"
                      size="24px"
                      :color="getTimerColor(device.address)"
                    >
                    </q-circular-progress>

                    <!-- Inner Circle for Minutes -->
                    <q-circular-progress
                      :value="getMinutesValue(device.address)"
                      :thickness="0.4"
                      size="14px"
                      style="position: absolute; top: 5px; left: 5px"
                      :color="getTimerColor(device.address)"
                    ></q-circular-progress>
                    <!-- Tooltip -->
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      {{ getFormattedTimeSinceLastEvent(device.address) }}
                    </q-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <q-card>
            <q-card-section>
              <div style="position: relative">
                <div
                  v-if="getLoadingDeviceStatus(device.address)"
                  class="loading-overlay items-center justify-center"
                >
                  <q-spinner-hourglass size="3em" color="primary" />
                </div>

                <div class="row align-items-center">
                  <div class="col-6 col-sm-6 q-mb-xs">
                    <q-select
                      outlined
                      :model-value="userSelections[device.address]?.subject"
                      :options="dropdowns[device.address]?.animalOptions || []"
                      :disable="
                        getRunningStatus(device.address) ||
                        getLoadingDeviceStatus(device.address)
                      "
                      label="Subject"
                      dense
                      @input-value="(val) => (inputValue = val)"
                      @update:model-value="
                        (val) =>
                          handleUserSelection(val, device.address, 'subject')
                      "
                    >
                      <template v-slot:selected-item="scope">
                        <div
                          class="hard-truncate"
                          :title="String(getSlotDisplayValue(scope.opt))"
                        >
                          {{ getSlotDisplayValue(scope.opt) }}
                        </div>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-6 col-sm-6 q-mb-xs">
                    <q-select
                      outlined
                      :model-value="userSelections[device.address]?.branch"
                      :options="dropdowns[device.address]?.branchOptions || []"
                      :disable="
                        getRunningStatus(device.address) ||
                        getLoadingDeviceStatus(device.address)
                      "
                      label="Branch"
                      dense
                    >
                      <template v-slot:option="scope">
                        <q-item
                          v-bind="scope.itemProps"
                          style="padding-left: 16px"
                          @click="
                            handleUserSelection(
                              scope.opt,
                              device.address,
                              'branch'
                            )
                          "
                        >
                          <q-item-section>
                            <q-item-label>{{ scope.opt }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:selected-item="scope">
                        <div
                          class="hard-truncate"
                          :title="String(getSlotDisplayValue(scope.opt))"
                        >
                          {{ getSlotDisplayValue(scope.opt) }}
                        </div>
                      </template>
                    </q-select>
                  </div>
                </div>
                <div class="row align-items-center">
                  <div class="col-4 col-sm-4 q-mb-xs">
                    <q-select
                      :model-value="userSelections[device.address]?.system"
                      :options="dropdowns[device.address]?.systemOptions || []"
                      :disable="
                        getRunningStatus(device.address) ||
                        getLoadingDeviceStatus(device.address)
                      "
                      label="System"
                      dense
                      @update:model-value="
                        (val) =>
                          handleUserSelection(val, device.address, 'system')
                      "
                    >
                      <template v-slot:selected-item="scope">
                        <div
                          class="hard-truncate"
                          :title="String(getSlotDisplayValue(scope.opt))"
                        >
                          {{ getSlotDisplayValue(scope.opt) }}
                        </div>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-4 col-sm-4 q-mb-xs">
                    <q-select
                      :model-value="userSelections[device.address]?.protocol"
                      :options="
                        dropdowns[device.address]?.protocolOptions || []
                      "
                      :disable="
                        getRunningStatus(device.address) ||
                        getLoadingDeviceStatus(device.address)
                      "
                      label="Protocol"
                      dense
                      @update:model-value="
                        (val) =>
                          handleUserSelection(val, device.address, 'protocol')
                      "
                    >
                      <template v-slot:selected-item="scope">
                        <div
                          class="hard-truncate"
                          :title="String(getSlotDisplayValue(scope.opt))"
                        >
                          {{ getSlotDisplayValue(scope.opt) }}
                        </div>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-4 col-sm-4 q-mb-xs">
                    <q-select
                      :model-value="userSelections[device.address]?.variant"
                      :options="dropdowns[device.address]?.variantOptions || []"
                      :disable="
                        getRunningStatus(device.address) ||
                        getLoadingDeviceStatus(device.address)
                      "
                      label="Variant"
                      dense
                      @update:model-value="
                        (val) =>
                          handleUserSelection(val, device.address, 'variant')
                      "
                    >
                      <template v-slot:selected-item="scope">
                        <div
                          class="hard-truncate"
                          :title="String(getSlotDisplayValue(scope.opt))"
                        >
                          {{ getSlotDisplayValue(scope.opt) }}
                        </div>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>
              <div>
                <div class="row justify-content-between">
                  <!-- Button to open task parameter picker -->
                  <q-btn
                    outline
                    color="grey-8"
                    class="bold-icon"
                    style="width: 48%; height: 55px"
                    label="Task parameters"
                    @click="openParamsDialog(device.address)"
                    :disable="getLoadingDeviceStatus(device.address)"
                  ></q-btn>

                  <!-- Button to open system parameter picker -->
                  <q-btn
                    outline
                    color="grey-8"
                    class="bold-icon"
                    style="width: 48%; height: 55px"
                    label="System parameters"
                    @click="openSystemParamsDialog(device.address)"
                    :disable="getLoadingDeviceStatus(device.address)"
                  ></q-btn>
                </div>
              </div>

              <div class="q-mt-md row items-center">
                <div class="col-12 col-sm-6 flex items-center">
                  <q-btn-toggle
                    :model-value="getRunningStatus(device.address)"
                    flat
                    spread
                    class="full-width"
                    style="height: 60px"
                    :options="[
                      { value: true, slot: 'running' },
                      { value: false, slot: 'stopped' },
                    ]"
                  >
                    <template v-slot:running>
                      <div
                        class="toggle-content full-width full-height q-pa-none cursor-pointer"
                        @click="toggleTask(true, device.address)"
                        :style="{
                          color: getRunningStatus(device.address)
                            ? 'green'
                            : 'black',
                        }"
                      >
                        <div class="text-center">Running</div>
                        <q-icon
                          name="play_arrow"
                          :color="
                            getRunningStatus(device.address) ? 'green' : 'black'
                          "
                        ></q-icon>
                      </div>
                    </template>
                    <template v-slot:stopped>
                      <div
                        class="toggle-content full-width full-height q-pa-none cursor-pointer"
                        @click="toggleTask(false, device.address)"
                        :style="{
                          color: !getRunningStatus(device.address)
                            ? 'red'
                            : 'black',
                        }"
                      >
                        <div class="text-center">Stopped</div>
                        <q-icon
                          name="stop"
                          :color="
                            !getRunningStatus(device.address) ? 'red' : 'black'
                          "
                        ></q-icon>
                      </div>
                    </template>
                  </q-btn-toggle>
                </div>
                <div class="col-6 col-sm-3 flex items-center">
                  <q-btn
                    flat
                    label="Reset"
                    text-color="black"
                    icon-right="restart_alt"
                    @click="resetTask(device.address)"
                    class="full-width"
                    style="height: 60px"
                  ></q-btn>
                </div>
                <div class="col-6 col-sm-3 flex items-center">
                  <q-btn
                    flat
                    label="Reward"
                    text-color="black"
                    icon-right="sym_o_water_drop"
                    @click="juice_reward(device.address)"
                    class="full-width"
                    style="height: 60px"
                  ></q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card
            flat
            bordered
            class="q-my-md q-mb-lg"
            style="width: 95%; margin: auto; margin-bottom: 20px"
          >
            <q-card-section>
              <q-markup-table flat dense>
                <table style="width: 100%">
                  <thead>
                    <tr>
                      <th></th>
                      <th style="text-align: left">
                        <strong>Performance</strong>
                      </th>
                      <th style="text-align: left">
                        <strong>Med. RT (ms)</strong>
                      </th>
                      <th style="text-align: left">
                        <strong>Aborted</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Filter perfStats based on device.device -->
                    <tr
                      v-for="(row, rowIndex) in getDevicePerfStats(
                        device.address
                      )"
                      :key="rowIndex"
                    >
                      <td>
                        <strong>{{ row.label }}</strong>
                      </td>
                      <td>{{ row.correct }}</td>
                      <td>{{ row.rt }}</td>
                      <td>{{ row.aborts }}</td>
                    </tr>
                  </tbody>
                </table>
              </q-markup-table>
            </q-card-section>
          </q-card>
          <q-separator></q-separator>
        </q-expansion-item>
      </q-list>
      <div class="row justify-content-end">
        <q-btn
          outline
          color="grey-5"
          icon="add"
          class="bold-icon full-width"
          style="width: 100%"
          @click="showAddOptionsDialog = true"
        ></q-btn>

        <q-dialog v-model="showAddOptionsDialog">
          <q-card class="full-width-card">
            <!-- First Row: Add Device -->
            <q-card-section class="row items-center q-gutter-sm">
              <div class="text-h6 col-2 label-margin">Add device:</div>
              <q-input
                v-model="newDeviceName"
                label="Device Name"
                outlined
                class="col-3"
              />
              <q-input
                v-model="newDeviceIP"
                label="IP Address"
                outlined
                class="col-3"
              />
              <q-btn
                flat
                label="Create"
                color="primary"
                @click="addNewDevice"
                class="col-2"
              />
            </q-card-section>

            <!-- Second Row: Add subject -->
            <q-card-section class="row items-center q-gutter-sm">
              <div class="text-h6 col-2 label-margin">Add subject:</div>
              <q-input
                v-model="newsubjectName"
                label="Name"
                outlined
                class="col-6"
              />
              <q-btn
                flat
                label="Create"
                color="primary"
                @click="addNewsubject"
                class="col-2"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
      <div class="row justify-content-end">
        <!-- Button to open Query Builder -->
        <q-btn
          outline
          color="grey-5"
          icon="sym_o_table"
          class="bold-icon full-width"
          style="width: 100%"
          @click="showQueryBuilderDialog = true"
        ></q-btn>
      </div>
    </div>

    <QueryDialog
      v-model="showQueryBuilderDialog"
      v-model:sql-table-response="sql_table_response"
      :listbox-options="listboxOptions"
      :fields="fields"
    />

    <q-dialog
      v-model="showParamsDialog"
      persistent
      @show="onTaskModalShow"
      @hide="onTaskModalHide"
    >
      <q-card class="modal-card">
        <q-card-section class="modal-header text-h6">
          Task Parameters
        </q-card-section>

        <div
          class="q-card__section q-card__section--vert modal-body"
          ref="taskModalBodyEl"
        >
          <div v-if="paramsForTask?.paramNames?.length">
            <div
              v-for="(name, idx) in paramsForTask.paramNames"
              :key="idx"
              class="q-mb-md"
            >
              <q-select
                :model-value="getTaskDisplayValue(name)"
                @update:model-value="markTaskAsEdited(name, $event)"
                :options="paramsForTask.paramOptions[name]"
                :label="name"
                :class="getTaskInputClass(name)"
                filled
                dense
                emit-value
                map-options
              >
                <template v-slot:selected>
                  {{
                    getLabelForValue(
                      getTaskDisplayValue(name),
                      paramsForTask.paramOptions[name]
                    )
                  }}
                </template>
              </q-select>
            </div>
          </div>
          <div v-else>
            <em>No parameter data found</em>
          </div>
        </div>

        <q-card-section class="modal-footer">
          <q-separator />
          <div class="row justify-end q-gutter-sm q-mt-sm">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="closeTaskParamsDialog"
            />
            <q-btn
              flat
              label="Save"
              color="primary"
              :disable="getRunningStatus(selectedHost)"
              @click="saveTaskParams"
            />
          </div>
        </q-card-section>
        <div v-if="showTaskScrollIndicator" class="scroll-indicator-wrapper">
          <q-icon
            name="keyboard_arrow_down"
            class="scroll-indicator"
            size="2.5em"
          />
        </div>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showSystemParamsDialog"
      persistent
      @show="onSystemModalShow"
      @hide="onSystemModalHide"
    >
      <q-card class="modal-card">
        <q-card-section class="modal-header text-h6">
          System Parameters
        </q-card-section>

        <div
          class="q-card__section q-card__section--vert modal-body"
          ref="systemModalBodyEl"
        >
          <div v-if="paramsForHost[selectedSystemHost]?.names?.length">
            <div
              v-for="(name, idx) in paramsForHost[selectedSystemHost].names"
              :key="idx"
              class="q-mb-md"
            >
              <q-input
                :modelValue="getDisplayValue(name)"
                @update:modelValue="markAsEdited(name, $event)"
                :label="name"
                :class="getInputClass(name)"
                filled
                dense
              />
            </div>
          </div>
          <div v-else>
            <em>No parameter data found</em>
          </div>
        </div>

        <q-card-section class="modal-footer">
          <q-separator />
          <div class="row justify-end q-gutter-sm q-mt-sm">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="closeSystemParamsDialog"
            />
            <q-btn
              flat
              label="Save"
              color="primary"
              @click="saveSystemTaskParams(selectedSystemHost)"
              :disable="getRunningStatus(selectedSystemHost)"
            />
          </div>
        </q-card-section>
        <div v-if="showSystemScrollIndicator" class="scroll-indicator-wrapper">
          <q-icon
            name="keyboard_arrow_down"
            class="scroll-indicator"
            size="2.5em"
          />
        </div>
      </q-card>
    </q-dialog>
  </div>

  <div v-if="screenshotSrc" class="q-pa-md">
    <h6>Latest Screenshot:</h6>
    <img
      :src="screenshotSrc"
      alt="Device screenshot"
      style="max-width: 100%; border: 1px solid #ccc; border-radius: 4px"
    />
  </div>

  <!-- {{ statusData }} -->
  <!-- <div>Selected system Host: {{ selectedSystemHost }}</div> -->
  <!-- <div>Selected param Host: {{ selectedHost }}</div> -->
</template>

<!--   {{ statusData }} -->
<!-- :available-values="availableValues" -->

<!-- <div
v-for="row in statusData.filter(
  (item) =>
    item.host === '192.168.4.102' && item.status_type === 'variant_info'
)"
:key="row.server_time"
>
{{ row }}
</div>
<div
v-if="
  !statusData.some(
    (item) =>
      item.host === '192.168.4.102' && item.status_type === 'variant_info'
  )
"
>
No matching data
</div> -->

<script setup>
import { ref, onMounted, onUnmounted, watch, h, computed, nextTick } from "vue"; // MIT License
import { useQuasar } from "quasar"; // MIT License
import useWebSocket, { sendMessage } from "src/composables/useWebSocket";
import QueryDialog from "src/components/QueryDialog.vue";

const thumbStyle = {
  right: "4px",
  borderRadius: "5px",
  backgroundColor: "#027be3",
  width: "5px",
  opacity: 0.75,
};

const barStyle = {
  right: "2px",
  borderRadius: "9px",
  backgroundColor: "#027be3",
  width: "9px",
  opacity: 0.2,
};

const $q = useQuasar(); // used for notifications

const statusData = ref([]);
const commStatus = ref([]);
const perfStatsFull = ref([]);
const dropdowns = ref({});
const userSelections = ref({});
const runningStatus = ref({});
const loadingDeviceStatus = ref({}); // Added for loading state
const showAddOptionsDialog = ref(false);
const showQueryBuilderDialog = ref(false);

const showParamsDialog = ref(false);
const paramNames = ref([]); // e.g. ["nr", "nplanks", ...]
const paramOptions = ref({}); // e.g. { nr: [50,100,200], nplanks: [1], ... }
const selectedParams = ref({}); // e.g. { nr: 50, nplanks: 1, ... }
const selectedHost = ref(null); // The host we want to configure
// Edited state for task parameters

const userEditedTaskValues = ref({});

const showSystemParamsDialog = ref(false);
const userSettings = ref({}); // Tracks user-entered settings for each host
const systemParamNames = ref([]);
const selectedSystemParams = ref({});
const selectedSystemHost = ref(null); // The host we want to configure
const userEditedValues = ref({});

// Refs for modal scroll indicators
const taskModalBodyEl = ref(null);
const systemModalBodyEl = ref(null);
const showTaskScrollIndicator = ref(false);
const showSystemScrollIndicator = ref(false);

// Track edited state for each parameter
const editedTaskParams = ref({});
const editedParams = ref({});

// Mark a task parameter as edited
const markTaskAsEdited = (name, newValue) => {
  editedTaskParams.value[name] = true;
  userEditedTaskValues.value[name] = newValue;
};

// Mark a parameter as edited
const markAsEdited = (name, newValue) => {
  editedParams.value[name] = true;
  userEditedValues.value[name] = newValue;
};

// Get the display value for a task parameter
const getTaskDisplayValue = (name) => {
  const liveValue = paramsForTask.value.selectedParams[name];
  const editedValue = userEditedTaskValues.value[name];
  return editedTaskParams.value[name] ? editedValue : liveValue;
};

// Get the display value for an input box
const getDisplayValue = (name) => {
  const liveValue = paramsForHost.value[selectedSystemHost.value]?.values[name];
  const editedValue = userEditedValues.value[name];
  return editedParams.value[name] ? editedValue : liveValue || "";
};

// Get dynamic class for a task parameter
const getTaskInputClass = (name) => {
  return editedTaskParams.value[name] ? "edited-param" : "live-param";
};

// Helper function to find a label for a given value among options
const getLabelForValue = (currentValue, optionsArray) => {
  if (!optionsArray || !Array.isArray(optionsArray)) {
    return currentValue; // Return value itself if no valid options array
  }

  const normalizeParamString = (str) => {
    if (typeof str !== "string") return str;
    // Remove space after '{' and before '}'
    return str.replace(/{\s+/g, "{").replace(/\s+}/g, "}").trim();
  };

  const normalizedCurrentValue = normalizeParamString(currentValue);

  // Try a match with normalized values
  let foundOption = optionsArray.find(
    (opt) => normalizeParamString(opt.value) === normalizedCurrentValue
  );
  if (foundOption) {
    return foundOption.label;
  }

  // If no full normalized match, try the tolerant brace-trimmed approach with normalized strings
  if (
    typeof normalizedCurrentValue === "string" &&
    normalizedCurrentValue.startsWith("{") &&
    normalizedCurrentValue.endsWith("}")
  ) {
    const currentValueCore = normalizedCurrentValue.slice(0, -1).trim(); // Remove last '}'

    foundOption = optionsArray.find((opt) => {
      const normalizedOptValue = normalizeParamString(opt.value);
      // Check if normalizedOptValue (which might be missing its '}') equals currentValueCore
      const isMatch = normalizedOptValue === currentValueCore;
      return isMatch;
    });

    if (foundOption) {
      return foundOption.label;
    }
  }

  return currentValue;
};

// Reset edited values for task parameters
const closeTaskParamsDialog = () => {
  editedTaskParams.value = {};
  userEditedTaskValues.value = {};
  showParamsDialog.value = false;
};

// Dynamic input class
const getInputClass = (name) => {
  return editedParams.value[name] ? "edited-param" : "live-param";
};

// Reset edited state when switching hosts
watch(selectedSystemHost, () => {
  editedParams.value = {};
  userEditedValues.value = {};
});

const handleTaskScroll = () => {
  showTaskScrollIndicator.value = false;
};

const onTaskModalShow = () => {
  setTimeout(() => {
    // If the ref is an array (due to v-for), find the one attached to the DOM
    const el = Array.isArray(taskModalBodyEl.value)
      ? taskModalBodyEl.value.find((e) => e.isConnected)
      : taskModalBodyEl.value;

    if (!el) return;

    if (el.scrollHeight > el.clientHeight) {
      showTaskScrollIndicator.value = true;
      el.addEventListener("scroll", handleTaskScroll, { once: true });
    }
  }, 100);
};

const onTaskModalHide = () => {
  // Simply reset the state; no need to touch the DOM element
  showTaskScrollIndicator.value = false;
};

const handleSystemScroll = () => {
  showSystemScrollIndicator.value = false;
};

const onSystemModalShow = () => {
  setTimeout(() => {
    // If the ref is an array (due to v-for), find the one attached to the DOM
    const el = Array.isArray(systemModalBodyEl.value)
      ? systemModalBodyEl.value.find((e) => e.isConnected)
      : systemModalBodyEl.value;

    if (!el) return;

    if (el.scrollHeight > el.clientHeight) {
      showSystemScrollIndicator.value = true;
      el.addEventListener("scroll", handleSystemScroll, { once: true });
    }
  }, 100);
};

const onSystemModalHide = () => {
  // Simply reset the state; no need to touch the DOM element
  showSystemScrollIndicator.value = false;
};

const newDeviceName = ref("");
const newDeviceIP = ref("");
const newsubjectName = ref("");
const currentTime = ref(Date.now());
const server_ip = window.location.hostname; // use this if the server is running on the same machine as the client
// const server_ip = "10.2.145.85"; // use this for testing
// const server_ip = "hb-server"; // or this
const ws_port = "8080";
const sql_table_response = ref([]);
const listboxOptions = ref({
  subject: [],
  system: [],
  protocol: [],
  variant: [],
  branch: [],
});

// if adding to fields, also add to components/QueryDialog.vue mappingsTable
const fields = [
  { label: "Side", value: "side" },
  { label: "Status", value: "status" },
  { label: "nhit", value: "nhit" },
  { label: "nplanks", value: "nplanks" },
  { label: "nonmatch_transparency", value: "nonmatch_transparency" },
];

function openParamsDialog(hostAddress) {
  selectedHost.value = hostAddress;
  showParamsDialog.value = true;
}

function openSystemParamsDialog(deviceAddress) {
  console.log("Opening dialog for device:", deviceAddress);
  console.log("paramsForHost:", paramsForHost.value);

  selectedSystemHost.value = deviceAddress;

  const deviceParams = paramsForHost.value[deviceAddress];
  if (!deviceParams) {
    console.error(`Device ${deviceAddress} not found in paramsForHost`);
    return;
  } else {
    console.log("Params for this device:", deviceParams);
  }

  // Ensure user settings are initialized
  if (!userSettings.value[deviceAddress]) {
    userSettings.value[deviceAddress] = {};
  }

  showSystemParamsDialog.value = true;
}

function closeSystemParamsDialog() {
  // Clear user settings for the selected host
  if (selectedSystemHost.value) {
    delete userSettings.value[selectedSystemHost.value];
  }

  editedParams.value = {};
  userEditedValues.value = {};

  // Close the dialog
  showSystemParamsDialog.value = false;
}

const imageSourcesByHost = computed(() => {
  const sources = {};
  if (!statusData.value || statusData.value.length === 0) {
    return sources;
  }

  statusData.value.forEach((e) => {
    if (!e.host || !e.status_type || !e.status_value) {
      return;
    }

    if (!sources[e.host]) {
      sources[e.host] = {
        screenshotSrc: null,
        photoCartoonSrc: null,
      };
    }

    const b64 = e.status_value.trim();
    const dataUri = b64.startsWith("data:")
      ? b64
      : `data:image/png;base64,${b64}`;

    if (e.status_type === "screenshot") {
      sources[e.host].screenshotSrc = dataUri;
    } else if (e.status_type === "photo_cartoon") {
      sources[e.host].photoCartoonSrc = dataUri;
    }
  });
  return sources;
});

const paramsForTask = computed(() => {
  if (!selectedHost.value) return null;

  const row = statusData.value.find(
    (item) =>
      item.host === selectedHost.value && item.status_type === "variant_info"
  );

  if (!row || !row.status_value) {
    return {
      paramNames: [],
      paramOptions: {},
      selectedParams: {},
    };
  }

  const fullStr = row.status_value;

  // Parse loader_arg_names
  const namesMatch = fullStr.match(/loader_arg_names\s*\{([^}]+)\}/);
  const paramNames = namesMatch ? namesMatch[1].trim().split(/\s+/) : [];

  // Parse loader_arg_options
  const optionsBlock = extractBlock(fullStr, "loader_arg_options {");
  console.log(
    `Processing param: ${paramNames[0]}, optionsBlock: '${optionsBlock}'`
  );

  const paramOptions = optionsBlock ? parseLoaderArgOptions(optionsBlock) : {};

  // Parse loader_args
  const argsBlock = extractBlock(fullStr, "loader_args {");
  const tokens = argsBlock ? splitByTopLevelSpaces(argsBlock) : [];
  const selectedParams = {};
  // paramNames.forEach((name, i) => {
  //   selectedParams[name] = tokens[i] || "";
  // });

  paramNames.forEach((name, i) => {
    let value = tokens[i] || "";

    // Remove space after '{' at the beginning
    if (value.startsWith("{ ")) {
      value = "{" + value.slice(2);
    }

    // Remove space before '}' at the end
    if (value.endsWith(" }")) {
      value = value.slice(0, -2) + "}";
    }

    selectedParams[name] = value;
  });

  return { paramNames, paramOptions, selectedParams };
});

const paramsForHost = computed(() => {
  const result = {};

  // Iterate over all hosts and compute their parameters
  statusData.value.forEach((item) => {
    if (item.status_type === "params" && item.status_value) {
      const params = item.status_value.split(" ");
      const hostParams = { names: [], values: {} };

      for (let i = 0; i < params.length; i += 2) {
        const key = params[i];
        const value = params[i + 1];
        hostParams.names.push(key);
        hostParams.values[key] = value;
      }

      result[item.host] = hostParams;
    }
  });

  return result;
});

const displayParams = computed(() => {
  const deviceParams = paramsForHost[selectedSystemHost.value];
  if (!deviceParams) return {};

  const { values } = deviceParams;

  // Combine user-entered settings with server-provided values
  return Object.keys(values).reduce((result, key) => {
    result[key] =
      userSettings.value[selectedSystemHost.value]?.[key] || values[key];
    return result;
  }, {});
});

function extractBlock(str, marker) {
  const startIndex = str.indexOf(marker);
  if (startIndex === -1) return null;

  const openCurlyIndex = str.indexOf("{", startIndex);
  if (openCurlyIndex === -1) return null;

  let depth = 0;
  let i = openCurlyIndex;
  const len = str.length;

  for (; i < len; i++) {
    if (str[i] === "{") {
      depth++;
    } else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return str.substring(openCurlyIndex + 1, i); // Exclude outer braces
      }
    }
  }
  return null; // If braces are unbalanced
}

function parseLoaderArgOptions(raw) {
  const result = {};

  // Match each parameter name and its entire options block
  const paramRegex = /(\w+)\s\{\{(.*?)\}\}(?=\s+\w+\s\{\{|$)/gs;
  let paramMatch;

  while ((paramMatch = paramRegex.exec(raw)) !== null) {
    const paramName = paramMatch[1];
    const optionsBlock = paramMatch[2];

    let extractedPairs = [];

    // ---- BEGIN NEW PARSING LOGIC ----
    let processedOptionsBlock = optionsBlock.trim();

    // Heuristic: Attempt to fix a potentially missing closing brace on the very last pair
    const lastOpenBrace = processedOptionsBlock.lastIndexOf("{");
    if (lastOpenBrace > -1) {
      // Check if this lastOpenBrace is indeed not closed by the end of the string
      // and that it's not an empty {} block which might be valid for some other param type
      const segmentAfterLastOpenBrace = processedOptionsBlock.substring(
        lastOpenBrace + 1
      );
      if (
        processedOptionsBlock.indexOf("}", lastOpenBrace) === -1 &&
        segmentAfterLastOpenBrace.trim() !== ""
      ) {
        // Ensure the segment is not empty and seems to contain content before adding a brace
        if (
          segmentAfterLastOpenBrace
            .trim()
            .split(/\s+/)
            .filter((s) => s.length > 0).length >= 1
        ) {
          processedOptionsBlock += "}";
        }
      }
    }

    if (processedOptionsBlock) {
      // Replace '}\s*{' with a unique delimiter, then split by it.
      // This handles cases like 'opt1} {opt2} {opt3}' correctly.
      const segments = processedOptionsBlock
        .replace(/}\s*{/g, "}|--DELIMITER--|{")
        .split("|--DELIMITER--|");

      extractedPairs = segments
        .map((segment) => {
          let cleanSegment = segment.trim();

          // Remove surrounding {} if present (e.g., '{opt2}' or first/last items if they have them)
          if (cleanSegment.startsWith("{") && cleanSegment.endsWith("}")) {
            cleanSegment = cleanSegment.slice(1, -1).trim();
          } else if (cleanSegment.endsWith("}")) {
            // Handles the first segment if it was like 'opt1}'
            cleanSegment = cleanSegment.slice(0, -1).trim();
          } else if (cleanSegment.startsWith("{")) {
            // Handles the last segment if it was like '{optN' (after heuristic fix or other malformation)
            cleanSegment = cleanSegment.slice(1).trim();
          }
          // If after all this, segment is empty, or became empty, skip.
          if (!cleanSegment) return null;

          const tokens = cleanSegment.split(/\s+/).filter((s) => s.length > 0);
          if (tokens.length === 0) return null;

          const label = tokens[0];
          let value = tokens.slice(1).join(" ").trim() || label; // Use label as value if no other tokens

          // Specific fix for values that are themselves braced structures
          if (
            value.startsWith("{") &&
            !value.endsWith("}") &&
            value.includes(" ")
          ) {
            // Check brace balance before appending.
            let openBraces = (value.match(/{/g) || []).length;
            let closeBraces = (value.match(/}/g) || []).length;
            if (openBraces > closeBraces) {
              value += "}";
            }
          }

          return { label, value };
        })
        .filter((pair) => pair && pair.label); // Filter out nulls or pairs without a label
    }
    // ---- END NEW PARSING LOGIC ----

    result[paramName] = extractedPairs;
  }

  return result;
}

function splitByTopLevelSpaces(inputStr) {
  const result = [];
  let depth = 0;
  let current = "";

  for (const c of inputStr) {
    if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
    }

    if (/\s/.test(c) && depth === 0) {
      if (current.trim()) {
        result.push(current.trim());
        current = "";
      }
    } else {
      current += c;
    }
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
}

function saveTaskParams() {
  if (!paramsForTask.value || !selectedHost.value) {
    console.error("No task parameters or host selected for saving.");
    return;
  }

  // Use userEditedTaskValues to package only user-edited values
  const userEdited = userEditedTaskValues.value;
  if (Object.keys(userEdited).length === 0) {
    console.error("No user-edited parameters to save.");
    return;
  }

  // Build the command using the edited parameters
  const paramsCommand = buildParamsCommand(userEdited);

  // Close the dialog
  showParamsDialog.value = false;

  // Send the updated parameters to the server
  sendMessage("esscmd", selectedHost.value, paramsCommand);

  // Reset edited state
  editedTaskParams.value = {};
  userEditedTaskValues.value = {};

  console.log(`Command sent to ${selectedHost.value}:`, paramsCommand);
}

function saveSystemTaskParams(deviceAddress) {
  // Check for user-edited values
  const userEdited = userEditedValues.value;
  if (Object.keys(userEdited).length === 0) {
    console.error("No user-edited values to save.");
    return;
  }

  let command = "::ess::set_params ";

  // For each parameter, add to the command string
  for (const [paramName, paramVal] of Object.entries(userEdited)) {
    command += `${paramName} ${paramVal} `;
  }

  // Trim trailing space
  command = command.trim();

  // Send the command to the server
  sendMessage("esscmd", deviceAddress, command);

  // Clear user-edited values
  editedParams.value = {};
  userEditedValues.value = {};

  // Close the dialog
  showSystemParamsDialog.value = false;

  console.log(`Command sent to ${deviceAddress}:`, command);
}

function buildParamsCommand(params) {
  // Start with the command prefix and opening brace
  let command = "::ess::set_variant_args {";

  // For each parameter
  for (const [paramName, paramVal] of Object.entries(params)) {
    command += `${paramName} ${paramVal} `;
  }

  // Remove trailing space and add closing brace
  const finalCommand = command.trim() + "}; ::ess::reload_variant";
  return finalCommand;
}

// Transform perfStatsFull data to include only rows with sys/protocol/variant as '*'
const perfStats = computed(() => {
  const groupedData = perfStatsFull.value.reduce((acc, entry) => {
    const {
      host,
      subject,
      status_type,
      pc,
      rt,
      trials,
      aborts,
      state_system,
      protocol,
      variant,
    } = entry;

    // Get user-selected data
    const userSelectedSubjects = userSelections.value[host]?.subject || [];
    const currentSystem = userSelections.value[host]?.system?.[0] || "*";
    const currentProtocol = userSelections.value[host]?.protocol?.[0] || "*";
    const currentVariant = userSelections.value[host]?.variant?.[0] || "*";

    // Filter by user-selected subjects
    if (!userSelectedSubjects.includes(subject)) {
      return acc;
    }

    // Initialize host if it doesn't exist
    if (!acc[host]) acc[host] = { block: null, hour: null, day: null };

    if (status_type === "block") {
      // Match system, protocol, and variant for block
      if (
        state_system === currentSystem &&
        protocol === currentProtocol &&
        variant === currentVariant
      ) {
        acc[host][status_type] = {
          label: "Block",
          correct: `${Math.round(
            pc * (trials - aborts * trials)
          )} / ${Math.round(trials - aborts * trials)} (${Math.round(
            pc * 100
          )}%)`,
          rt: Math.round(rt),
          aborts: `${Math.round(aborts * trials)}`,
        };
      }
    } else if (status_type === "hour" || status_type === "day") {
      // Wildcard logic for hour and day
      if (state_system === "*" && protocol === "*" && variant === "*") {
        acc[host][status_type] = {
          label: status_type.charAt(0).toUpperCase() + status_type.slice(1),
          correct: `${Math.round(
            pc * (trials - aborts * trials)
          )} / ${Math.round(trials - aborts * trials)} (${Math.round(
            pc * 100
          )}%)`,
          rt: Math.round(rt),
          aborts: `${Math.round(aborts * trials)}`,
        };
      }
    }

    return acc;
  }, {});

  return groupedData;
});

// Function to get perf stats for a specific device (by host)
function getDevicePerfStats(deviceName) {
  const deviceStats = perfStats.value[deviceName];
  return deviceStats
    ? [deviceStats.block, deviceStats.hour, deviceStats.day].filter(Boolean) // Filter out undefined entries
    : [];
}

function initializeDropdown(host) {
  if (!dropdowns.value[host]) {
    dropdowns.value[host] = {
      animalOptions: [],
      systemOptions: ["emcalib", "match_to_sample", "search"],
      protocolOptions: [],
      variantOptions: [],
      branchOptions: [],
    };
  }
}

function initializeSelection(host) {
  if (!userSelections.value[host]) {
    userSelections.value[host] = {
      subject: [""],
      system: "",
      protocol: "",
      variant: "",
      branch: "",
    };
  }
}

onMounted(() => {
  useWebSocket(
    $q,
    statusData,
    commStatus,
    perfStatsFull,
    server_ip,
    ws_port,
    sql_table_response,
    listboxOptions
  );

  watch(
    statusData,
    (newData) => {
      dropdowns.value = {};
      newData.forEach((entry) => {
        const { host, status_type, status_value } = entry;

        initializeDropdown(host);

        if (status_type && status_value !== undefined) {
          // Ensure status_value exists
          // console.log("new status_value: ", host);
          switch (status_type) {
            case "animalOptions":
              dropdowns.value[host].animalOptions = status_value.split(",");
              break;
            case "systems":
              dropdowns.value[host].systemOptions = status_value.split(" ");
              break;
            case "protocols":
              dropdowns.value[host].protocolOptions = status_value.split(" ");
              break;
            case "variants":
              dropdowns.value[host].variantOptions = status_value.split(" ");
              break;
            case "branches":
              dropdowns.value[host].branchOptions = status_value.split(" ");
              break;

            case "subject":
              initializeSelection(host);
              userSelections.value[host].subject = Array.isArray(status_value)
                ? status_value
                : [status_value];
              break;
            case "system":
              initializeSelection(host);
              userSelections.value[host].system = Array.isArray(status_value)
                ? status_value
                : [status_value];
              break;

            case "protocol":
              initializeSelection(host);
              userSelections.value[host].protocol = Array.isArray(status_value)
                ? status_value
                : [status_value];
              break;

            case "variant":
              initializeSelection(host);
              userSelections.value[host].variant = Array.isArray(status_value)
                ? status_value
                : [status_value];
              break;

            case "branch":
              initializeSelection(host);
              userSelections.value[host].branch = Array.isArray(status_value)
                ? status_value[0] // Assuming branch is single select
                : status_value;
              break;

            case "running":
              runningStatus.value[host] = status_value === "1";
              break;
            case "status": // Added to handle 'loading' status
              if (status_value === "loading") {
                loadingDeviceStatus.value[host] = true;
              } else {
                // Assuming any other status_value for 'status' type means loading is done or not applicable
                loadingDeviceStatus.value[host] = false;
              }
              break;
          }
        }
      });
    },
    { deep: true }
  );
});

function handleUserSelection(val, host, type) {
  if (!userSelections[host]) {
    userSelections[host] = {};
  }
  if (type === "subject" && !Array.isArray(userSelections[host].subject)) {
    userSelections[host].subject = [];
  }

  console.log(val, host, type);

  // const commEntry = commStatus.value.find((entry) => entry.device === host);
  // const ipAddress = commEntry ? commEntry.address : "";

  let msg = "";
  switch (type) {
    case "subject":
      msg = `::ess::set_subject ${val}`;
      break;
    case "system":
      // Only system is specified
      msg = `::ess::load_system ${val}`;
      break;
    case "protocol":
      // System and protocol specified, using the new protocol value
      const systemForProtocol = userSelections.value[host].system;
      msg = `::ess::load_system ${systemForProtocol} ${val}`;
      break;
    case "variant":
      // System, protocol, and variant specified, using the new variant value
      const systemForVariant = userSelections.value[host].system;
      const protocolForVariant = userSelections.value[host].protocol;
      msg = `::ess::load_system ${systemForVariant} ${protocolForVariant} ${val}`;
      break;
    case "branch":
      // Construct the command with the selected branch
      console.log(`Branch selected: ${val} for host: ${host}`);

      const system = userSelections.value[host]?.system || "";
      const protocol = userSelections.value[host]?.protocol || "";
      const variant = userSelections.value[host]?.variant || "";

      const command = `send git ::git::switch_and_pull ${val}; ::ess::stop; ::ess::load_system ${system} ${protocol} ${variant}`;
      sendMessage("esscmd", host, command);
      // msg is not set here, direct send
      break;
    default:
      console.warn(`Unknown selection type: ${type}`);
  }

  if (msg) {
    console.log("sending", host, msg);
    sendMessage("esscmd", host, msg);
  }
}

function getsubject(host) {
  const entry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "subject"
  );
  return entry ? entry.status_value : "Unknown";
}

function getRunningStatus(host) {
  // if (host == "192.168.4.201") {
  //   console.log("host: ", host, " runningStatus: ", runningStatus.value[host]);
  // }
  return runningStatus.value[host] || false;
}

function getTrialsComplete(host) {
  // if block was just created (not started and nothing completed yet) return 0, otherwise return obs_id+1
  // Find the entry with status_type "running" and matching host
  const runningEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "running"
  );

  // Find the entry with status_type "obs_id" and matching host
  const obsIdEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "obs_id"
  );

  // Extract their status values or default to 0 if not found
  const runningValue =
    runningEntry && !isNaN(runningEntry.status_value)
      ? parseInt(runningEntry.status_value, 10)
      : 0;
  const obsIdValue =
    obsIdEntry && !isNaN(obsIdEntry.status_value)
      ? parseInt(obsIdEntry.status_value, 10)
      : 0;

  // Return 0 if both runningValue and obsIdValue are 0, otherwise return obsIdValue + 1
  return runningValue === 0 && obsIdValue === 0 ? 0 : obsIdValue + 1;
}

function getTrialsInBlock(host) {
  const entry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "obs_total"
  );
  return entry && !isNaN(entry.status_value)
    ? parseInt(entry.status_value, 10)
    : 0;
}

function getProgress(host) {
  const completed = getTrialsComplete(host);
  const total = getTrialsInBlock(host);
  return total > 0 ? completed / total : 0;
}

function toggleTask(value, host) {
  sendMessage("esscmd", host, value ? "::ess::start" : "::ess::stop");
}

function resetTask(host) {
  const systemForVariant = userSelections.value[host].system;
  const protocolForVariant = userSelections.value[host].protocol;
  const variant = userSelections.value[host].variant;
  const msg = `::ess::load_system ${systemForVariant} ${protocolForVariant} ${variant}`;
  sendMessage("esscmd", host, "::ess::stop");
  sendMessage("esscmd", host, msg);
}

function juice_reward(host) {
  const msg = `::ess::reward 1`;
  sendMessage("esscmd", host, msg);
}

let timer;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000); // Update every second
});

onUnmounted(() => {
  clearInterval(timer);
});

function getTimeSinceLastEvent(device) {
  const entry = statusData.value.find((item) => {
    return item.host === device && item.status_type === "last_completed";
  });

  if (!entry) {
    return 0; // Default to 0 if no entry is found
  }

  const lastEventTimeUTC = new Date(entry.status_value).getTime();
  return currentTime.value - lastEventTimeUTC; // Difference in milliseconds
}

function getSecondsValue(device) {
  const timeElapsed = getTimeSinceLastEvent(device);
  let seconds = Math.min(timeElapsed / 1000, 60); // Cap at 60 seconds
  return (seconds / 60) * 100; // Convert to percentage of a minute
}

function getMinutesValue(device) {
  const timeElapsed = getTimeSinceLastEvent(device);
  if (timeElapsed < 60000) {
    return 0;
  }
  const minutes = Math.min(timeElapsed / 60000, 60); // Cap at 60 minutes
  return (minutes / 60) * 100; // Convert to percent of an hour
}

function getColorBasedOnValue(value) {
  return value < 10
    ? "green"
    : value < 20
    ? "light-green"
    : value < 30
    ? "lime"
    : value < 40
    ? "yellow"
    : value < 50
    ? "amber"
    : value < 60
    ? "orange"
    : value < 70
    ? "deep-orange"
    : "red";
}

function getTimerColor(device) {
  const value = getSecondsValue(device);
  return getColorBasedOnValue(value);
}

function getFormattedTimeSinceLastEvent(device) {
  const timeElapsed = getTimeSinceLastEvent(device);
  const totalSeconds = Math.floor(timeElapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function addNewDevice() {
  // Trim and check device name length
  const deviceName = newDeviceName.value.trim();
  const deviceIP = newDeviceIP.value.trim();

  // Check if device name is empty or exceeds 255 characters
  if (!deviceName || deviceName.length > 255) {
    $q.notify({
      type: "negative",
      message: "Device name is required and must be 255 characters or less.",
    });
    return;
  }

  // IP address validation regex
  const ipOrHostnameRegex =
    /^(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9-]+\.(local))$/;

  if (!ipOrHostnameRegex.test(deviceIP)) {
    $q.notify({
      type: "negative",
      message:
        "IP address must IPv4 or hostname (e.g., 10.1.1.1 or [name].local)",
    });
    return;
  }

  console.log("Adding new device", deviceName, deviceIP);

  sendMessage("AddDevice", deviceIP, deviceName);

  // Close dialog and reset values if validation passes
  showAddOptionsDialog.value = false;
  newDeviceName.value = "";
  newDeviceIP.value = "";
}

function addNewsubject() {
  console.log("adding new subject", newsubjectName.value);
  sendMessage("Addsubject", "", newsubjectName.value);
  showAddOptionsDialog.value = false; // Close the dialog
  newsubjectName.value = "";
}

function getLinkStatus(host) {
  return commStatus.value.some(
    (entry) => entry.device === host && entry.server_time === entry.last_ping
  );
}

function getPingSuccess(host) {
  const entry = commStatus.value.find((entry) => entry.device === host);
  if (entry) {
    return entry.ping_success;
  }
}

function getLinkColor(host) {
  const entry = commStatus.value.find((entry) => entry.device === host);
  if (entry && entry.server_time === entry.last_ping) {
    return entry.ping_success > 0.99 ? "green" : "yellow";
  }
  return "red";
}

function calculateBatteryPercent(maxV, currentV) {
  if (currentV > maxV - 5) {
    return 100 - (80 / 5) * (maxV - currentV);
  } else if (currentV >= maxV - 8) {
    return 20 - (20 / 3) * (maxV - 5 - currentV);
  } else {
    return 0; // Below maxV - 8 volts, percentage is 0
  }
}

function getBatteryLevel(host) {
  const currentEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "24v-v"
  );
  const maxEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "24v-v-max"
  );

  if (currentEntry && maxEntry) {
    const currentV = parseFloat(currentEntry.status_value);
    const maxV = parseFloat(maxEntry.status_value);
    const batteryPercent = calculateBatteryPercent(maxV, currentV);

    // Calculate remaining time based on percentage and total battery life
    const totalBatteryLifeHours = 11;
    const timeRemainingHours = (batteryPercent / 100) * totalBatteryLifeHours;

    // Format output for tooltip
    return `${batteryPercent.toFixed(0)}% (${timeRemainingHours.toFixed(
      1
    )} hours remaining)`;
  } else {
    return "N/A"; // If either voltage is missing
  }
}

function getBatteryIcon(host) {
  const currentEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "24v-v"
  );
  const maxEntry = statusData.value.find(
    (entry) => entry.host === host && entry.status_type === "24v-v-max"
  );

  if (currentEntry && maxEntry) {
    const currentV = parseFloat(currentEntry.status_value);
    const maxV = parseFloat(maxEntry.status_value);
    const batteryPercent = calculateBatteryPercent(maxV, currentV);

    const chargingEntry = statusData.value.find(
      (entry) => entry.host === host && entry.status_type === "charging"
    );

    let isCharging;
    if (chargingEntry) {
      isCharging = chargingEntry.status_value === "1";
    } else {
      const current = Math.abs(
        parseFloat(
          statusData.value.find(
            (entry) => entry.host === host && entry.status_type === "24v-a"
          )?.status_value || "0"
        )
      );
      isCharging = current >= 0.1;
    }

    // Choose icon based on charging state and battery percent
    if (!isCharging) {
      // When not charging
      if (batteryPercent > 88) return "battery_full";
      else if (batteryPercent > 76) return "battery_6_bar";
      else if (batteryPercent > 64) return "battery_5_bar";
      else if (batteryPercent > 52) return "battery_4_bar";
      else if (batteryPercent > 40) return "battery_3_bar";
      else if (batteryPercent > 28) return "battery_2_bar";
      else if (batteryPercent > 16) return "battery_1_bar";
      else return "battery_alert";
    } else {
      // When charging
      if (batteryPercent > 88) return "battery_charging_full";
      else if (batteryPercent > 76) return "sym_o_battery_charging_90";
      else if (batteryPercent > 64) return "sym_o_battery_charging_80";
      else if (batteryPercent > 52) return "sym_o_battery_charging_50";
      else if (batteryPercent > 40) return "sym_o_battery_charging_30";
      else return "sym_o_battery_charging_20";
    }
  }

  return "battery_unknown"; // Default if no data available
}

const getSlotDisplayValue = (opt) => {
  if (Array.isArray(opt) && opt.length > 0) {
    return opt[0];
  }
  return opt === null || typeof opt === "undefined" ? "" : opt;
};

function getLoadingDeviceStatus(host) {
  return !!loadingDeviceStatus.value[host];
}
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 2px; /* Tiny padding to separate the contents slightly */
}

.col-6 {
  flex: 0 0 50%; /* Take up 50% on smaller screens */
  max-width: 50%;
  padding-inline: 2px; /* Tiny inline padding */
}

.col-3,
.col-sm-3 {
  padding-inline: 2px;
}

@media (min-width: 576px) {
  .col-sm-3 {
    flex: 0 0 25%; /* Take up 25% only on larger screens */
    max-width: 25%;
  }
}

/* Other styles */
.host-text {
  font-weight: bold;
  color: #000;
  font-size: 1.1em;
}

.subject-caption {
  width: 60px;
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden;
  text-overflow: ellipsis; /* Adds ellipsis if the text is too long */
  font-size: 0.9em;
  color: #6c757d;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-weight: bold;
  font-size: 12px;
}

.bold-icon .q-icon {
  font-weight: 900; /* Thicker lines for the icon */
}

.full-width-card {
  width: 100vw; /* Full viewport width */
  max-width: none; /* Remove default max-width */
}

.label-margin {
  margin-left: 16px; /* Adjust the value as needed */
}

.small-toggle {
  margin: 0 !important;
  padding: 0 !important;
}

.toggle-content {
  display: flex;
  align-items: center;
  justify-content: center; /* Center-aligns text and icon */
  gap: 4px; /* Adjusts spacing between text and icon */
}

/* Styles for live and user-edited inputs */
.live-param {
  background-color: #f0f0ff; /* Light grey for live-updating inputs */
  color: black;
}

.edited-param {
  background-color: #ffeeba; /* Light yellow for user-edited inputs */
  color: #856404; /* Darker text for contrast */
}

.live-param {
  background-color: rgb(255, 255, 255); /* Default live-updating color */
}

.edited-param {
  background-color: rgb(255, 251, 214); /* Edited color for user changes */
}

.hard-truncate {
  display: block; /* Ensures it takes the full width of its container */
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip; /* Cuts off text without ellipsis */
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; /* Ensure it's on top */
}

/* Modal Dialog Styles */
.modal-card {
  width: 350px;
  max-width: 80vw;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  position: relative; /* Set as the positioning context for the chevron */
}

.modal-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  padding-bottom: 8px;
  text-align: center;
}

.modal-body {
  flex: 1;
  overflow-y: scroll;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: #027be3 #e0e0e0;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: #027be3;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.modal-footer {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 2;
  padding-top: 0;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-8px);
  }
}

.scroll-indicator-wrapper {
  position: absolute;
  bottom: 55px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.scroll-indicator {
  color: #bdbdbd;
  animation: bounce 2s infinite;
  z-index: 10; /* Ensure it's on top of the content */
}
</style>
