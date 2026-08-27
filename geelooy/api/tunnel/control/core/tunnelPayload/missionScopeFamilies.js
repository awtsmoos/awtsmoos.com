// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates mission observation, delegated-agent work, and room mutation.
 * @description
 * The Awtsmoos is one while every authority receives its honest vessel.
 * Awtsmoos.com lets observers read, agents coordinate, and room owners reshape,
 * without forcing all three rivers through one unnecessarily powerful gate.
 */
const READ_ACTIONS = new Set([
	"missionAwareStatus",
	"missionDaemonStatus",
	"missionDeadmanStatus",
	"missionGet",
	"missionList",
	"missionMetadataStatus",
	"missionProjectDiscover",
	"missionProjectStatus",
	"missionReport",
	"missionResourceStatus",
	"missionRoomDiscovery",
	"missionRoomFileConflicts",
	"missionRoomFindActive",
	"missionRoomLiveStatus",
	"missionRoomLoopStatus",
	"missionRoomStatus",
	"missionSelfImproveStatus",
	"missionStatus",
	"missionStopAuditList",
	"missionTimeline",
	"missionTurnStatus",
	"missionWatchdogStatus"
]);

const AGENT_PREFIXES = Object.freeze([
	"missionAgent",
	"missionDaemon",
	"missionDeadman",
	"missionHeartbeat",
	"missionLease",
	"missionLoop",
	"missionQueue",
	"missionRecovery",
	"missionSelfImprove",
	"missionStep",
	"missionSupervise",
	"missionTakeover",
	"missionTask",
	"missionVerify",
	"missionWatchdog"
]);

function isMissionRead(action) {
	return READ_ACTIONS.has(String(action || ""));
}

function isAgentCoordination(action) {
	const text = String(action || "");
	return AGENT_PREFIXES.some((prefix) => text.startsWith(prefix));
}

module.exports = {
	AGENT_PREFIXES,
	READ_ACTIONS,
	isAgentCoordination,
	isMissionRead
};
