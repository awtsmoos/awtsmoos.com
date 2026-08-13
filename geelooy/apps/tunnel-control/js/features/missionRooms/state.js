// B"H
// Boruch Hashem
// Blessed is He

export const DEFAULT_AGENT = "control-room-human";
const SELECTION_KEY = "awt.missionRooms.selection";

/**
 * @file Owns the one bounded browser-memory vessel for Mission Rooms.
 * @description The Awtsmoos renews room, stream, checkpoint, replay, and speech each instant;
 * Awtsmoos.com gathers them into one store so live mission progress never creates a rival controller.
 */
export function createRoomState() {
	return {
		missions: [],
		selectedMissionId: "",
		selected: null,
		timeline: [],
		liveProgress: null,
		actionHistory: [],
		roomOs: null,
		events: [],
		accountEvents: [],
		accountConnectionState: "idle",
		lastResult: null,
		timer: 0,
		discoverTimer: 0,
		replayTimer: 0,
		busy: false,
		mounted: false,
		paneActive: false,
		activationRevision: 0,
		abortController: null,
		socket: null,
		eventSource: null,
		roomTransport: null,
		socketMode: "idle",
		socketError: "",
		socketReconnect: 0,
		socketOpenedAt: 0,
		transportAttempt: 0,
		transportDiagnostics: null,
		search: "",
		filter: "all",
		eventSearch: "",
		selectedEventId: "",
		selectedAgentId: "",
		agentChatBusy: false,
		agentChatError: "",
		agentChatDrafts: {},
		creatingRoom: false,
		selectedTemplate: "",
		replayEnabled: false,
		replayPlaying: false,
		replayIndex: 0,
		reviewDecisions: {},
		continuation: null,
		continuationPresets: {},
		resourceStatus: {},
		turnBusy: false,
		turnError: ""
	};
}

export function loadSelection() {
	try {
		return JSON.parse(localStorage.getItem(SELECTION_KEY) || "{}");
	} catch {
		return {};
	}
}

export function saveSelection(data = {}) {
	try {
		localStorage.setItem(SELECTION_KEY, JSON.stringify({
			missionId: data.missionId || "",
			projectRoot: data.projectRoot || "",
			agentId: data.agentId || DEFAULT_AGENT,
			savedAt: new Date().toISOString()
		}));
	} catch {
		// Browser storage can be denied; active state remains available in memory.
	}
}

export function paramsSelection() {
	const parameters = new URLSearchParams(location.search || "");
	return {
		missionId: parameters.get("room") || parameters.get("missionId") || "",
		projectRoot: parameters.get("projectRoot") || parameters.get("root") || "",
		agentId: parameters.get("agentId") || ""
	};
}

export function agentId() {
	return document.getElementById("roomAgentId")?.value || DEFAULT_AGENT;
}

export function projectRoot() {
	return document.getElementById("roomProjectRoot")?.value || "";
}

export function pollMs() {
	const milliseconds = Number(document.getElementById("roomPollMs")?.value || 5000);
	return Number.isFinite(milliseconds) ? Math.max(1500, milliseconds) : 5000;
}
