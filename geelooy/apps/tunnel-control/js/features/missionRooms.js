// B"H
import { h, out, $ } from "../ui/dom.js";
import { getJson } from "../api/http.js";

const DEFAULT_AGENT = "control-room-human";

let state = {
  missions: [],
  selectedMissionId: "",
  selected: null,
  lastResult: null
};

export function missionRooms() {
  return h("section", { className: "pane awt-room-console", data: { pane: "missionRooms" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "ROOMS" }),
      h("h2", { text: "Mission rooms" }),
      h("p", { text: "Discover active mission sessions, join a room, chat with agents, and control whether user messages block autonomous work." })
    ]),
    h("article", { className: "panel stack" }, [
      h("div", { className: "form-grid" }, [
        label("Project root or search", h("input", { id: "roomProjectRoot", placeholder: "/Users/.../project or keyword" })),
        label("Agent id", h("input", { id: "roomAgentId", value: DEFAULT_AGENT })),
        label("Poll ms", h("input", { id: "roomPollMs", type: "number", min: "1500", value: "5000" }))
      ]),
      h("div", { className: "button-row" }, [
        button("discoverRoomsBtn", "Discover", "primary"),
        button("refreshRoomBtn", "Refresh room"),
        button("copyRoomLinkBtn", "Copy room link")
      ]),
      h("div", { id: "roomStatus", className: "notice", text: "Room discovery idle." })
    ]),
    h("article", { className: "awt-room-layout" }, [
      h("aside", { id: "roomList", className: "panel awt-room-list" }),
      h("section", { className: "panel stack awt-room-main" }, [
        h("div", { id: "roomHeader", className: "awt-room-header", text: "No room selected." }),
        h("div", { id: "roomMessages", className: "awt-room-messages" }),
        h("div", { className: "stack" }, [
          label("Message to room", h("textarea", { id: "roomMessage", placeholder: "Tell agents what changed. Use 'continue' or 'go on' to let them proceed." })),
          h("div", { className: "button-row" }, [
            label("Block agents until response", h("input", { id: "roomBlockAgents", type: "checkbox", checked: true })),
            button("sendRoomMessageBtn", "Send to room", "primary"),
            button("allowRoomContinueBtn", "Send continue")
          ])
        ])
      ])
    ]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Room JSON" }), out("roomOut", "No room loaded.")])
  ]);
}

export function mountMissionRooms(getTunnelName) {
  if (!$("discoverRoomsBtn")) return;
  $("discoverRoomsBtn").onclick = () => discover(getTunnelName, "manual");
  $("refreshRoomBtn").onclick = () => refreshSelected(getTunnelName);
  $("sendRoomMessageBtn").onclick = () => sendMessage(getTunnelName, false);
  $("allowRoomContinueBtn").onclick = () => sendMessage(getTunnelName, true);
  $("copyRoomLinkBtn").onclick = copyRoomLink;
  const params = new URLSearchParams(location.search);
  const room = params.get("room") || params.get("missionId") || "";
  const root = params.get("projectRoot") || params.get("root") || "";
  if ($("roomProjectRoot")) $("roomProjectRoot").value = root;
  if (room) state.selectedMissionId = room;
  discover(getTunnelName, "boot").then(() => {
    if (state.selectedMissionId) refreshSelected(getTunnelName);
  });
  setInterval(() => {
    const ms = Number($("roomPollMs")?.value || 5000);
    if (state.selectedMissionId && ms >= 1500) refreshSelected(getTunnelName, true);
  }, 5000);
}

function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }

async function discover(getTunnelName, reason = "refresh") {
  const got = await action(getTunnelName, {
    action: "missionProjectDiscover",
    targetVessel: "native-tunnel",
    projectRoot: $("roomProjectRoot")?.value || "",
    q: $("roomProjectRoot")?.value || "",
    agentId: $("roomAgentId")?.value || DEFAULT_AGENT,
    limit: 40
  });
  state.lastResult = got;
  state.missions = got.missions || [];
  if (!state.selectedMissionId && state.missions[0]) state.selectedMissionId = state.missions[0].mission.id;
  setStatus(`Discovered ${state.missions.length} rooms (${reason}).`);
  renderList(getTunnelName);
  renderOut(got);
}

async function refreshSelected(getTunnelName, quiet = false) {
  if (!state.selectedMissionId) return;
  const got = await action(getTunnelName, {
    action: "missionProjectStatus",
    targetVessel: "native-tunnel",
    missionId: state.selectedMissionId
  });
  state.selected = got;
  state.lastResult = got;
  if (!quiet) setStatus(`Room loaded: ${state.selectedMissionId}`);
  renderRoom();
  renderOut(got);
}

