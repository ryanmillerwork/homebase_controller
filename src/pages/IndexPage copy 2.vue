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
                <div class="host-text">{{ device.device }}</div>
                <div class="subject-caption">
                  {{ getsubject(device.address) }}
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
              <div class="row align-items-center">
                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    outlined
                    class="text-truncate"
                    :model-value="userSelections[device.address]?.subject"
                    :options="dropdowns[device.address]?.animalOptions || []"
                    :disable="getRunningStatus(device.address)"
                    label="Subject"
                    dense
                    @input-value="(val) => (inputValue = val)"
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.address, 'subject')
                    "
                  />
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.address]?.system"
                    :options="dropdowns[device.address]?.systemOptions || []"
                    :disable="getRunningStatus(device.address)"
                    label="System"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.address, 'system')
                    "
                  ></q-select>
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.address]?.protocol"
                    :options="dropdowns[device.address]?.protocolOptions || []"
                    :disable="getRunningStatus(device.address)"
                    label="Protocol"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.address, 'protocol')
                    "
                  ></q-select>
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.address]?.variant"
                    :options="dropdowns[device.address]?.variantOptions || []"
                    :disable="getRunningStatus(device.address)"
                    label="Variant"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.address, 'variant')
                    "
                  ></q-select>
                </div>
              </div>

              <div class="q-mt-md row items-center">
                <div class="col-12 col-sm-8 flex items-center">
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
                <div class="col-12 col-sm-4 flex items-center">
                  <q-btn
                    flat
                    label="Reset"
                    color="white"
                    text-color="black"
                    icon-right="restart_alt"
                    @click="resetTask(device.address)"
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
          icon="table"
          class="bold-icon full-width"
          style="width: 100%"
          @click="showQueryBuilderDialog = true"
        ></q-btn>
        <QueryDialog
          v-model="showQueryBuilderDialog"
          :fields="fields"
          :available-values="availableValues"
        />
      </div>
    </div>
  </div>
  <!-- <pre>{{ perfStatsFull }}</pre> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, h, computed } from "vue"; // MIT License
import { useQuasar } from "quasar"; // MIT License
import useWebSocket, { sendMessage } from "src/composables/useWebSocket";
import QueryDialog from "src/components/QueryDialog.vue";

const $q = useQuasar(); // used for notifications

const statusData = ref([]);
const commStatus = ref([]);
const perfStatsFull = ref([]);
const dropdowns = ref({});
const userSelections = ref({});
const runningStatus = ref({});
const showAddOptionsDialog = ref(false);
const showQueryBuilderDialog = ref(false);
const newDeviceName = ref("");
const newDeviceIP = ref("");
const newsubjectName = ref("");
const currentTime = ref(Date.now());
const server_ip = "10.2.145.230";
const ws_port = "8080";

const fields = [
  { label: "Side", value: "side" },
  { label: "Variant", value: "variant" },
  { label: "Date", value: "date" },
  { label: "Status", value: "status" },
  { label: "Subject", value: "subject" },
];

const availableValues = {
  variant: ["zero_one", "single", "jitter"],
  subject: ["momo", "toto", "fifi"],
};

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
    };
  }
}

onMounted(() => {
  useWebSocket($q, statusData, commStatus, perfStatsFull, server_ip, ws_port);

  watch(
    statusData,
    (newData) => {
      dropdowns.value = {};
      newData.forEach((entry) => {
        const { host, status_type, status_value } = entry;

        initializeDropdown(host);

        if (status_type && status_value) {
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

            case "running":
              runningStatus.value[host] = status_value === "1";
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
  sendMessage("esscmd", host, "::ess::reset");
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

    const current = Math.abs(
      parseFloat(
        statusData.value.find(
          (entry) => entry.host === host && entry.status_type === "24v-a"
        )?.status_value || "0"
      )
    );

    // Choose icon based on charging state and battery percent
    if (current < 0.1) {
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
      else if (batteryPercent > 40) return "sym_o_battery_charging_20";
      else return "battery_charging_alert";
    }
  }

  return "battery_unknown"; // Default if no data available
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
</style>
