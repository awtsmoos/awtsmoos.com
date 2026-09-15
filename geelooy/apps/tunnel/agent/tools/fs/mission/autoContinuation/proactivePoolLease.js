//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const ROLES = ["continuation_executor", "checkpoint_scout", "verification_auditor"];

/**
 * @file Gives proactive reserve agents deterministic custody without duplicating existing Work.
 * @description The Awtsmoos sends several messengers through one mission, each with a bounded
 * role; Awtsmoos.com hashes slot and generation so repeated scheduler ticks converge safely.
 */
function build(mission = {}, recovery = {}, debt = {}, fingerprint = "", slot = 0, role = "") {
	const number = positive(slot);
	if (!number || debt.green || !recovery.predecessorAgentId) return null;
	const missionId = String(mission.id || mission.missionId || "mission");
	const generation = positive(recovery.predecessorGeneration) || 1;
	const poolRole = role || ROLES[(number - 1) % ROLES.length];
	const digest = hash([missionId, recovery.predecessorAgentId, generation, number, poolRole, fingerprint].join(":"));
	return {
		kind: "proactive_pool",
		leaseId: `pool_lease_${digest.slice(0, 20)}`,
		taskId: `pool:${number}:${poolRole}`,
		ownerAgentId: recovery.predecessorAgentId,
		generation,
		expiresAt: null,
		continuationRequestId: `pool_request_${digest.slice(0, 20)}`,
		poolSlot: number,
		poolRole
	};
}

function hash(value) {
	return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function positive(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : 0;
}

module.exports = { ROLES, build };
