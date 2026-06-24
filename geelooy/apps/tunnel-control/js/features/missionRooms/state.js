// B"H

export const DEFAULT_AGENT = "control-room-human";
const KEY = "awt.missionRooms.selection";

/**
 * B"H
 * Chapter 701: The room remembered its doorway.
 *
 * A mission room is not a passing panel; it is a chamber with a remembered
 * threshold. This small vessel stores only the identity needed to rejoin after
 * reconnect, refresh, or browser return.
 */
export function createRoomState() {
  return {
    missions: [],
    selectedMissionId: "",
    selected: null,
    lastResult: null,
    timer: 0,
    busy: false,
    lastHeartbeatAt: 0
  };
}

export function loadSelection() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
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
