// B"H

import { h, $ } from "../../ui/dom.js";

/**
 * B"H
 * Chapter 718: Render only the room and the room's tunnel-fire.
 */
export function renderAll(state, api) {
  renderList(state, api); renderRoom(state); renderCommands(state); renderOut(state.lastResult);
}

export function renderList(state, api) {
  const root = $("roomList");
  if (!root) return;
  if (!state.missions.length) return root.replaceChildren(h("p", { className: "empty-state", text: "No mission rooms found yet. Refresh rooms or start an agent mission." }));
  root.replaceChildren(...state.missions.map(row => roomButton(row, state, api)));
}

function roomButton(row, state, api) {
  const mission = row.mission || {}, room = row.collaboration || {};
  const active = state.selectedMissionId === mission.id ? "is-active" : "";
  return h("button", { className: `awt-room-card ${active}`, data: { missionId: mission.id || "" }, on: { click: () => api.join(mission.id) } }, [
    h("strong", { text: mission.goal || mission.id || "Untitled room" }),
    h("small", { text: `${mission.id || "no-id"}` }),
    h("small", { text: `${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open messages` })
  ]);
}

export function renderRoom(state) {
  const got = state.selected || {}, room = got.collaboration || got.mission?.collaboration || {}, mission = got.mission || got.report || {};
  if ($("roomHeader")) $("roomHeader").textContent = state.selectedMissionId ? `${mission.goal || state.selectedMissionId} · ${room.agents?.length || 0} agents` : "Open a room to see its chat.";
  renderMetrics(room); renderMessages(room);
}

function renderMetrics(room) {
  const root = $("roomMetrics");
  if (!root) return;
  root.replaceChildren(metric("Agents", room.agents?.length || 0), metric("Claims", room.activeClaims?.length || 0), metric("Delegations", room.openDelegations?.length || 0), metric("Open messages", room.openUserMessages?.length || 0));
}

function metric(label, value) {
  return h("div", { className: "awt-room-metric" }, [h("span", { text: label }), h("strong", { text: String(value) })]);
}

function renderMessages(room) {
  const root = $("roomMessages");
  if (!root) return;
  const messages = [...(room.messages || []), ...(room.userMessages || []).map(msg => ({ ...msg, fromAgent: "user", kind: "user-message" }))].sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-80);
  if (!messages.length) return root.replaceChildren(h("div", { className: "empty-state", text: "No room messages yet." }));
  root.replaceChildren(...messages.map(messageNode));
}

function messageNode(msg) {
  return h("div", { className: `awt-room-message ${msg.fromAgent === "user" ? "is-user" : ""}` }, [
    h("strong", { text: `${msg.fromAgent || msg.from || "agent"} → ${msg.toAgent || "room"}` }),
    h("small", { text: `${msg.kind || "message"} · ${msg.status || ""} · ${msg.at ? new Date(msg.at).toLocaleTimeString() : ""}` }),
    h("p", { text: msg.body || msg.subject || msg.note || "" })
  ]);
}

export function renderCommands(state) {
  const root = $("roomCommandTable");
  if (!root) return;
  const count = state.commandRows.length;
  if ($("roomCommandsHeader")) $("roomCommandsHeader").textContent = `Room tunnel calls · ${count}`;
  if (!count) return root.replaceChildren(commandHead(), h("div", { className: "awt-command-row" }, [h("span", { text: "No tunnel calls matched this room yet." })]));
  root.replaceChildren(commandHead(), ...state.commandRows.map(commandRow));
}

function commandHead() {
  return h("div", { className: "awt-command-row is-head" }, ["Agent", "Tool/action", "Target", "Status", "Time", "Detail"].map(text => h("strong", { text })));
}

function commandRow(row) {
  return h("div", { className: "awt-command-row" }, [row.agent, row.action, row.target, row.status, time(row.at), row.detail].map(text => h("span", { text: String(text || "") })));
}

function time(value) { const n = Number(value || 0); return n ? new Date(n).toLocaleTimeString() : ""; }
export function renderOut(value) { if ($("roomOut")) $("roomOut").textContent = JSON.stringify(value || {}, null, 2); }
export function setStatus(text) { if ($("roomStatus")) $("roomStatus").textContent = text; }
