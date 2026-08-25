// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Transfers mission ownership without discarding unfinished continuation evidence.
 * @description
 * The Awtsmoos lets one shliach yield and another continue the same unfinished flame;
 * Awtsmoos.com refuses anonymous custody and records predecessor, successor, and history
 * while preserving must-call-next, continuation, and remaining-work fields without shame.
 */
function claim(lock = {}, agentId) {
	const owner = cleanIdentity(agentId);
	if (!owner) {
		throw codedError("takeover_identity_required");
	}
	const previousOwner = cleanIdentity(lock.owner) || null;
	const takeoverAt = Date.now();
	const takeoverHistory = Array.isArray(lock.takeoverHistory)
		? [...lock.takeoverHistory]
		: [];
	takeoverHistory.push({
		from: previousOwner,
		to: owner,
		at: takeoverAt
	});
	return {
		...lock,
		owner,
		previousOwner,
		takeoverAt,
		takeoverCount: Number(lock.takeoverCount || 0) + 1,
		takeoverHistory
	};
}

function identity(payload = {}) {
	return cleanIdentity(
		payload.agentId
		|| payload.logicalAgentId
		|| payload.claimantAgentId
		|| payload.owner
	);
}

function cleanIdentity(value) {
	return String(value || "").trim().slice(0, 256);
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	claim,
	identity
};
