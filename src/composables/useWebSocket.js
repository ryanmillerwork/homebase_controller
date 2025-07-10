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
  listboxOptions
) {
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
      // console.log("Received message:", event.data);
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "status" && Array.isArray(parsedData.data)) {
          statusData.value = parsedData.data;
          // console.log(statusData.value);
        } else if (
          parsedData.type === "status_changes" &&
          typeof parsedData.data === "object"
        ) {
          const item = parsedData.data;
          const existingIndex = statusData.value.findIndex(
            (entry) =>
              entry.subject === item.subject &&
              entry.host === item.host &&
              entry.status_type === item.status_type
          );
          if (existingIndex !== -1) {
            statusData.value[existingIndex] = item;
          }
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
