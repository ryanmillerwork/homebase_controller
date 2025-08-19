// useWebSocket.js
// socket between this client and nodejs server
// gets messages when things change and sends messages to change things
// also sends messages directly to boxes with sendMessage()
import { ref } from "vue";
// import { useQuasar } from "quasar"; // MIT License
// const $q = useQuasar(); // used for notifications

const socket = ref(null);
let reconnectNotification = null;

export default function useWebSocket(
  $q,
  statusData,
  commStatus,
  perfStatsFull,
  ip,
  port,
  sql_table_response,
  listboxOptions,
  // New reactive references to update per message
  dropdowns,
  userSelections,
  runningStatus,
  loadingDeviceStatus,
  loadingProgress
) {
  const upsertStatusEntry = (item) => {
    const keyMatch = (e) =>
      e.host === item.host && e.status_type === item.status_type;
    const existingIndex = statusData.value.findIndex(keyMatch);
    const incomingTs = Date.parse(item.sys_time || 0) || 0;

    if (existingIndex !== -1) {
      const existing = statusData.value[existingIndex];
      const existingTs = Date.parse(existing.sys_time || 0) || 0;
      if (incomingTs >= existingTs) {
        statusData.value[existingIndex] = item;
      }
    } else {
      statusData.value.push(item);
    }
  };

  const ensureDropdownHost = (host) => {
    if (!dropdowns.value[host]) {
      dropdowns.value[host] = {
        animalOptions: [],
        systemOptions: ["emcalib", "match_to_sample", "search"],
        protocolOptions: [],
        variantOptions: [],
        branchOptions: [],
      };
    }
  };

  const ensureSelectionHost = (host) => {
    if (!userSelections.value[host]) {
      userSelections.value[host] = {
        subject: [""],
        system: "",
        protocol: "",
        variant: "",
        branch: "",
      };
    }
  };

  const applyDerivedUpdate = (item) => {
    const { host, status_type, status_value } = item;
    if (!host || typeof status_type === "undefined") return;

    ensureDropdownHost(host);

    switch (status_type) {
      case "animalOptions":
        dropdowns.value[host].animalOptions = String(status_value || "").split(
          ","
        );
        break;
      case "systems":
        dropdowns.value[host].systemOptions = String(status_value || "").split(
          " "
        );
        break;
      case "protocols":
        dropdowns.value[host].protocolOptions = String(
          status_value || ""
        ).split(" ");
        break;
      case "variants":
        dropdowns.value[host].variantOptions = String(status_value || "").split(
          " "
        );
        break;
      case "branches":
        dropdowns.value[host].branchOptions = String(status_value || "").split(
          " "
        );
        break;

      case "subject":
        ensureSelectionHost(host);
        userSelections.value[host].subject = Array.isArray(status_value)
          ? status_value
          : [status_value];
        break;
      case "system":
        ensureSelectionHost(host);
        userSelections.value[host].system = Array.isArray(status_value)
          ? status_value
          : [status_value];
        break;
      case "protocol":
        ensureSelectionHost(host);
        userSelections.value[host].protocol = Array.isArray(status_value)
          ? status_value
          : [status_value];
        break;
      case "variant":
        ensureSelectionHost(host);
        userSelections.value[host].variant = Array.isArray(status_value)
          ? status_value
          : [status_value];
        break;
      case "branch": {
        ensureSelectionHost(host);
        const incoming = Array.isArray(status_value)
          ? status_value[0]
          : status_value;
        const opts = dropdowns.value[host].branchOptions || [];
        if (incoming && !opts.includes(incoming)) {
          dropdowns.value[host].branchOptions = [...opts, incoming];
        }
        userSelections.value[host].branch = incoming;
        break;
      }

      case "running":
        runningStatus.value[host] = String(status_value) === "1";
        break;
      case "status":
        loadingDeviceStatus.value[host] = status_value === "loading";
        break;
      case "loading_progress":
        try {
          const progressData = JSON.parse(status_value);
          loadingProgress.value[host] = progressData;
          if (
            progressData?.stage === "complete" ||
            progressData?.stage === "error"
          ) {
            // End of operation (success or failure) → unlock this host
            loadingDeviceStatus.value[host] = false;
          } else {
            loadingDeviceStatus.value[host] = true;
          }
        } catch (e) {
          console.error("Failed to parse loading_progress JSON:", e);
        }
        break;
    }
  };

  const connect = () => {
    const hostname = window.location.hostname;
    // socket.value = new WebSocket(`ws://${hostname}:${port}`); // use IP thats hosting this webpage for the socket
    socket.value = new WebSocket(`ws://${ip}:${port}`); // hard coded IP managing the socket communication

    socket.value.onopen = () => {
      console.log("WebSocket connection established...");
      // Clear the persistent notification when the connection is successful
      if (reconnectNotification) {
        reconnectNotification(); // Dismiss the notification
        reconnectNotification = null;
      }
    };

    socket.value.onmessage = (event) => {
      console.log("Received message:", event.data);
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "status" && Array.isArray(parsedData.data)) {
          // Full snapshot
          const rows = parsedData.data;
          // Normalize by latest per (host,status_type)
          const latestByKey = new Map();
          for (const row of rows) {
            const key = `${row.host}|${row.status_type}`;
            const ts = Date.parse(row.sys_time || 0) || 0;
            const prev = latestByKey.get(key);
            const prevTs = prev ? Date.parse(prev.sys_time || 0) || 0 : -1;
            if (!prev || ts >= prevTs) latestByKey.set(key, row);
          }
          // Upsert and apply derived updates once per key
          latestByKey.forEach((item) => {
            upsertStatusEntry(item);
            applyDerivedUpdate(item);
          });
        } else if (
          parsedData.type === "status_changes" &&
          typeof parsedData.data === "object"
        ) {
          // Single-row update
          const item = parsedData.data;
          upsertStatusEntry(item);
          applyDerivedUpdate(item);
        } else if (
          parsedData.type === "commStatus" &&
          typeof parsedData.data === "object"
        ) {
          commStatus.value = parsedData.data;
        } else if (
          parsedData.type === "comm_status_changes" &&
          typeof parsedData.data === "object"
        ) {
          // This is an update on one row of commStatus
          const item = parsedData.data;

          // Check if commStatus array exists and has data
          if (!commStatus.value || commStatus.value.length === 0) {
            console.error("commStatus is empty or undefined.");
            return;
          }

          // Attempt to find a matching host in commStatus array
          const existingIndex = commStatus.value.findIndex(
            (entry) => entry.device === item.device
          );

          if (existingIndex !== -1) {
            commStatus.value[existingIndex] = item;
          } else {
            console.warn(
              `No matching entry found for host: ${item.device}. Check if host values match exactly.`
            );
          }
        } else if (
          parsedData.type === "perfStats" &&
          Array.isArray(parsedData.data)
        ) {
          console.log("perfStats: ", parsedData.data);
          perfStatsFull.value = parsedData.data;
        } else if (
          parsedData.type === "perf_stats_changes" &&
          typeof parsedData.data === "object"
        ) {
          // console.log("perf_stats_changes: ", parsedData.data);
          // Find the relevant row in perfStatsFull and update it
          const index = perfStatsFull.value.findIndex(
            (row) =>
              row.host === parsedData.data.host &&
              row.status_type === parsedData.data.status_type &&
              row.subject === parsedData.data.subject &&
              row.sys === parsedData.data.sys &&
              row.protocol === parsedData.data.protocol &&
              row.variant === parsedData.data.variant
          );

          if (index !== -1) {
            // console.log("found it!", index);
            // Update the specific row with the new values
            perfStatsFull.value[index] = {
              ...perfStatsFull.value[index],
              ...parsedData.data,
            };
          } else {
            console.log("adding new row to perfStatsFull");
            // If the row doesn't exist, add it to perfStatsFull
            perfStatsFull.value.push(parsedData.data);
          }
          // Re-trigger reactivity for perfStatsFull
          perfStatsFull.value = [...perfStatsFull.value];
        } else if (parsedData.type === "sql_table") {
          console.log("Table: ", parsedData.result);
          sql_table_response.value = parsedData.result;
        } else if (parsedData.type === "listbox_options") {
          console.log("listbox_options: ", parsedData.result);
          listboxOptions.value = {
            ...listboxOptions.value, // Keep existing values
            [Object.keys(parsedData.result[0])[0]]:
              parsedData.result[0][Object.keys(parsedData.result[0])[0]],
          };
          console.log("listboxOptions: ", listboxOptions.value);
        } else if (parsedData.type === "TCL_ERROR") {
          console.log("TCL_ERROR: ", parsedData.data);
          $q.notify({
            type: "negative", // Sets the notification to red
            message: parsedData.data,
            timeout: 60000, // Keeps the notification open until dismissed
            actions: [
              {
                label: "Dismiss",
                color: "white", // Optional: keeps the button text visible against the red background
                handler: () => {
                  /* User dismissed the notification */
                },
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    };

    socket.value.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.value.onclose = () => {
      console.log("WebSocket connection closed, attempting to reconnect...");
      // Show a persistent notification if not already displayed
      if (!reconnectNotification) {
        reconnectNotification = $q.notify({
          type: "warning",
          message: `WebSocket connection to server lost. Attempting to reconnect...`,
          timeout: 0, // Keeps the notification open until dismissed
        });
      }
      setTimeout(connect, 3000); // Attempt to reconnect after 3 seconds
    };
  };

  connect();
}

export function sendMessage(msg_type, ip, msg) {
  const message = JSON.stringify({
    msg_type,
    ip,
    msg: msg + "\n", // Add newline to the msg content
  });
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(message);
    console.log("sending: ", message);
  } else {
    console.error("WebSocket is not open. Cannot send message:", message);
  }
}
