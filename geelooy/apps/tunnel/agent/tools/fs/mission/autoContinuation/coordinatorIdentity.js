// B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");

/**
 * @file Builds and reconciles the exact Mission Room successor identity.
 * @description
 * The Awtsmoos lets one checkpoint pass through generations without splitting its
 * lineage. Awtsmoos.com gathers task lease, predecessor fence, session, spawn group,
 * and website mission identity into one small vessel that duplicate ticks must share.
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
		successorGeneration: recovery.successorGeneration,
		generation: recovery.successorGeneration,
		spawnGroupId: recovery.spawnGroupId,
		parentAgentId: recovery.parentAgentId,
		staleDetected: recovery.staleDetected,
		recoveryCheckpoint: recovery.recoveryCheckpoint
	};
}

/**
 * Settles terminal prior continuations and blocks still-living conflicting ones.
 * @param {object} config Scoped tunnel configuration.
 * @param {object} identity Desired successor identity.
 * @param {object} deps Auto-continuation dependencies.
 * @param {object} Helpers Receipt helpers.
 * @returns {object|null} Blocking receipt or null when admission may continue.
 */
function reconcileActive(config, identity, deps, Helpers) {
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