async function join(getTunnelName, missionId) {
  state.selectedMissionId = missionId;
  const got = await action(getTunnelName, {
    action: "missionProjectJoin",
    targetVessel: "native-tunnel",
    missionId,
    agentId: $("roomAgentId")?.value || DEFAULT_AGENT,
    role: "human-room",
    capabilities: "comment,steer,approve,block",
    projectRoot: $("roomProjectRoot")?.value || ""
  });
  state.selected = got;
  state.lastResult = got;
  setStatus(`Joined room ${missionId}.`);
  renderList(getTunnelName);
  renderRoom();
  renderOut(got);
}

async function sendMessage(getTunnelName, forceContinue) {
  if (!state.selectedMissionId) return setStatus("Select a room first.");
  const body = forceContinue ? (($("roomMessage")?.value || "") + "\ncontinue").trim() : $("roomMessage")?.value || "";
  if (!body.trim()) return setStatus("Write a message first.");
  const block = $("roomBlockAgents")?.checked !== false;
  const got = await action(getTunnelName, {
    action: "missionRoomUserMessage",
    targetVessel: "native-tunnel",
    missionId: state.selectedMissionId,
    agentId: $("roomAgentId")?.value || DEFAULT_AGENT,
    body,
    requiresResponse: forceContinue ? false : block,
    allowContinue: forceContinue
  });
  if ($("roomMessage")) $("roomMessage").value = "";
  state.selected = got;
  state.lastResult = got;
  setStatus(forceContinue ? "Continue message sent." : "User message sent to room.");
  renderRoom();
  renderOut(got);
}

async function action(getTunnelName, payload) {
  const tunnel = encodeURIComponent(getTunnelName?.() || "auto");
  const url = new URL(`/api/tunnel/control/fs/${tunnel}`, location.origin);
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const got = await getJson(url.toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || `${payload.action}_failed`);
  return got;
}

function renderList(getTunnelName) {
  const root = $("roomList");
  if (!root) return;
  if (!state.missions.length) {
    root.replaceChildren(h("p", { text: "No mission rooms found. Start a mission or clear the search." }));
    return;
  }
  root.replaceChildren(...state.missions.map(row => {
    const mission = row.mission || {};
    const room = row.collaboration || {};
    return h("button", {
      className: `awt-room-item ${state.selectedMissionId === mission.id ? "is-active" : ""}`,
      on: { click: () => join(getTunnelName, mission.id) }
    }, [
      h("strong", { text: mission.goal || mission.id }),
      h("small", { text: `${mission.id} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages` })
    ]);
  }));
}

function renderRoom() {
  const got = state.selected || {};
  const room = got.collaboration || got.mission?.collaboration || {};
  const mission = got.mission || got.report || {};
  if ($("roomHeader")) $("roomHeader").textContent = `${mission.goal || state.selectedMissionId || "Room"} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages`;
  const messages = [...(room.messages || []), ...(room.userMessages || []).map(msg => ({ ...msg, fromAgent: "user", kind: "user-message" }))].sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-120);
  const root = $("roomMessages");
  if (!root) return;
  root.replaceChildren(...messages.map(msg => h("div", { className: `awt-room-message ${msg.fromAgent === "user" ? "is-user" : ""}` }, [
    h("strong", { text: `${msg.fromAgent || msg.from || "agent"} → ${msg.toAgent || "all"}` }),
    h("small", { text: `${msg.kind || "message"} · ${msg.status || ""} · ${msg.at ? new Date(msg.at).toLocaleTimeString() : ""}` }),
    h("p", { text: msg.body || msg.subject || "" })
  ])));
}

function copyRoomLink() {
  if (!state.selectedMissionId) return setStatus("Select a room first.");
  const url = new URL(location.href);
  url.searchParams.set("room", state.selectedMissionId);
  const root = $("roomProjectRoot")?.value || "";
  if (root) url.searchParams.set("projectRoot", root);
  navigator.clipboard?.writeText(url.toString()).catch(() => {});
  setStatus(url.toString());
}

function renderOut(value) {
  if ($("roomOut")) $("roomOut").textContent = JSON.stringify(value || {}, null, 2);
}

function setStatus(text) {
  if ($("roomStatus")) $("roomStatus").textContent = text;
}
