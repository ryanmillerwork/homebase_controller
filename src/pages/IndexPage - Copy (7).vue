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
                    {{ getPingSuceess(device.device) }}
                  </q-tooltip>
                </div>
                <div class="icon-container">
                  <q-icon
                    :name="getBatteryIcon(device.device)"
                    size="24px"
                    style="transform: rotate(-90deg)"
                  ></q-icon>
                  <q-tooltip :delay="500">
                    {{ getBatteryLevel(device.device) }}
                  </q-tooltip>
                </div>
              </div>

              <!-- Box and animal names -->
              <div class="col-auto">
                <div class="hb-text">{{ device.device }}</div>
                <div class="animal-caption">{{ getAnimal(device.device) }}</div>
              </div>

              <!-- Play/stop button -->
              <div class="col-auto" style="transform: translateX(4px)">
                <q-icon
                  :name="
                    getRunningStatus(device.device) ? 'play_arrow' : 'stop'
                  "
                  :color="getRunningStatus(device.device) ? 'green' : 'red'"
                  size="40px"
                ></q-icon>
              </div>

              <!-- Progress bar -->
              <div class="col text-center">
                <q-linear-progress
                  :value="getProgress(device.device)"
                  size="30px"
                  color="primary"
                  style="position: relative"
                >
                  <template v-slot:default>
                    <div class="progress-text">
                      {{ getTrialsComplete(device.device) }} /
                      {{ getTrialsInBlock(device.device) }}
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
                      :value="getSecondsValue(device.device)"
                      :thickness="0.25"
                      size="24px"
                      :color="getTimerColor(device.device)"
                    >
                    </q-circular-progress>

                    <!-- Inner Circle for Minutes -->
                    <q-circular-progress
                      :value="getMinutesValue(device.device)"
                      :thickness="0.4"
                      size="14px"
                      style="position: absolute; top: 5px; left: 5px"
                      :color="getTimerColor(device.device)"
                    ></q-circular-progress>
                    <!-- Tooltip -->
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      {{ getFormattedTimeSinceLastEvent(device.device) }}
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
                    :model-value="userSelections[device.device]?.animal"
                    :options="dropdowns[device.device]?.animalOptions"
                    :disable="getRunningStatus(device.device)"
                    label="Animal"
                    dense
                    multiple
                    @input-value="(val) => (inputValue = val)"
                    @update:model-value="
                      (val) => handleUserSelection(val, device.device, 'animal')
                    "
                  />
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.device]?.system"
                    :options="dropdowns[device.device]?.systemOptions || []"
                    :disable="getRunningStatus(device.device)"
                    label="System"
                    dense
                    @update:model-value="
                      (val) => handleUserSelection(val, device.device, 'system')
                    "
                  ></q-select>
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.device]?.protocol"
                    :options="dropdowns[device.device]?.protocolOptions || []"
                    :disable="getRunningStatus(device.device)"
                    label="Protocol"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.device, 'protocol')
                    "
                  ></q-select>
                </div>

                <div class="col-6 col-sm-3 q-mb-xs">
                  <q-select
                    class="text-truncate"
                    :model-value="userSelections[device.device]?.variant"
                    :options="dropdowns[device.device]?.variantOptions || []"
                    :disable="getRunningStatus(device.device)"
                    label="Variant"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.device, 'variant')
                    "
                  ></q-select>
                </div>
              </div>

              <div class="q-mt-md row items-center">
                <div class="col-12 col-sm-8 flex items-center">
                  <q-btn-toggle
                    v-model="runningStatus[device.device]"
                    flat
                    spread
                    :toggle-color="
                      getRunningStatus(device.device) ? 'green' : 'red'
                    "
                    class="full-width"
                    style="height: 60px"
                    :options="[
                      { value: true, slot: 'running' },
                      { value: false, slot: 'stopped' },
                    ]"
                    @update:model-value="
                      (val) => toggleTask(val, device.device)
                    "
                  >
                    <template v-slot:running>
                      <div class="row items-center no-wrap">
                        <div class="text-center">Running</div>
                        <q-icon right name="play_arrow"></q-icon>
                      </div>
                    </template>
                    <template v-slot:stopped>
                      <div class="row items-center no-wrap">
                        <div class="text-center">Stopped</div>
                        <q-icon right name="stop"></q-icon>
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
                    @click="() => resetTask(device.device)"
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
                      <th style="text-align: left"><strong>RT (ms)</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Filter perfStats based on device.device -->
                    <tr
                      v-for="(row, rowIndex) in getDevicePerfStats(
                        device.device
                      )"
                      :key="rowIndex"
                    >
                      <td>
                        <strong>{{ row.label }}</strong>
                      </td>
                      <td>{{ row.correct }}</td>
                      <td>{{ row.rt }}</td>
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

            <!-- Second Row: Add Animal -->
            <q-card-section class="row items-center q-gutter-sm">
              <div class="text-h6 col-2 label-margin">Add animal:</div>
              <q-input
                v-model="newAnimalName"
                label="Name"
                outlined
                class="col-6"
              />
              <q-btn
                flat
                label="Create"
                color="primary"
                @click="addNewAnimal"
                class="col-2"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, h, computed } from "vue"; // MIT License
