// B"H

export const DEFAULT_AGENT = "control-room-human";
const KEY = "awt.missionRooms.selection";

/** B"H: Room state with selected-room WebSocket lifecycle. */
export function createRoomState() {
  return { missions: [], selectedMissionId: "", selected: null, timeline: [], lastResult: null, timer: 0, discoverTimer: 0, busy: false, socket: null, socketMode: "idle", socketError: "", socketReconnect: 0, socketOpenedAt: 0 };
}

export function loadSelection() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveSelection(data = {}) {
  try { localStorage.setItem(KEY, JSON.stringify({ missionId: data.missionId || "", projectRoot: data.projectRoot || "", agentId: data.agentId || DEFAULT_AGENT, savedAt: new Date().toISOString() })); } catch {}
}

export function paramsSelection() {
  const params = new URLSearchParams(location.search || "");
  return { missionId: params.get("room") || params.get("missionId") || "", projectRoot: params.get("projectRoot") || params.get("root") || "", agentId: params.get("agentId") || "" };
}

export function agentId() { return document.getElementById("roomAgentId")?.value || DEFAULT_AGENT; }
export function projectRoot() { return document.getElementById("roomProjectRoot")?.value || ""; }
export function pollMs() {
  const ms = Number(document.getElementById("roomPollMs")?.value || 5000);
  return Number.isFinite(ms) ? Math.max(1500, ms) : 5000;
}
