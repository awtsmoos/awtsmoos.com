// B"H
// Boruch Hashem
// Blessed is He

const Claim = require("./requestAcceptanceRecoveryClaim.js");
const Timer = require("./requestAcceptanceRecoveryTimer.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Converts sustained acceptance silence into one exact, freshly-confirmed socket renewal.
 * @description
 * The Awtsmoos distinguishes a warning that merely aged from a failure that still lives.
 * Awtsmoos.com lets timers mature as evidence but never swing the sword themselves;
 * only a new timeout after the sustained window may renew the still-matching socket.
 */
function noteFailure(tunnel, id, reason, options = {}) {
	if (!tunnel) return 0;
	const now = Values.currentTime(options);
	Claim.beginFailureEpoch(tunnel, now);
	tunnel.acceptanceFailureCount = Number(tunnel.acceptanceFailureCount || 0) + 1;
	tunnel.acceptanceHealthy = false;
	tunnel.lastAcceptanceFailureAt = now;
	tunnel.lastAcceptanceFailureId = String(id || "");
	tunnel.lastAcceptanceFailureReason = String(reason || "acceptance_timeout");
	if (Timer.eligible(tunnel, options)) {
		if (Values.remainingSustainMs(tunnel, options) <= 0) {
			requestRecovery(tunnel, options, Claim.capture(tunnel));
		} else {
			Timer.schedule(tunnel, options);
		}
	}
	return tunnel.acceptanceFailureCount;
}

/** Clears aggregate failure authority and invalidates every delayed claim after a real ACK. */
function noteSuccess(tunnel, options = {}) {
	if (!tunnel) return false;
	Timer.clear(tunnel, options);
	Claim.invalidate(tunnel);
	tunnel.acceptanceFailureCount = 0;
	tunnel.acceptanceFailureSince = 0;
	tunnel.acceptanceRecoveryMaturedAt = 0;
	tunnel.acceptanceRecoveryRequestedAt = 0;
	tunnel.acceptanceHealthy = true;
	tunnel.lastAcceptanceSuccessAt = Values.currentTime(options);
	tunnel.lastAcceptanceFailureId = "";
	tunnel.lastAcceptanceFailureReason = "";
	return true;
}

/** Closes only after a fresh failure confirms the same mature registration epoch is silent. */
function requestRecovery(tunnel, options = {}, claim = null) {
	const recoveryClaim = claim || Claim.capture(tunnel);
	if (!Claim.matches(tunnel, recoveryClaim)) return false;
	if (!Timer.eligible(tunnel, options)) return false;
	if (Values.remainingSustainMs(tunnel, options) > 0) return false;
	if (Number(tunnel.acceptanceRecoveryRequestedAt || 0) > 0) return false;
	Timer.clear(tunnel, options);
	const now = Values.currentTime(options);
	tunnel.acceptanceRecoveryMaturedAt = now;
	tunnel.acceptanceRecoveryRequestedAt = now;
	const close = options.close || defaultClose;
	close(tunnel, Values.RECOVERY_CLOSE_CODE, Values.RECOVERY_CLOSE_REASON);
	return true;
}

/** Preserves the former public helpers while delegating timer-only evidence to its own vessel. */
function scheduleRecovery(tunnel, options = {}) {
	return Timer.schedule(tunnel, options);
}

function matureRecovery(tunnel, options = {}, claim = null, timer = null) {
	return Timer.mature(tunnel, options, claim, timer);
}

function shouldConsiderRecovery(tunnel, options = {}) {
	return Timer.eligible(tunnel, options);
}

function defaultClose(tunnel, code, reason) {
	if (typeof tunnel?.close === "function") return tunnel.close(code, reason);
	return tunnel?.socket?.end?.();
}

module.exports = {
	matureRecovery,
	noteFailure,
	noteSuccess,
	requestRecovery,
	scheduleRecovery,
	shouldConsiderRecovery
};