import useWebSocket, { sendMessage } from "src/composables/useWebSocket";
import { useQuasar } from "quasar"; // MIT License

const $q = useQuasar(); // used for notifications

const statusData = ref([]);
const commStatus = ref([]);
const perfStatsFull = ref([]);
const dropdowns = ref({});
const userSelections = ref({});
const runningStatus = ref({});
const showAddOptionsDialog = ref(false);
const newDeviceName = ref("");
const newDeviceIP = ref("");
const newAnimalName = ref("");
const currentTime = ref(Date.now());
const server_ip = "192.168.4.228";
const ws_port = "8080";

// Transform perfStatsFull data to include only rows with sys/protocol/variant as '*'
const perfStats = computed(() => {
  console.log("Recalculating perfStats");
  const groupedData = perfStatsFull.value.reduce((acc, entry) => {
    const { hb, status_type, pc, rt, sys, protocol, variant } = entry;

    // Only include rows where sys, protocol, and variant are '*'
    if (sys === "*" && protocol === "*" && variant === "*") {
      if (!acc[hb]) acc[hb] = { hour: {}, day: {} };

      acc[hb][status_type] = {
        label: status_type.charAt(0).toUpperCase() + status_type.slice(1),
        correct: Math.round(pc * 100), // Convert to a percentage
        rt: Math.round(rt),
      };
    }
    return acc;
  }, {});

  return groupedData;
});

// Function to get perf stats for a specific device (by hb)
function getDevicePerfStats(deviceName) {
  const deviceStats = perfStats.value[deviceName];
  return deviceStats
    ? [deviceStats.hour, deviceStats.day].filter(Boolean) // Filter out undefined entries
    : [];
}

function initializeDropdown(hb) {
  if (!dropdowns.value[hb]) {
    dropdowns.value[hb] = {
      animalOptions: ["buzz", "neil"],
      systemOptions: ["emcalib", "match_to_sample", "search"],
      protocolOptions: [],
      variantOptions: [],
    };
  }
}

function initializeSelection(hb) {
  if (!userSelections.value[hb]) {
    userSelections.value[hb] = {
      animal: ["buzz", "neil"],
      system: "",
      protocol: "",
      variant: "",
    };
  }
}

onMounted(() => {
  useWebSocket(statusData, commStatus, perfStatsFull, server_ip, ws_port);

  watch(
    statusData,
    (newData) => {
      dropdowns.value = {};
      newData.forEach((entry) => {
        const { hb, status_type, status_val } = entry;

        initializeDropdown(hb);

        if (status_type && status_val) {
          switch (status_type) {
            case "animalOptions":
            case "systemOptions":
            case "protocolOptions":
            case "variantOptions":
              dropdowns.value[hb][status_type] = status_val.split(",");
              break;

            case "animal":
              initializeSelection(hb);
              userSelections.value[hb].animal = Array.isArray(status_val)
                ? status_val
                : [status_val];
              break;

            case "variant":
              const [system, protocol, variant] = status_val.split(":");
              initializeSelection(hb);
              if (system) userSelections.value[hb].system = system;
              if (protocol) userSelections.value[hb].protocol = protocol;
              if (variant) userSelections.value[hb].variant = variant;
              break;

            case "running":
              runningStatus.value[hb] = status_val === "1";
              break;
          }
        }
      });
    },
    { deep: true }
  );
});

