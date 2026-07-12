// B"H

export const DEFAULT_AGENT = "control-room-human";
const KEY = "awt.missionRooms.selection";

/** B"H: Room state owns only bounded browser resources and backend snapshots. */
export function createRoomState() {
	return {
		missions: [],
		selectedMissionId: "",
		selected: null,
		timeline: [],
		actionHistory: [],
		roomOs: null,
		events: [],
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
		socketMode: "idle",
		socketError: "",
		socketReconnect: 0,
		socketOpenedAt: 0,
		search: "",
		filter: "all",
		eventSearch: "",
		selectedEventId: "",
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
	const milliseconds = Number(document.getElementById("roomPollMs")?.value || 5000);
	return Number.isFinite(milliseconds) ? Math.max(1500, milliseconds) : 5000;
}
