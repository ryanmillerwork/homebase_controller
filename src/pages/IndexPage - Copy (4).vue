<template>
  <div v-if="Object.keys(commStatus).length">
    <div class="q-pa-md" style="width: 100%; overflow-x: auto">
      <q-list bordered class="rounded-borders">
        <q-expansion-item
          v-for="device in commStatus"
          :key="device.device"
          group="variantGroup"
          expand-separator
          :icon="getRunningStatus(device.device) ? 'play_arrow' : 'stop'"
          dense
          header-class="text-primary"
        >
          <!-- Customized Header Slot -->
          <template v-slot:header>
            <div
              class="header-container row items-center justify-between full-width"
            >
              <!-- Left Section: Link Icon -->
              <div class="col-auto" style="position: relative">
                <div class="icon-container">
                  <q-icon
                    :name="getLinkStatus(device.device) ? 'link' : 'link_off'"
                    :color="getLinkColor(device.device)"
                    size="24px"
                    class="q-pr-md"
                  ></q-icon>
                </div>
                <!-- Battery Indicator -->
                <div class="icon-container">
                  <q-icon
                    :name="getBatteryIcon(device.device)"
                    size="24px"
                    style="transform: rotate(-90deg)"
                  ></q-icon>
                </div>
              </div>

              <!-- Left Section: hb and Animal Name -->
              <div class="col-auto" style="padding-right: 16px">
                <div class="hb-text">{{ device.device }}</div>
                <div class="animal-caption">{{ getAnimal(device.device) }}</div>
              </div>

              <!-- Center Section: Progress Bar with Text on it -->
              <div class="col text-center">
                <q-linear-progress
                  :value="getProgress(device.device)"
                  size="30px"
                  color="primary"
                  style="position: relative"
                >
                  <!-- Text overlaid on the progress bar -->
                  <template v-slot:default>
                    <div class="progress-text">
                      {{ getTrialsComplete(device.device) }} /
                      {{ getTrialsInBlock(device.device) }}
                    </div>
                  </template>
                </q-linear-progress>
              </div>

              <!-- Right Section: Play/Stop Icon -->
              <div class="col-auto">
                <q-icon
                  :name="
                    getRunningStatus(device.device) ? 'play_arrow' : 'stop'
                  "
                  :color="getRunningStatus(device.device) ? 'green' : 'red'"
                  size="40px"
                  class="q-pr-md"
                ></q-icon>
              </div>
            </div>
          </template>

          <q-card>
            <q-card-section>
              <!-- Responsive Row for Dropdowns -->
              <div class="row">
                <div class="col-6 col-sm-4">
                  <q-select
                    class="text-truncate"
                    :model-value="
                      userSelections[device.device]
                        ? userSelections[device.device].system
                        : ''
                    "
                    :options="
                      dropdowns[device.device]
                        ? dropdowns[device.device].systemOptions
                        : []
                    "
                    :disable="getRunningStatus(device.device)"
                    label="System"
                    dense
                    @update:model-value="
                      (val) => handleUserSelection(val, device.device, 'system')
                    "
                  ></q-select>
                </div>
                <div class="col-6 col-sm-4">
                  <q-select
                    class="text-truncate"
                    :model-value="
                      userSelections[device.device]
                        ? userSelections[device.device].protocol
                        : ''
                    "
                    :options="
                      dropdowns[device.device]
                        ? dropdowns[device.device].protocolOptions
                        : []
                    "
                    :disable="getRunningStatus(device.device)"
                    label="Protocol"
                    dense
                    @update:model-value="
                      (val) =>
                        handleUserSelection(val, device.device, 'protocol')
                    "
                  ></q-select>
                </div>
                <div class="col-6 col-sm-4">
                  <q-select
                    class="text-truncate"
                    :model-value="
                      userSelections[device.device]
                        ? userSelections[device.device].variant
                        : ''
                    "
                    :options="
                      dropdowns[device.device]
                        ? dropdowns[device.device].variantOptions
                        : []
                    "
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
              <div class="q-mt-md">
                <q-btn-toggle
                  :model-value="getRunningStatus(device.device)"
                  push
                  spread
                  :toggle-color="
                    getRunningStatus(device.device) ? 'green' : 'red'
                  "
                  class="custom-toggle-btn full-width"
                  :options="[
                    { value: true, slot: 'running' },
                    { value: false, slot: 'stopped' },
                  ]"
                  @update:model-value="(val) => toggleTask(val, device.device)"
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
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-separator></q-separator>
        <!-- <q-separator v-for="index in commStatus" :key="`separator-${index}`" /> -->
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import useWebSocket, { sendMessage } from "src/composables/useWebSocket";

const statusData = ref([]);
const commStatus = ref([]);
const dropdowns = ref({});
const systemOptions = ref([]);
const protocolOptions = ref([]);
const variantOptions = ref([]);
const userSelections = ref({});
const server_ip = "192.168.4.228";
const ws_port = "8080";

