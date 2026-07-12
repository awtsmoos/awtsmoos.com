// B"H

const READ_ONLY_ACTIONS = new Set([
	"missionGet",
	"missionList",
	"missionTimeline",
	"missionGraph",
	"missionReport",
	"missionQueueStatus",
	"missionProtocolNext",
	"missionProtocolStatus",
	"missionProtocolFinalizeCheck",
	"missionRoomStatus",
	"missionRoomFindActive",
	"missionRoomInbox",
	"missionRoomLoopStatus",
	"missionRoomFileConflicts",
	"missionMetadataStatus",
	"missionProjectDiscover",
	"missionProjectStatus",
	"missionSelfImproveStatus",
	"missionSelfImproveSchedulerStatus",
	"missionOsStatus",
	"missionOsPrompt",
	"missionRoomLiveStatus",
	"missionRoomSchedulerStatus",
	"missionDaemonStatus",
	"missionWatchdogStatus",
	"missionTurnStatus",
	"missionResourceStatus"
]);

function missionId(payload = {}) {
	return payload.missionId || payload.id || payload.target || payload.parentMissionId || "";
}

function rootOf(config = {}, payload = {}) {
	return config.root || payload.projectRoot || payload.root || payload.cwd || process.cwd();
}

function shouldSerialize(payload = {}) {
	const action = String(payload.action || "");
	return action.startsWith("mission") && !READ_ONLY_ACTIONS.has(action);
}

function transactionKey(config = {}, payload = {}) {
	if (!shouldSerialize(payload)) return "";
	const root = rootOf(config, payload);
	const id = missionId(payload);
	if (id) return `${root}::mission::${id}`;
	const project = payload.projectRoot || payload.root || payload.cwd || "root";
	return `${root}::mission-root::${project}`;
}

module.exports = { READ_ONLY_ACTIONS, missionId, shouldSerialize, transactionKey };
