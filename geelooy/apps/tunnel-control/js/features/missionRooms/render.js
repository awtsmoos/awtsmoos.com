// B"H

import { h, $ } from "../../ui/dom.js";
import { activityRows } from "./activity.js";

/** B"H: Render lobby first; room workspace appears with scoped socket status. */
export function renderAll(state, api) { renderList(state, api); renderRoom(state); renderOut(state.lastResult); }

export function renderList(state, api) {
  const root = $("roomList");
  if (!root) return;
  if (!state.missions.length) return root.replaceChildren(h("p", { className: "empty-state", text: "No mission rooms found yet." }));
  root.replaceChildren(...state.missions.map(row => roomButton(row, state, api)));
}

function roomButton(row, state, api) {
  const mission = row.mission || {}, room = row.collaboration || {};
  return h("button", { className: `awt-room-card ${state.selectedMissionId === mission.id ? "is-active" : ""}`, data: { missionId: mission.id || "" }, on: { click: () => api.join(mission.id) } }, [
    h("strong", { text: mission.goal || mission.id || "Untitled room" }),
    h("small", { text: mission.id || "no-id" }),
    h("small", { text: `${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open messages` })
  ]);
}

export function renderRoom(state) {
  const workspace = $("roomWorkspace");
  if (!workspace) return;
  if (!state.selectedMissionId) { workspace.className = "awt-room-workspace is-empty"; return workspace.replaceChildren(); }
  workspace.className = "awt-room-workspace is-open";
  const got = state.selected || {}, room = got.collaboration || got.mission?.collaboration || {}, mission = got.mission || got.report || {};
  workspace.replaceChildren(roomMain(state, room, mission), activityPanel(state));
}

function roomMain(state, room, mission) {
  return h("section", { className: "panel stack awt-room-main" }, [
    h("div", { className: "button-row" }, [button("closeRoomBtn", "← Back to rooms"), button("refreshRoomBtn", "Refresh room"), button("copyRoomLinkBtn", "Copy room link")]),
    h("div", { id: "roomSocketState", className: `notice awt-room-socket is-${state.socketMode}`, text: socketText(state) }),
    h("div", { id: "roomHeader", className: "awt-room-header", text: `${mission.goal || state.selectedMissionId} · ${room.agents?.length || 0} agents` }),
    metrics(room), members(room), messages(room), composer()
  ]);
}

function socketText(state) {
  if (state.socketMode === "websocket") return `WebSocket connected to room ${state.selectedMissionId}.`;
  if (state.socketMode === "connecting") return `Opening room WebSocket for ${state.selectedMissionId}...`;
  if (state.socketMode === "fallback-poll") return `Room WebSocket unavailable; selected-room polling fallback (${state.socketError || "fallback"}).`;
  return "Room stream idle.";
}

function metrics(room) {
  return h("div", { id: "roomMetrics", className: "awt-room-metrics" }, [metric("Agents", room.agents?.length || 0), metric("Claims", room.activeClaims?.length || 0), metric("Delegations", room.openDelegations?.length || 0), metric("Open messages", room.openUserMessages?.length || 0)]);
}
function metric(label, value) { return h("div", { className: "awt-room-metric" }, [h("span", { text: label }), h("strong", { text: String(value) })]); }

function members(room) {
  const agents = room.agents || [];
  return h("div", { id: "roomMembers", className: "awt-room-members" }, [h("strong", { text: "Members" }), ...(agents.length ? agents.map(agent => h("span", { className: "awt-room-member", text: `${agent.name || agent.agentId} · ${agent.status || "active"}` })) : [h("span", { text: "No agents have joined yet." })])]);
}

function messages(room) {
  const list = [...(room.messages || []), ...(room.userMessages || []).map(msg => ({ ...msg, fromAgent: "user", kind: "user-message" }))].sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-80);
  return h("div", { id: "roomMessages", className: "awt-room-messages" }, list.length ? list.map(messageNode) : [h("div", { className: "empty-state", text: "No room messages yet." })]);
}

function messageNode(msg) {
  return h("div", { className: `awt-room-message ${msg.fromAgent === "user" ? "is-user" : ""}` }, [h("strong", { text: `${msg.fromAgent || msg.from || "agent"} → ${msg.toAgent || "room"}` }), h("small", { text: `${msg.kind || "message"} · ${msg.status || ""} · ${msg.at ? new Date(msg.at).toLocaleTimeString() : ""}` }), h("p", { text: msg.body || msg.subject || msg.note || "" })]);
}

function composer() { return h("div", { className: "stack awt-room-composer" }, [h("label", {}, ["Message to room", h("textarea", { id: "roomMessage", placeholder: "Message agents in this room. Use continue / go on to let them proceed." })]), h("div", { className: "button-row" }, [h("label", {}, ["Block agents until response", h("input", { id: "roomBlockAgents", type: "checkbox", checked: true })]), button("sendRoomMessageBtn", "Send message", "primary"), button("allowRoomContinueBtn", "Send continue")])]); }
function activityPanel(state) { const rows = activityRows(state); return h("details", { id: "roomActivityDetails", className: "panel stack awt-room-activity" }, [h("summary", { id: "roomCommandsHeader", text: `Room activity · ${rows.length}` }), h("div", { id: "roomCommandTable", className: "awt-room-command-table" }, rows.length ? rows.map(activityRow) : [h("div", { className: "empty-state", text: "No room activity yet." })])]); }
function activityRow(row) { return h("details", { className: "awt-activity-row" }, [h("summary", { text: `${time(row.at)} · ${row.type} · ${row.title}` }), h("pre", { text: row.detail })]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }
function time(value) { const n = Date.parse(value || ""); return Number.isFinite(n) ? new Date(n).toLocaleTimeString() : ""; }
export function renderActivity(state) { renderRoom(state); }
export function renderOut(value) { if ($("roomOut")) $("roomOut").textContent = JSON.stringify(value || {}, null, 2); }
export function setStatus(text) { if ($("roomStatus")) $("roomStatus").textContent = text; }
