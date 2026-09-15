//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Derives one deterministic recovery lease when durable completion debt outlives task custody.
 * @description The Awtsmoos lets a vanished messenger leave unfinished truth behind;
 * Awtsmoos.com turns that debt into one stable recovery key, never duplicate phantom work.
 */
function build(mission = {}, recovery = {}, debt = {}, fingerprint = "") {
	if (debt.green || !recovery.predecessorAgentId) return null;
	if (!recovery.staleDetected && recovery.recoveryReason !== "predecessor_completed_mission_unfinished") {
		return null;
	}
	const missionId = String(mission.id || mission.missionId || "mission");
	const generation = positive(recovery.predecessorGeneration, 1);
	const primaryDebt = debt.remainingWork?.[0]?.id
		|| debt.obligations?.[0]?.obligationId
		|| debt.reasons?.[0]
		|| "verification";
	const digest = hash([missionId, recovery.predecessorAgentId, generation, primaryDebt, fingerprint].join(":"));
	return {
		kind: "debt_recovery",
		leaseId: `debt_lease_${digest.slice(0, 20)}`,
		taskId: `debt:${String(primaryDebt)}`,
		ownerAgentId: recovery.predecessorAgentId,
		generation,
		expiresAt: null,
		continuationRequestId: `debt_request_${digest.slice(0, 20)}`
	};
}

function hash(value) {
	return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = { build };