onMounted(() => {
  useWebSocket(statusData, commStatus, server_ip, ws_port);

  watch(
    statusData,
    (newData) => {
      dropdowns.value = {};
      newData.forEach((entry) => {
        if (!dropdowns.value[entry.hb]) {
          dropdowns.value[entry.hb] = {
            systemOptions: [],
            protocolOptions: [],
            variantOptions: [],
          };
        }

        if (entry.status_type === "variant" && entry.status_val) {
          const [system, protocol, variant] = entry.status_val.split(":");

          // Update userSelections to reflect current selection from statusData
          if (!userSelections.value[entry.hb]) {
            userSelections.value[entry.hb] = {};
          }
          userSelections.value[entry.hb].system = system;
          userSelections.value[entry.hb].protocol = protocol;
          userSelections.value[entry.hb].variant = variant;
        }

        if (entry.status_type === "systemOptions" && entry.status_val) {
          dropdowns.value[entry.hb].systemOptions = entry.status_val.split(",");
        }
        if (entry.status_type === "protocolOptions" && entry.status_val) {
          dropdowns.value[entry.hb].protocolOptions =
            entry.status_val.split(",");
        }
        if (entry.status_type === "variantOptions" && entry.status_val) {
          dropdowns.value[entry.hb].variantOptions =
            entry.status_val.split(",");
        }
      });
    },
    { deep: true }
  );
});

function handleUserSelection(val, hb, type) {
  if (!userSelections.value[hb]) {
    userSelections.value[hb] = {
      system: "",
      protocol: "",
      variant: "",
    };
  }

  console.log(userSelections);

  userSelections.value[hb][type] = val;

  const commEntry = commStatus.value.find((entry) => entry.device === hb);
  const ipAddress = commEntry ? commEntry.address : "";
  let msg;
  if (type === "system") {
    msg = `::ess::load_system ${val}`;
  } else if (type === "protocol") {
    msg = `::ess::load_system ${userSelections.value[hb].system} ${val}`;
  } else if (type === "variant") {
    msg = `::ess::load_system ${userSelections.value[hb].system} ${userSelections.value[hb].protocol} ${val}`;
  }
  console.log(msg);
  sendMessage("esscmd", ipAddress, msg);
}

function getAnimal(hb) {
  const entry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "variant"
  );
  return entry ? entry.animal : "Unknown";
}

function getRunningStatus(hb) {
  const entry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "running"
  );
  return entry ? entry.status_val === "1" : false;
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
  console.log(`Toggled running status for hb ${hb} to:`, value);
  const commEntry = commStatus.value.find((entry) => entry.device === hb);
  const ipAddress = commEntry ? commEntry.address : "";

  console.log(ipAddress);

  if (value) {
    sendMessage("esscmd", ipAddress, "::ess::start");
  } else {
    sendMessage("esscmd", ipAddress, "::ess::stop");
  }
}

function getLinkStatus(hb) {
  const entry = commStatus.value.find((entry) => entry.device === hb);

  if (entry) {
    return entry.server_time === entry.last_ping;
  }
  return false;
}

function getLinkColor(hb) {
  // color of the link icon: 'red', 'yellow', or 'green'
  const entry = commStatus.value.find((entry) => entry.device === hb);
  if (entry) {
    if (entry.server_time === entry.last_ping) {
      if (entry.ping_success > 0.99) {
        return "green";
      } else {
        return "yellow";
      }
    }
  }

  return "red";
}

function getBatteryIcon(hb) {
  const voltageEntry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "24v_volt"
  );
  const currentEntry = statusData.value.find(
    (entry) => entry.hb === hb && entry.status_type === "24v_amp"
  );

  console.log(`Device: ${hb}`);

  const voltage = voltageEntry ? parseFloat(voltageEntry.status_val) : 0;
  const current = currentEntry
    ? Math.abs(parseFloat(currentEntry.status_val))
    : 0;

  console.log("Voltage:", voltage);
  console.log("Current:", current);

  if (voltage > 28 && current > 0.1) {
    return "sym_o_battery_charging_90"; //
  } else if (voltage > 28.5 && current <= 0.1) { // reaches 28.5 when discharging after 28 mins
    return "battery_full"; // works
  } else if (voltage > 27 && current > 0.1) {
    return "sym_o_battery_charging_60"; //
  } else if (voltage > 28.2 && current <= 0.1) { // reaches 28.2 when discharging after 28 mins
    return "battery_5_bar"; // works
  } else if (voltage > 25 && current > 0.1) {
    return "sym_o_battery_charging_30"; // works
  } else if (voltage > 25 && current <= 0.1) {
    return "battery_2_bar"; //works
  } else if (voltage > 27 && current > 0.1) {
    return "battery_charging_full"; // works
  } else if (voltage > 27 && current <= 0.1) {
    return "battery_alert"; //works
  } else {
    // return "sym_o_battery_charging_30"; //works
    return "battery_unknown"; //works
  }
}
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
}
.col-4 {
  flex: 0 0 32%;
}

.hb-text {
  font-weight: bold;
  color: #000;
  font-size: 1.1em;
}

.animal-caption {
  font-size: 0.9em;
  color: #6c757d;
}

.trials-text {
  font-size: 1em;
  color: #000;
}

.header-container {
  padding: 8px 0;
}

.icon-container {
  margin: 2px 0;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black; /* Or choose a color that contrasts with your progress bar */
  font-weight: bold;
  font-size: 12px; /* Adjust this size as needed */
}
</style>
