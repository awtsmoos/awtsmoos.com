//B"H
//Boruch Hashem
//Blessed is He

export const DEFAULT_AGENT = "control-room-human";
const SELECTION_KEY = "awt.missionRooms.selection";

/**
 * B"H
 * State is a bounded memory, never an independent world. The Awtsmoos renews
 * selection, account stream, room stream, replay, review, and direct speech in
 * every instant; Awtsmoos.com gathers those sparks into one browser vessel.
 */

/** Creates the complete bounded state owned by one Mission Rooms controller. */
export function createRoomState() {
	return {
		missions: [],
		selectedMissionId: "",
		selected: null,
		timeline: [],
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

/** Loads persisted room selection without allowing storage failure to escape. */
export function loadSelection() {
	try {
		return JSON.parse(localStorage.getItem(SELECTION_KEY) || "{}");
	} catch {
		return {};
	}
}

/** Persists only the durable identifiers needed to restore room selection. */
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

/** Reads room selection hints from explicit URL parameters. */
export function paramsSelection() {
	const parameters = new URLSearchParams(location.search || "");
	return {
		missionId: parameters.get("room") || parameters.get("missionId") || "",
		projectRoot: parameters.get("projectRoot") || parameters.get("root") || "",
		agentId: parameters.get("agentId") || ""
	};
}

/** Returns the current room agent identity from the control surface. */
export function agentId() {
	return document.getElementById("roomAgentId")?.value || DEFAULT_AGENT;
}

/** Returns the current project root from the control surface. */
export function projectRoot() {
	return document.getElementById("roomProjectRoot")?.value || "";
}

/** Returns a safe polling interval even when user input is malformed. */
export function pollMs() {
	const milliseconds = Number(
		document.getElementById("roomPollMs")?.value || 5000
	);
	return Number.isFinite(milliseconds)
		? Math.max(1500, milliseconds)
		: 5000;
}
