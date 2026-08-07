// B"H
// Boruch Hashem
// Blessed is He

const { handleFsAction } = require("./actions.js");
const Executor = require("./executor/index.js");

const SOCKET_ACTIONS = new Set(["configSet", "rootSelect"]);
const LIVE_HISTORY_ACTIONS = new Set([
	"actionHistoryGet",
	"actionHistoryList",
	"actionHistorySearch"
]);
const PROCESS_OWNED_ACTIONS = new Set([
	"agent",
	"aiAgentSpawnWebsiteMission",
	"aiAgentWebsiteMissionStatus",
	"websiteAgentMissionStart",
	"websiteAgentMissionStatus",
	"websiteAgentMissionList",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
]);

/**
 * @file Chooses local ownership or isolated filesystem execution explicitly.
 * @description
 * The Awtsmoos gives each deed its proper vessel. Awtsmoos.com keeps socket-owned
 * work beside the live connection, while ordinary filesystem work enters a real
 * worker pool whose assignment can be witnessed without exposing request payloads.
 */
async function handleFs(payload = {}, webSocket, executionObserver = null) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_CHILD === "1") {
		return handleFsAction(payload, null);
	}
	if (!requiresExecutor(payload)) {
		executionObserver?.mark?.("fs_local_started", {
			consumerStarted: true,
			queued: false
		});
		return handleFsAction(payload, webSocket);
	}
	return Executor.execute(payload, executionObserver);
}

/**
 * Determines whether one filesystem action must cross the isolated worker boundary.
 * @param {object} payload Normalized filesystem request.
 * @returns {boolean} True when a worker assignment is required.
 */
function requiresExecutor(payload = {}) {
	const action = String(payload.action || "");
	if (SOCKET_ACTIONS.has(action)) return false;
	if (PROCESS_OWNED_ACTIONS.has(action)) return false;
	if (!LIVE_HISTORY_ACTIONS.has(action)) return true;
	return !(
		payload.full !== true &&
		payload.compact !== false &&
		!["full", "debug", "audit", "raw"].includes(
			String(payload.responseMode || payload.mode || "").toLowerCase()
		)
	);
}

module.exports = {
	LIVE_HISTORY_ACTIONS,
	PROCESS_OWNED_ACTIONS,
	SOCKET_ACTIONS,
	handleFs,
	requiresExecutor
};
