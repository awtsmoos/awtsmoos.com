// B"H

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
 * Keeps blocking filesystem and mission work outside the relay event loop.
 * Socket-mutating configuration remains local so re-registration uses the
 * exact acknowledged connection that received the request.
 */
async function handleFs(payload = {}, webSocket) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_CHILD === "1") {
		return handleFsAction(payload, null);
	}
	if (SOCKET_ACTIONS.has(String(payload.action || ""))) {
		return handleFsAction(payload, webSocket);
	}
	if (PROCESS_OWNED_ACTIONS.has(String(payload.action || ""))) {
		return handleFsAction(payload, webSocket);
	}
	if (
		LIVE_HISTORY_ACTIONS.has(String(payload.action || "")) &&
		payload.full !== true &&
		payload.compact !== false &&
		!["full", "debug", "audit", "raw"].includes(
			String(payload.responseMode || payload.mode || "").toLowerCase()
		)
	) {
		return handleFsAction(payload, webSocket);
	}
	return Executor.execute(payload);
}

module.exports = {
	LIVE_HISTORY_ACTIONS,
	PROCESS_OWNED_ACTIONS,
	SOCKET_ACTIONS,
	handleFs
};
