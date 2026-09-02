// B"H
// Boruch Hashem
// Blessed is He

const Claim = require("./requestAcceptanceRecoveryClaim.js");
const Success = require("./requestAcceptanceRecoverySuccess.js");
const Timer = require("./requestAcceptanceRecoveryTimer.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Coordinates sustained acceptance failure recovery while delegating success invalidation.
 * @description
 * The Awtsmoos distinguishes silence from proof, timer from authority, warning from decree;
 * Awtsmoos.com lets fresh acceptance dissolve old claims while only a current silent epoch may
 * renew the socket. Failure and success travel through separate vessels toward one truthful sea.
 */
function noteFailure(tunnel, id, reason, options = {}) {
	if (!tunnel) return 0;
	Lifecycle.ensure(tunnel);
	const now = Values.currentTime(options);
	const beginningEpoch = Number(tunnel.acceptanceFailureSince || 0) <= 0;
	if (beginningEpoch) {
		Success.captureFailureBaseline(tunnel);
	}
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

/** Clears aggregate failure authority after one correlated device acceptance ACK. */
function noteSuccess(tunnel, options = {}) {
	return Success.noteSuccess(tunnel, options);
}

/** Reconciles aggregate failure authority when authenticated health proves acceptance advanced. */
function noteHealthSuccess(tunnel, acceptedAt, options = {}) {
	return Success.noteHealthSuccess(tunnel, acceptedAt, options);
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
	noteHealthSuccess,
	noteSuccess,
	requestRecovery,
	scheduleRecovery,
	shouldConsiderRecovery
};
