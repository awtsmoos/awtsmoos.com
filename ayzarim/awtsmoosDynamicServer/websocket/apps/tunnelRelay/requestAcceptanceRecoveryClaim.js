// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Fences delayed acceptance recovery to one exact failure and registration epoch.
 * @description
 * The Awtsmoos gives every warning its hour and every socket its name; Awtsmoos.com
 * refuses to let an old timer inherit authority after success or registration renewal.
 * A claim may mature as evidence, but only the still-matching living epoch may act.
 */
function beginFailureEpoch(tunnel, observedAt = 0) {
	if (!tunnel) return 0;
	if (Number(tunnel.acceptanceFailureSince || 0) > 0) {
		return Number(tunnel.acceptanceRecoveryEpoch || 0);
	}
	const epoch = advance(tunnel);
	tunnel.acceptanceFailureSince = Number(observedAt || 0);
	tunnel.acceptanceRecoveryMaturedAt = 0;
	return epoch;
}

/** Invalidates every outstanding recovery claim after authoritative success. */
function invalidate(tunnel) {
	if (!tunnel) return 0;
	return advance(tunnel);
}

/** Captures immutable facts that identify the failure streak and registration generation. */
function capture(tunnel = {}) {
	return {
		epoch: Number(tunnel.acceptanceRecoveryEpoch || 0),
		failureSince: Number(tunnel.acceptanceFailureSince || 0),
		registeredAt: Number(tunnel.registeredAt || 0),
		registrationGeneration: Number(tunnel.registrationGeneration || 0)
	};
}

/** Requires a delayed callback to still describe the exact current recovery authority. */
function matches(tunnel, claim = null) {
	if (!tunnel || !claim) return false;
	const current = capture(tunnel);
	return current.epoch === Number(claim.epoch || 0) &&
		current.failureSince > 0 &&
		current.failureSince === Number(claim.failureSince || 0) &&
		current.registeredAt === Number(claim.registeredAt || 0) &&
		current.registrationGeneration === Number(claim.registrationGeneration || 0);
}

function advance(tunnel) {
	const next = Number(tunnel.acceptanceRecoveryEpoch || 0) + 1;
	tunnel.acceptanceRecoveryEpoch = next;
	return next;
}

module.exports = {
	beginFailureEpoch,
	capture,
	invalidate,
	matches
};
