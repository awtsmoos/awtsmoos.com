// B"H
// Boruch Hashem
// Blessed is He

const Claim = require("./requestAcceptanceRecoveryClaim.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Lets sustained acceptance silence mature without granting a timer destructive authority.
 * @description
 * The Awtsmoos lets time reveal evidence while Awtsmoos.com keeps action bound to a fresh deed.
 * A timer may say "the silence lasted," but it may never close a socket; later failure must confirm.
 */
function eligible(tunnel, options = {}) {
	return Number(tunnel?.acceptanceFailureCount || 0) >= Values.failureThreshold(options) &&
		Number(tunnel?.acceptanceRecoveryRequestedAt || 0) === 0;
}

/** Schedules one maturity witness for the exact current failure and registration claim. */
function schedule(tunnel, options = {}) {
	if (!eligible(tunnel, options)) return false;
	const remaining = Values.remainingSustainMs(tunnel, options);
	if (remaining <= 0) return mature(tunnel, options, Claim.capture(tunnel));
	const claim = Claim.capture(tunnel);
	if (tunnel.acceptanceRecoveryTimer) {
		if (Claim.matches(tunnel, tunnel.acceptanceRecoveryTimerClaim)) return false;
		clear(tunnel, options);
	}
	const scheduleTimer = options.schedule || setTimeout;
	let timer = null;
	timer = scheduleTimer(() => mature(tunnel, options, claim, timer), remaining);
	tunnel.acceptanceRecoveryTimer = timer;
	tunnel.acceptanceRecoveryTimerClaim = claim;
	timer?.unref?.();
	return true;
}

/** Records maturity only when the callback still owns the exact living failure epoch. */
function mature(tunnel, options = {}, claim = null, timer = null) {
	if (timer && tunnel?.acceptanceRecoveryTimer === timer) {
		tunnel.acceptanceRecoveryTimer = null;
		tunnel.acceptanceRecoveryTimerClaim = null;
	}
	if (!Claim.matches(tunnel, claim)) return false;
	if (!eligible(tunnel, options)) return false;
	if (Values.remainingSustainMs(tunnel, options) > 0) return schedule(tunnel, options);
	tunnel.acceptanceRecoveryMaturedAt = Values.currentTime(options);
	return true;
}

/** Cancels only the current maturity timer and forgets its matching claim. */
function clear(tunnel, options = {}) {
	if (!tunnel?.acceptanceRecoveryTimer) return;
	(options.cancel || clearTimeout)(tunnel.acceptanceRecoveryTimer);
	tunnel.acceptanceRecoveryTimer = null;
	tunnel.acceptanceRecoveryTimerClaim = null;
}

module.exports = {
	clear,
	eligible,
	mature,
	schedule
};
