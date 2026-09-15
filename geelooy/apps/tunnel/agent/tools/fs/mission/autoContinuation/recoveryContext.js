//B"H
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
 * @description The Awtsmoos lets a messenger end without multiplying the mission;
 * Awtsmoos.com prefers explicit custody and accepts a deterministic debt lease only for recovery.
 */
function build(mission = {}, fingerprint = "", options = {}) {
	const inactivityMs = boundedMs(options.inactivityMs);
	const now = Number(options.now || Date.now());
	const unfinished = !TERMINAL.has(String(mission.status || "").toLowerCase());
	const predecessor = RecoveryAgents.choose(mission, now, inactivityMs);
	const explicitLease = predecessor
		? TaskLease.select(mission, predecessor, now)
		: null;
	const taskLease = explicitLease || options.fallbackTaskLease || null;
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
		staleDetected: Boolean(
			predecessor && RecoveryAgents.stale(predecessor, now, inactivityMs)
		),
		latestHandoff: checkpoint.latestHandoff,
		recoveryCheckpoint: checkpoint
	};
}

function reasonFor(unfinished, predecessor, taskLease, now, inactivityMs) {
	if (!predecessor) return unfinished ? "no_predecessor" : "mission_terminal";
	if (taskLease?.kind === "debt_recovery") return "completion_debt_recovery";
	if (predecessor.ended) return "predecessor_completed_mission_unfinished";
	if (!taskLease) return "no_unfinished_task_lease";
	if (RecoveryAgents.stale(predecessor, now, inactivityMs)) {
		return "stale_agent_unfinished_mission";
	}
	return "unfinished_mission_idle";
}

function emptySuccessor(mission = {}) {
	return {
		roomId: String(mission.room?.id || mission.roomId || mission.id || "room"),
		predecessorGeneration: 1,
		successorGeneration: 2,
		spawnGroupId: "",
		successorAgentId: "",
		successorAgentSessionId: ""
	};
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
