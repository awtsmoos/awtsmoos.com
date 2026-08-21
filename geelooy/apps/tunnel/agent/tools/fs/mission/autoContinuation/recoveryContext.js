// B"H
// Boruch Hashem
// Blessed is He

const Plan = require("../missionPlanContext.js");
const RecoveryAgents = require("./recoveryAgents.js");
const SuccessorIdentity = require("./successorIdentity.js");
const TaskLease = require("./taskLease.js");

const DEFAULT_INACTIVITY_MS = 120000;
const TERMINAL = new Set([
	"done",
	"completed",
	"succeeded",
	"failed",
	"cancelled",
	"stopped",
	"aborted"
]);

/**
 * @file Builds one generation-fenced predecessor-to-successor recovery checkpoint.
 * @description
 * The Awtsmoos lets a messenger end without multiplying the mission. Awtsmoos.com
 * requires concrete task custody, then derives one successor generation and one spawn
 * group that every duplicate recovery tick must share before browser dispatch.
 */
function build(mission = {}, fingerprint = "", options = {}) {
	const inactivityMs = boundedMs(options.inactivityMs);
	const now = Number(options.now || Date.now());
	const unfinished = !TERMINAL.has(String(mission.status || "").toLowerCase());
	const predecessor = unfinished
		? RecoveryAgents.choose(mission, now, inactivityMs)
		: null;
	const taskLease = predecessor
		? TaskLease.select(mission, predecessor, now)
		: null;
	const successor = predecessor && taskLease
		? SuccessorIdentity.build(mission, predecessor, taskLease, fingerprint)
		: emptySuccessor(mission);
	const checkpoint = Plan.build(mission, {
		lock: options.lock,
		planningFiles: options.planningFiles
	});
	return {
		recoveryReason: reasonFor(unfinished, predecessor, taskLease, now, inactivityMs),
		roomId: successor.roomId,
		taskLease,
		predecessorAgentId: predecessor?.agentId || "",
		predecessorGeneration: successor.predecessorGeneration,
		predecessorLastSeenAt: predecessor?.lastSeenAt || predecessor?.joinedAt || "",
		predecessorStatus: predecessor?.status || "",
		successorAgentId: successor.successorAgentId,
		successorGeneration: successor.successorGeneration,
		successorAgentSessionId: successor.successorAgentSessionId,
		spawnGroupId: successor.spawnGroupId,
		parentAgentId: predecessor?.agentId || "",
		unfinished,
		staleDetected: Boolean(predecessor && RecoveryAgents.stale(predecessor, now, inactivityMs)),
		latestHandoff: checkpoint.latestHandoff,
		recoveryCheckpoint: checkpoint
	};
}

function reasonFor(unfinished, predecessor, taskLease, now, inactivityMs) {
	if (!unfinished) return "mission_terminal";
	if (!predecessor) return "no_predecessor";
	if (!taskLease) return "no_unfinished_task_lease";
	if (RecoveryAgents.stale(predecessor, now, inactivityMs)) return "stale_agent_unfinished_mission";
	if (predecessor.ended) return "predecessor_completed_mission_unfinished";
	return "unfinished_mission_idle";
}

function emptySuccessor(mission = {}) {
	return { roomId: String(mission.room?.id || mission.roomId || mission.id || "room"),
		predecessorGeneration: 1, successorGeneration: 2, spawnGroupId: "",
		successorAgentId: "", successorAgentSessionId: "" };
}

function boundedMs(value) {
	const number = Number(value || DEFAULT_INACTIVITY_MS);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(number, 3600000))
		: DEFAULT_INACTIVITY_MS;
}

module.exports = {
	DEFAULT_INACTIVITY_MS,
	build,
	spawnGroup: SuccessorIdentity.spawnGroup,
	successorId: SuccessorIdentity.successorId
};
