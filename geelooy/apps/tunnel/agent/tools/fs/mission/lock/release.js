// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./store.js");
const Config = require("./config.js");
const ProjectRoots = require("../projectRootRegistry.js");

const ALLOWED = new Set([
	"userStop",
	"safetyBlock",
	"leaseExpired",
	"fatalCorruption",
	"toolAccessLost",
	"testingEmergencyStop",
	"user_approved_release_and_debt_clear"
]);

/**
 * @file Separates final mission release from reversible loss of filesystem authority.
 * @description
 * The Awtsmoos may preserve a mission's story while closing its hand upon the root;
 * Awtsmoos.com records revocation as evidence, never as deletion, so thaw may grow a fresh shoot.
 */
function canRelease(result = {}) {
	if (result.action !== "missionFinalize" || result.finalAnswerAllowed !== true || result.mustContinue === true) {
		return false;
	}
	return ALLOWED.has(result.stopReason || "") ||
		result.releaseApprovedByUser === true ||
		result.covenant?.releaseApprovedByUser === true;
}

function release(config, result = {}) {
	const lock = Store.get(config);
	if (!lock) return null;
	const timestamp = Config.now();
	lock.releaseAllowed = true;
	lock.releaseStatus = Config.RELEASED;
	lock.releasedAt = timestamp;
	lock.releaseResult = {
		action: result.action,
		at: timestamp,
		stopReason: result.stopReason || "",
		policy: "validated_release_only"
	};
	deactivate(config, lock, "mission_released");
	return Store.set(config, lock);
}

function revoke(config, result = {}, reason = "authority_revoked") {
	const lock = Store.get(config);
	if (!lock || lock.releaseAllowed === true) return lock || null;
	const timestamp = Config.now();
	lock.releaseAllowed = true;
	lock.releaseStatus = "revoked";
	lock.revokedAt = timestamp;
	lock.authorityState = "revoked";
	lock.revocation = {
		action: result.action || "missionAuthorityReconcile",
		at: timestamp,
		reason: String(reason || "authority_revoked")
	};
	deactivate(config, lock, reason);
	return Store.set(config, lock);
}

function deactivate(config, lock, reason) {
	try {
		ProjectRoots.deactivate(config, lock.missionId, reason);
		delete lock.projectRootWitnessError;
	} catch (error) {
		lock.projectRootWitnessError = error?.message || String(error);
	}
}

module.exports = {
	ALLOWED,
	canRelease,
	release,
	revoke
};
