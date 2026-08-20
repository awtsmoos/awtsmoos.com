// B"H
// Boruch Hashem
// Blessed is He

const ALLOWED_REPAIR_ACTIONS = Object.freeze([
	"awtsmoosMyDevice", "tunnelDoctor", "tunnelLivenessTimeline", "agentDoctor",
	"agentSelfTest", "agentVersionSkewCheck", "payloadEcho", "actionSchemaTrace",
	"actionHistoryGet", "actionHistoryList", "actionHistorySearch", "commandStatus",
	"commandWait", "commandPoll", "commandJobStatus", "commandJobWait",
	"commandJobOutputPage", "commandCancel", "commandJobCancel", "missionGet",
	"missionStatus", "missionRecovery", "missionHeartbeat", "missionDaemonStatus",
	"missionWatchdogStatus", "missionWatchdogRecover"
]);

/**
 * @file Explains exclusive mission denials without hiding the controlling authority.
 * @description
 * The Awtsmoos makes the closed gate readable, so Awtsmoos.com never answers only "blocked";
 * mission, owner, mode, root, lifecycle, and next deed travel together as the proof unlocked.
 */
function response(action, lock = {}) {
	const next = saneNext(lock);
	const proof = denialProof(action, lock, next);
	return {
		ok: false,
		action,
		actualAction: action,
		requestAction: action,
		error: "mission_lock_blocks_action",
		blockedAction: action,
		blockedBy: proof.guard,
		denialProof: proof,
		finalAnswerAllowed: false,
		mustContinue: true,
		mustCallNext: next,
		missionId: lock.missionId || "",
		releaseStatus: lock.releaseStatus || "locked",
		mission: {
			locked: true,
			missionId: lock.missionId || "",
			status: lock.releaseStatus || "locked",
			next,
			guidance: guidance(action, next)
		},
		agentGuidance: "An exclusive mission authority blocked this action. Inspect denialProof and call the required mission or repair action.",
		responseFocus: {
			missionLocked: true,
			originalActionPreserved: action,
			nextRequiredToolCall: next,
			oneMainThing: "Follow the exact mission next action or a listed liveness/repair action."
		},
		recovery: { allowedRepairActions: [...ALLOWED_REPAIR_ACTIONS], ignoreMissionLockForGenuineRepair: true }
	};
}

function denialProof(action, lock = {}, next = {}) {
	return {
		guard: "mission_active_guard",
		blockedAction: String(action || ""),
		missionId: String(lock.missionId || ""),
		owner: String(lock.owner || ""),
		mode: String(lock.mode || ""),
		projectRoot: String(lock.projectRoot || ""),
		releaseStatus: String(lock.releaseStatus || "locked"),
		authorityState: String(lock.authorityState || "active"),
		authorityGeneration: String(lock.authorityGeneration || ""),
		blockedOn: lock.blockedOn || null,
		nextAction: next,
		nextReason: String(next.reason || lock.revocation?.reason || "mission_authority_active")
	};
}

function saneNext(lock = {}) {
	const next = lock.lastMustCallNext || null;
	const missionId = String(lock.missionId || "");
	if (!next || typeof next !== "object") return fallback(missionId, "missing_lock_next_action");
	const action = String(next.action || "");
	const nextMission = String(next.missionId || "");
	if (!action) return fallback(missionId, "empty_lock_next_action");
	if (action.startsWith("mission") && missionId && nextMission && nextMission !== missionId) {
		return boot(missionId, "stale_lock_next_mission_id");
	}
	if (action.startsWith("mission") && !nextMission && action !== "missionBootResume") {
		return boot(missionId, "missing_lock_next_mission_id");
	}
	return next;
}

function guidance(action, next = {}) {
	return { originalActionPreserved: action, nextAction: next, recovery: "Inspect denialProof, then call the next mission or allowed repair action." };
}

function fallback(missionId, reason) {
	return { action: "missionDaemonTick", missionId, reason };
}

function boot(missionId, reason) {
	return { action: "missionBootResume", missionId, autoMission: true, tick: true, reason };
}

module.exports = { ALLOWED_REPAIR_ACTIONS, denialProof, guidance, response, saneNext };
