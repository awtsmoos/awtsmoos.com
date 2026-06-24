// B"H

import { h, $ } from "../../ui/dom.js";

/**
 * B"H
 * Chapter 704: The room revealed its living weather.
 *
 * Messages are not enough. The chamber must show agents, claims, delegations,
 * open user decisions, and health at a glance, so the commander sees the pulse.
 */
export function renderAll(state, getTunnelName) {
  renderList(state, getTunnelName);
  renderRoom(state);
  renderOut(state.lastResult);
}

export function renderList(state, getTunnelName) {
  const root = $("roomList");
  if (!root) return;
  if (!state.missions.length) {
    root.replaceChildren(h("p", { text: "No mission rooms found yet. Start or join a mission and it will appear here automatically." }));
    return;
  }
  root.replaceChildren(...state.missions.map(row => roomButton(row, state, getTunnelName)));
}

function roomButton(row, state, getTunnelName) {
  const mission = row.mission || {};
  const room = row.collaboration || {};
  return h("button", {
    className: `awt-room-item awt-room-card ${state.selectedMissionId === mission.id ? "is-active" : ""}`,
    on: { click: () => getTunnelName.join(mission.id) }
  }, [
    h("strong", { text: mission.goal || mission.id }),
    h("small", { text: `${mission.id} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages` })
  ]);
}

export function renderRoom(state) {
  const got = state.selected || {};
  const room = got.collaboration || got.mission?.collaboration || {};
  const mission = got.mission || got.report || {};
  const header = $("roomHeader");
  if (header) header.textContent = headerText(mission, room, state.selectedMissionId);
  renderMetrics(room);
  renderMessages(room);
}

function headerText(mission, room, fallback) {
  return `${mission.goal || fallback || "Room"} · ${room.agents?.length || 0} agents · ${room.openUserMessages?.length || 0} open user messages`;
}

function renderMetrics(room) {
  const root = $("roomMetrics");
  if (!root) return;
  root.replaceChildren(
    metric("Agents", room.agents?.length || 0),
    metric("Claims", room.activeClaims?.length || 0),
    metric("Delegations", room.openDelegations?.length || 0),
    metric("User blocks", room.openUserMessages?.length || 0)
  );
}

function metric(label, value) {
  return h("div", { className: "awt-room-metric", children: [
    h("span", { text: label }),
    h("strong", { text: String(value) })
  ] });
}

function renderMessages(room) {
  const root = $("roomMessages");
  if (!root) return;
  const messages = [...(room.messages || []), ...(room.userMessages || []).map(userMsg)].sort(byTime).slice(-120);
  root.replaceChildren(...messages.map(messageNode));
}

function userMsg(msg) {
  return { ...msg, fromAgent: "user", kind: "user-message" };
}

function byTime(a, b) {
  return String(a.at).localeCompare(String(b.at));
}

function messageNode(msg) {
  return h("div", { className: `awt-room-message ${msg.fromAgent === "user" ? "is-user" : ""}` }, [
    h("strong", { text: `${msg.fromAgent || msg.from || "agent"} → ${msg.toAgent || "all"}` }),
    h("small", { text: `${msg.kind || "message"} · ${msg.status || ""} · ${msg.at ? new Date(msg.at).toLocaleTimeString() : ""}` }),
    h("p", { text: msg.body || msg.subject || "" })
  ]);
}

export function renderOut(value) {
  if ($("roomOut")) $("roomOut").textContent = JSON.stringify(value || {}, null, 2);
}

export function setStatus(text) {
  if ($("roomStatus")) $("roomStatus").textContent = text;
}
