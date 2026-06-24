// B"H

import { h, $ } from "../../ui/dom.js";
import { filterTools } from "./tools.js";

/** B"H: Render the room, tool codex, and command trace vessels. */
export function renderAll(state, getTunnelName) {
  renderList(state, getTunnelName); renderRoom(state); renderTools(state); renderCommands(state); renderOut(state.lastResult);
}

export function renderList(state, getTunnelName) {
  const root = $("roomList");
  if (!root) return;
  if (!state.missions.length) return root.replaceChildren(h("p", { text: "No mission rooms found yet. They will appear here automatically." }));
  root.replaceChildren(...state.missions.map(row => roomButton(row, state, getTunnelName)));
}

function roomButton(row, state, getTunnelName) {
  const mission = row.mission || {}, room = row.collaboration || {};
  return h("button", { className: `awt-room-item awt-room-card ${state.selectedMissionId === mission.id ? "is-active" : ""}`, on: { click: () => getTunnelName.join(mission.id) } }, [
    h("strong", { text: mission.goal || mission.id }),
    h("small", { text: `${mission.id} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages` })
  ]);
}

export function renderRoom(state) {
  const got = state.selected || {}, room = got.collaboration || got.mission?.collaboration || {}, mission = got.mission || got.report || {};
  if ($("roomHeader")) $("roomHeader").textContent = `${mission.goal || state.selectedMissionId || "Room"} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages`;
  renderMetrics(room); renderMessages(room);
}

function renderMetrics(room) {
  const root = $("roomMetrics");
  if (!root) return;
  root.replaceChildren(metric("Agents", room.agents?.length || 0), metric("Claims", room.activeClaims?.length || 0), metric("Delegations", room.openDelegations?.length || 0), metric("User blocks", room.openUserMessages?.length || 0));
}

function metric(label, value) {
  return h("div", { className: "awt-room-metric", children: [h("span", { text: label }), h("strong", { text: String(value) })] });
}

function renderMessages(room) {
  const root = $("roomMessages");
  if (!root) return;
  const messages = [...(room.messages || []), ...(room.userMessages || []).map(msg => ({ ...msg, fromAgent: "user", kind: "user-message" }))].sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-120);
  root.replaceChildren(...messages.map(messageNode));
}

function messageNode(msg) {
  return h("div", { className: `awt-room-message ${msg.fromAgent === "user" ? "is-user" : ""}` }, [
    h("strong", { text: `${msg.fromAgent || msg.from || "agent"} → ${msg.toAgent || "all"}` }),
    h("small", { text: `${msg.kind || "message"} · ${msg.status || ""} · ${msg.at ? new Date(msg.at).toLocaleTimeString() : ""}` }),
    h("p", { text: msg.body || msg.subject || "" })
  ]);
}

export function renderTools(state) {
  const root = $("roomTools");
  if (!root) return;
  const tools = filterTools(state.tools, state.toolFilter).slice(0, 240);
  if ($("roomToolsHeader")) $("roomToolsHeader").textContent = `Tunnel tools · ${tools.length}/${state.tools.length}`;
  root.replaceChildren(...tools.map(tool => h("button", { className: "awt-room-tool" }, [h("strong", { text: tool.name }), h("small", { text: `${tool.group} · ${tool.desc}` })])));
}

export function renderCommands(state) {
  const root = $("roomCommandTable");
  if (!root) return;
  if ($("roomCommandsHeader")) $("roomCommandsHeader").textContent = `Agent tunnel command table · ${state.commandRows.length}`;
  root.replaceChildren(commandHead(), ...state.commandRows.map(commandRow));
}

function commandHead() {
  return h("div", { className: "awt-command-row is-head" }, ["Agent", "Action", "Target", "Status", "Time", "Detail"].map(text => h("strong", { text })));
}

function commandRow(row) {
  return h("div", { className: "awt-command-row" }, [row.agent, row.action, row.target, row.status, time(row.at), row.detail].map(text => h("span", { text: String(text || "") })));
}

function time(value) { const n = Number(value || 0); return n ? new Date(n).toLocaleTimeString() : ""; }
export function renderOut(value) { if ($("roomOut")) $("roomOut").textContent = JSON.stringify(value || {}, null, 2); }
export function setStatus(text) { if ($("roomStatus")) $("roomStatus").textContent = text; }
