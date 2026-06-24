// B"H

export const DEFAULT_AGENT = "control-room-human";
const KEY = "awt.missionRooms.selection";

/**
 * B"H
 * Chapter 710: The room carried tools and command traces in memory.
 */
export function createRoomState() {
  return {
    missions: [],
    selectedMissionId: "",
    selected: null,
    lastResult: null,
    tools: [],
    toolFilter: "",
    commandRows: [],
    liveGroups: [],
    timer: 0,
    discoverTimer: 0,
    toolsTimer: 0,
    busy: false,
    lastHeartbeatAt: 0
  };
}

export function loadSelection() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

export function saveSelection(data = {}) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      missionId: data.missionId || "",
      projectRoot: data.projectRoot || "",
      agentId: data.agentId || DEFAULT_AGENT,
      savedAt: new Date().toISOString()
    }));
  } catch {}
}

export function paramsSelection() {
  const params = new URLSearchParams(location.search || "");
  return {
    missionId: params.get("room") || params.get("missionId") || "",
    projectRoot: params.get("projectRoot") || params.get("root") || "",
    agentId: params.get("agentId") || ""
  };
}

export function agentId() {
  return document.getElementById("roomAgentId")?.value || DEFAULT_AGENT;
}

export function projectRoot() {
  return document.getElementById("roomProjectRoot")?.value || "";
}

export function pollMs() {
  const ms = Number(document.getElementById("roomPollMs")?.value || 5000);
  return Number.isFinite(ms) ? Math.max(1500, ms) : 5000;
}

export function toolFilter() {
  return document.getElementById("roomToolFilter")?.value || "";
}
