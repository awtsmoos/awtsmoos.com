// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Judges execution and acceptance authority without confusing either with transport life.
 * @description
 * The Awtsmoos keeps the road alive even when one inner vessel is wounded;
 * Awtsmoos.com lets protected repair still enter, while ordinary work waits when fresh failure is sounded.
 */
function hasFreshExecutionFailure(device = {}) {
	return device.executionHealthSupported === true &&
		device.executionHealthFresh !== false &&
		device.executionHealthy === false;
}

/** Returns true only for fresh explicit acceptance failure, never mere lack of recent work. */
function hasFreshAcceptanceFailure(device = {}) {
	return device.acceptanceHealthSupported === true &&
		device.acceptanceHealthFresh === true &&
		device.acceptanceHealthy === false;
}

/** Keeps legacy/stale execution testimony routable unless current evidence proves failure. */
function hasExecutionAuthority(device = {}) {
	return !hasFreshExecutionFailure(device);
}

/** Keeps unproven acceptance routable so a new deed can establish current truth. */
function hasAcceptanceAuthority(device = {}) {
	return !hasFreshAcceptanceFailure(device);
}

/** Requires both inner health dimensions to authorize ordinary native execution. */
function hasOrdinaryAuthority(device = {}) {
	return hasExecutionAuthority(device) && hasAcceptanceAuthority(device);
}

/** Returns a human-readable reason for the first fresh authority block. */
function blockedReason(device = {}) {
	if (hasFreshAcceptanceFailure(device)) return "acceptance_unavailable";
	if (hasFreshExecutionFailure(device)) return "execution_unhealthy";
	return "";
}

module.exports = {
	blockedReason,
	hasAcceptanceAuthority,
	hasExecutionAuthority,
	hasFreshAcceptanceFailure,
	hasFreshExecutionFailure,
	hasOrdinaryAuthority
};
