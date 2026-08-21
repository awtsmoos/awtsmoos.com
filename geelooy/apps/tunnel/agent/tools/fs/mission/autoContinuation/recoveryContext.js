// B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./agentEndState.js");
const HandoffPaths = require("./handoffPaths.js");
const Plan = require("../missionPlanContext.js");
const RecoveryAgents = require("./recoveryAgents.js");

const DEFAULT_INACTIVITY_MS = 120000;
const TERMINAL_MISSION = new Set([
	"done", "completed", "succeeded", "failed", "cancelled", "stopped", "aborted"
]);

/**
 * @file Builds one predecessor-to-successor checkpoint with lifecycle, lineage, and absolute handoffs.
 * @description
 * The Awtsmoos does not confuse one messenger ending with the mission ending.
 * Awtsmoos.com names whether the predecessor finished, failed, disconnected, or grew
 * stale, then carries one generation higher with exact handoff vessels under authority.
 */
function build(mission = {}, fingerprint = "", options = {}) {
	const inactivityMs = boundedMs(options.inactivityMs);
	const now = Number(options.now || Date.now());
	const unfinished = !TERMINAL_MISSION.has(String(mission.status || "").toLowerCase());
	const predecessor = unfinished
		? RecoveryAgents.choose(mission, now, inactivityMs)
		: null;
	const staleDetected = Boolean(predecessor && RecoveryAgents.stale(predecessor, now, inactivityMs));
	const checkpoint = Plan.build(mission, {
		lock: options.lock,
		planningFiles: options.planningFiles
	});
	const predecessorGeneration = positive(predecessor?.generation, 1);
	const lifecycle = lifecycleFor(predecessor, staleDetected);
	const successorAgentId = unfinished
		? successorId(mission.id || mission.missionId, predecessor?.agentId, fingerprint)
		: "";
	const base = {
		recoveryReason: reasonFor(unfinished, lifecycle),
		predecessorAgentId: predecessor?.agentId || "",
		predecessorLastSeenAt: predecessor?.lastSeenAt || predecessor?.joinedAt || "",
		predecessorStatus: predecessor?.status || "",
		predecessorLifecycle: lifecycle,
		predecessorIntentional: predecessor?.intentional === true,
		predecessorEndReason: predecessor?.endReason || "",
		predecessorEndedAt: predecessor?.endedAt || "",
		predecessorGeneration,
		successorGeneration: predecessorGeneration + 1,
		spawnGroupId: predecessor?.spawnGroupId || "",
		successorAgentId,
		staleDetected,
		unfinished,
		latestHandoff: checkpoint.latestHandoff,
		recoveryCheckpoint: checkpoint
	};
	return {
		...base,
		handoffPaths: HandoffPaths.collect(options.config || {}, mission, {
			...base,
			projectRoot: options.projectRoot || mission.room?.projectRoot || mission.projectRoot || options.config?.root
		})
	};
}

function lifecycleFor(predecessor, staleDetected) {
	if (staleDetected) return AgentEndState.LIFECYCLES.STALE;
	if (!predecessor) return AgentEndState.LIFECYCLES.ACTIVE;
	if (predecessor.lifecycle === AgentEndState.LIFECYCLES.COMPLETED) {
		return AgentEndState.LIFECYCLES.COMPLETED_REMAINING;
	}
	return predecessor.lifecycle || AgentEndState.LIFECYCLES.ACTIVE;
}

function reasonFor(unfinished, lifecycle) {
	if (!unfinished) return "mission_terminal";
	const reasons = {
		completed_with_remaining_work: "intentional_completion_with_remaining_work",
		failed: "failed_agent_unfinished_mission",
		disconnected: "disconnected_agent_unfinished_mission",
		stale: "stale_agent_unfinished_mission",
		abandoned: "abandoned_agent_unfinished_mission",
		superseded: "superseded_agent_unfinished_mission",
		cancelled: "cancelled_agent_unfinished_mission"
	};
	return reasons[lifecycle] || "unfinished_mission_idle";
}

function successorId(missionId, predecessorId, fingerprint) {
	const mission = clean(missionId || "mission", 24);
	const predecessor = clean(predecessorId || "unassigned", 20);
	const checkpoint = clean(fingerprint || "checkpoint", 18);
	return `successor_${mission}_${predecessor}_${checkpoint}`.slice(0, 80);
}

function boundedMs(value) {
	const number = Number(value || DEFAULT_INACTIVITY_MS);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(number, 3600000))
		: DEFAULT_INACTIVITY_MS;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function clean(value, limit) {
	return String(value || "").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, limit) || "unknown";
}

module.exports = { DEFAULT_INACTIVITY_MS, build, lifecycleFor, reasonFor, successorId };