function handleUserSelection(val, hb, type) {
  if (!userSelections[hb]) {
    userSelections[hb] = {};
  }
  if (type === "animal" && !Array.isArray(userSelections[hb].animal)) {
    userSelections[hb].animal = [];
  }

  console.log(val, hb, type);

  const commEntry = commStatus.value.find((entry) => entry.device === hb);
  const ipAddress = commEntry ? commEntry.address : "";

  let msg = "";
  switch (type) {
    case "animal":
      msg = `::ess::set_animal ${val}`;
      break;
    case "system":
      // Only system is specified
      msg = `::ess::load_system ${val}`;
      break;
    case "protocol":
      // System and protocol specified, using the new protocol value
      const systemForProtocol = userSelections.value[hb].system;
      msg = `::ess::load_system ${systemForProtocol} ${val}`;
      break;
    case "variant":
      // System, protocol, and variant specified, using the new variant value
      const systemForVariant = userSelections.value[hb].system;
      const protocolForVariant = userSelections.value[hb].protocol;
      msg = `::ess::load_system ${systemForVariant} ${protocolForVariant} ${val}`;
      break;
    default:
      console.warn(`Unknown selection type: ${type}`);
  }

  if (msg) {
    console.log("sending", ipAddress, msg);
    sendMessage("esscmd", ipAddress, msg);
  }
}

function getAnimal(hb) {
  const entry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "animal"
  );
  return entry ? entry.status_val : "Unknown";
}

function getRunningStatus(hb) {
  return runningStatus.value[hb] || false;
}

function getTrialsComplete(hb) {
  const entry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "trials_complete"
  );
  return entry && !isNaN(entry.status_val) ? parseInt(entry.status_val, 10) : 0;
}

function getTrialsInBlock(hb) {
  const entry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "trials_in_block"
  );
  return entry && !isNaN(entry.status_val) ? parseInt(entry.status_val, 10) : 0;
}

function getProgress(hb) {
  const completed = getTrialsComplete(hb);
  const total = getTrialsInBlock(hb);
  return total > 0 ? completed / total : 0;
}

function toggleTask(value, hb) {
  const ipAddress =
    commStatus.value.find((entry) => entry.device === hb)?.address || "";
  sendMessage("esscmd", ipAddress, value ? "::ess::start" : "::ess::stop");
}

function resetTask(hb) {
  const commEntry = commStatus.value.find((entry) => entry.device === hb);
  const ipAddress = commEntry ? commEntry.address : "";
  sendMessage("esscmd", ipAddress, "::ess::reset");
  $q.notify({
    type: "warning",
    message: `Reset task for device ${hb} is triggered. IP: ${ipAddress}`,
  });
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
  const entry = perfStatsFull.value.find((item) => {
    return item.hb === device && item.status_type === "day";
  });

  if (!entry) {
    return 0; // Default to 0 if no entry is found
  }

  // Parse the UTC time from `last_updated`
  const lastEventTimeUTC = new Date(entry.last_updated).getTime();

  // Calculate the time difference with the local time zone
  const timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000; // Offset in milliseconds

  // Convert `lastEventTimeUTC` to local time
  const lastEventTimeLocal = lastEventTimeUTC - timeZoneOffset;

  return currentTime.value - lastEventTimeLocal; // Difference in milliseconds
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

function addNewAnimal() {
  console.log("adding new animal", newAnimalName.value);
  showAddOptionsDialog.value = false; // Close the dialog
  newAnimalName.value = "";
}

function getLinkStatus(hb) {
  return commStatus.value.some(
    (entry) => entry.device === hb && entry.server_time === entry.last_ping
  );
}

function getPingSuceess(hb) {
  const entry = commStatus.value.find((entry) => entry.device === hb);
  if (entry) {
    return entry.ping_success;
  }
}

function getLinkColor(hb) {
  const entry = commStatus.value.find((entry) => entry.device === hb);
  if (entry && entry.server_time === entry.last_ping) {
    return entry.ping_success > 0.99 ? "green" : "yellow";
  }
  return "red";
}

function getBatteryLevel(hb) {
  return parseFloat(
    statusData.value.find(
      (entry) => entry.hb === hb && entry.status_type === "24v_volt"
    )?.status_val || "0"
  );
}

function getBatteryIcon(hb) {
  const voltage = parseFloat(
    statusData.value.find(
      (entry) => entry.hb === hb && entry.status_type === "24v_volt"
    )?.status_val || "0"
  );
  const current = Math.abs(
    parseFloat(
      statusData.value.find(
        (entry) => entry.hb === hb && entry.status_type === "24v_amp"
      )?.status_val || "0"
    )
  );
  return current < 0.1
    ? voltage > 28
      ? "battery_full"
      : voltage > 27
      ? "battery_5_bar"
      : voltage > 26
      ? "battery_2_bar"
      : "battery_alert"
    : voltage > 28.5
    ? "sym_o_battery_charging_90"
    : voltage > 27.5
    ? "sym_o_battery_charging_60"
    : voltage > 26.5
    ? "sym_o_battery_charging_30"
    : "battery_charging_full";
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
.hb-text {
  font-weight: bold;
  color: #000;
  font-size: 1.1em;
}

.animal-caption {
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
</style>
