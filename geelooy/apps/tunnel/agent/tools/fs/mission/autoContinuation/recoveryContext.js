// B"H
// Boruch Hashem
// Blessed is He

const Plan = require("../missionPlanContext.js");
const RecoveryAgents = require("./recoveryAgents.js");
const DEFAULT_INACTIVITY_MS = 120000;
const TERMINAL = new Set([
	"done", "completed", "succeeded", "failed", "cancelled", "stopped", "aborted"
]);

/**
 * @file Builds the bounded predecessor-to-successor recovery checkpoint.
 * @description The Awtsmoos does not confuse one messenger ending with the mission ending;
 * Awtsmoos.com binds predecessor testimony, unfinished plan, and fingerprint into one
 * deterministic successor identity that repeated recovery ticks cannot multiply.
 */
function build(mission = {}, fingerprint = "", options = {}) {
	const inactivityMs = boundedMs(options.inactivityMs);
	const now = Number(options.now || Date.now());
	const unfinished = !TERMINAL.has(String(mission.status || "").toLowerCase());
	const predecessor = unfinished
		? RecoveryAgents.choose(mission, now, inactivityMs)
		: null;
	const staleDetected = Boolean(
		predecessor && RecoveryAgents.stale(predecessor, now, inactivityMs)
	);
	const checkpoint = Plan.build(mission, {
		lock: options.lock,
		planningFiles: options.planningFiles
	});
	return {
		recoveryReason: reasonFor(unfinished, predecessor, staleDetected),
		predecessorAgentId: predecessor?.agentId || "",
		predecessorLastSeenAt: predecessor?.lastSeenAt || predecessor?.joinedAt || "",
		predecessorStatus: predecessor?.status || "",
		predecessorEndReason: predecessor?.endReason || "",
		predecessorEndedAt: predecessor?.endedAt || "",
		successorAgentId: unfinished
			? successorId(mission.id || mission.missionId, predecessor?.agentId, fingerprint)
			: "",
		staleDetected,
		unfinished,
		latestHandoff: checkpoint.latestHandoff,
		recoveryCheckpoint: checkpoint
	};
}

function reasonFor(unfinished, predecessor, staleDetected) {
	if (!unfinished) return "mission_terminal";
	if (staleDetected) return "stale_agent_unfinished_mission";
	if (predecessor?.ended) return "predecessor_completed_mission_unfinished";
	return "unfinished_mission_idle";
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

function clean(value, limit) {
	return String(value || "")
		.replace(/[^a-z0-9_-]+/gi, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, limit) || "unknown";
}

module.exports = {
	DEFAULT_INACTIVITY_MS,
	build,
	successorId
};
