// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Derives one stable website mission identity for each logical helper intention.
 * @description
 * The Awtsmoos renews forms without multiplying one purpose into accidental twins.
 * Awtsmoos.com binds parent mission, specialist reason, goal, and occurrence into one
 * durable browser-vessel name, so repeated missionSpawnNext calls reuse the same tab-work.
 */
function websiteMissionId(parentMissionId, proposal = {}, index = 0) {
	return `mission-child-${digest(stableIntent(parentMissionId, proposal, index))}`;
}

/** Resolves the durable logical parent from request payload or legacy proposal output. */
function parentMissionId(payload = {}, proposals = []) {
	return String(payload.missionId || proposals[0]?.parentMissionId || "mission");
}

/** Builds the exact intention fingerprint used for idempotent browser manifestation. */
function stableIntent(parentId, proposal = {}, index = 0) {
	return [
		String(parentId || ""),
		String(proposal.reason || ""),
		String(proposal.goal || ""),
		String(index)
	].join("\n");
}

/** Returns a short collision-resistant witness for filesystem-safe runtime identifiers. */
function digest(value) {
	return crypto.createHash("sha256")
		.update(String(value))
		.digest("hex")
		.slice(0, 24);
}

module.exports = {
	digest,
	parentMissionId,
	stableIntent,
	websiteMissionId
};
