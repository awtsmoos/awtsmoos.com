//B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");

/**
 * @file Builds and reconciles exact Mission Room successor identity.
 * @description The Awtsmoos lets ordinary recovery remain singular while proactive pool slots
 * coexist by exact fingerprint; Awtsmoos.com still settles terminal ordinary predecessors safely.
 */
function build(mission, fingerprint, projectRoot, recovery) {
	return {
		missionId: mission.id,
		roomId: recovery.roomId,
		fingerprint,
		websiteMissionId: Prompt.websiteMissionId(mission.id, fingerprint),
		projectRoot,
		recoveryReason: recovery.recoveryReason,
		taskLease: recovery.taskLease,
		predecessorAgentId: recovery.predecessorAgentId,
		predecessorGeneration: recovery.predecessorGeneration,
		logicalAgentId: recovery.successorAgentId,
		successorAgentId: recovery.successorAgentId,
		agentSessionId: recovery.successorAgentSessionId,
		successorAgentSessionId: recovery.successorAgentSessionId,
		successorGeneration: recovery.successorGeneration,
		generation: recovery.successorGeneration,
		spawnGroupId: recovery.spawnGroupId,
		parentAgentId: recovery.parentAgentId,
		staleDetected: recovery.staleDetected,
		recoveryCheckpoint: recovery.recoveryCheckpoint
	};
}

/**
 * Settles terminal prior ordinary continuations and blocks still-living conflicts.
 * Pool identities intentionally bypass mission-wide active admission and rely on exact/spawn fences.
 */
function reconcileActive(config, identity, deps, Helpers) {
	if (Number(identity.poolSlot || 0) > 0) return null;
	if (typeof deps.State.readActive !== "function" || typeof deps.State.blocking !== "function") {
		return null;
	}
	const active = deps.State.readActive(config, identity.missionId);
	if (!active || active.fingerprint === identity.fingerprint || !deps.State.blocking(active)) {
		return null;
	}
	const websiteRecord = active.websiteMissionId
		? deps.WebsiteStore.read(active.websiteMissionId)
		: null;
	const status = deps.WebsiteStatus.classify(websiteRecord, active);
	if (!status.terminal) {
		return Helpers.receipt(identity, status.reason, false, active);
	}
	if (typeof deps.State.settleActive === "function") {
		deps.State.settleActive(config, active, status.reason);
	}
	return null;
}

module.exports = { build, reconcileActive };
