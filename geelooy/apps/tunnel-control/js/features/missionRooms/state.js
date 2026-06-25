// B"H

export const DEFAULT_AGENT = "control-room-human";
const KEY = "awt.missionRooms.selection";

/** B"H: Room OS state with real action history, search, inspector, replay, and review. */
export function createRoomState() {
  return {
    missions: [], selectedMissionId: "", selected: null, timeline: [], actionHistory: [], roomOs: null,
    events: [], lastResult: null, timer: 0, discoverTimer: 0, replayTimer: 0,
    busy: false, socket: null, eventSource: null, socketMode: "idle", socketError: "", socketReconnect: 0, socketOpenedAt: 0,
    search: "", filter: "all", eventSearch: "", selectedEventId: "", creatingRoom: false, selectedTemplate: "",
    replayEnabled: false, replayPlaying: false, replayIndex: 0, reviewDecisions: {}
  };
}

export function loadSelection() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
export function saveSelection(data = {}) { try { localStorage.setItem(KEY, JSON.stringify({ missionId: data.missionId || "", projectRoot: data.projectRoot || "", agentId: data.agentId || DEFAULT_AGENT, savedAt: new Date().toISOString() })); } catch {} }
export function paramsSelection() { const params = new URLSearchParams(location.search || ""); return { missionId: params.get("room") || params.get("missionId") || "", projectRoot: params.get("projectRoot") || params.get("root") || "", agentId: params.get("agentId") || "" }; }
export function agentId() { return document.getElementById("roomAgentId")?.value || DEFAULT_AGENT; }
export function projectRoot() { return document.getElementById("roomProjectRoot")?.value || ""; }
export function pollMs() { const ms = Number(document.getElementById("roomPollMs")?.value || 5000); return Number.isFinite(ms) ? Math.max(1500, ms) : 5000; }
