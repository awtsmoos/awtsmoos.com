// B"H
// Boruch Hashem
// Blessed is He

const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Converts sustained pre-acceptance silence into one exact socket renewal.
 * @description
 * The Awtsmoos distinguishes one delayed deed from a generation whose gate has gone dim;
 * Awtsmoos.com preserves the healthy parent, closes only the proven socket, and lets reconnection begin.
 */
function noteFailure(tunnel, id, reason, options = {}) {
	if (!tunnel) return 0;
	const now = Values.currentTime(options);
	tunnel.acceptanceFailureCount = Number(tunnel.acceptanceFailureCount || 0) + 1;
	tunnel.acceptanceHealthy = false;
	tunnel.lastAcceptanceFailureAt = now;
	tunnel.lastAcceptanceFailureId = String(id || "");
	tunnel.lastAcceptanceFailureReason = String(reason || "acceptance_timeout");
	if (!Number(tunnel.acceptanceFailureSince || 0)) tunnel.acceptanceFailureSince = now;
	scheduleRecovery(tunnel, options);
	return tunnel.acceptanceFailureCount;
}

/** Clears aggregate failure authority whenever a real native ACK proves the road open. */
function noteSuccess(tunnel, options = {}) {
	if (!tunnel) return false;
	clearRecoveryTimer(tunnel, options);
	tunnel.acceptanceFailureCount = 0;
	tunnel.acceptanceFailureSince = 0;
	tunnel.acceptanceRecoveryRequestedAt = 0;
	tunnel.acceptanceHealthy = true;
	tunnel.lastAcceptanceSuccessAt = Values.currentTime(options);
	tunnel.lastAcceptanceFailureId = "";
	tunnel.lastAcceptanceFailureReason = "";
	return true;
}

/** Arms one bounded recovery timer only after the configured strike threshold. */
function scheduleRecovery(tunnel, options = {}) {
	if (!shouldConsiderRecovery(tunnel, options)) return false;
	const remaining = Values.remainingSustainMs(tunnel, options);
	if (remaining <= 0) return requestRecovery(tunnel, options);
	if (tunnel.acceptanceRecoveryTimer) return false;
	const schedule = options.schedule || setTimeout;
	tunnel.acceptanceRecoveryTimer = schedule(
		() => requestRecovery(tunnel, options),
		remaining
	);
	tunnel.acceptanceRecoveryTimer?.unref?.();
	return true;
}

/** Retires the exact failed client once; native reconnect owns the next generation. */
function requestRecovery(tunnel, options = {}) {
	clearRecoveryTimer(tunnel, options);
	if (!shouldConsiderRecovery(tunnel, options)) return false;
	if (Values.remainingSustainMs(tunnel, options) > 0) {
		return scheduleRecovery(tunnel, options);
	}
	if (Number(tunnel.acceptanceRecoveryRequestedAt || 0) > 0) return false;
	tunnel.acceptanceRecoveryRequestedAt = Values.currentTime(options);
	const close = options.close || defaultClose;
	close(tunnel, Values.RECOVERY_CLOSE_CODE, Values.RECOVERY_CLOSE_REASON);
	return true;
}

/** Returns whether enough consecutive failures exist for aggregate recovery consideration. */
function shouldConsiderRecovery(tunnel, options = {}) {
	return Number(tunnel.acceptanceFailureCount || 0) >= Values.failureThreshold(options) &&
		Number(tunnel.acceptanceRecoveryRequestedAt || 0) === 0;
}

/** Cancels any scheduled recovery so a real success cannot be followed by a stale close. */
function clearRecoveryTimer(tunnel, options = {}) {
	if (!tunnel?.acceptanceRecoveryTimer) return;
	(options.cancel || clearTimeout)(tunnel.acceptanceRecoveryTimer);
	tunnel.acceptanceRecoveryTimer = null;
}

/** Uses the exact WebSocket when available, falling back only for socket-compatible vessels. */
function defaultClose(tunnel, code, reason) {
	if (typeof tunnel?.close === "function") return tunnel.close(code, reason);
	return tunnel?.socket?.end?.();
}

module.exports = {
	noteFailure,
	noteSuccess,
	requestRecovery,
	scheduleRecovery,
	shouldConsiderRecovery
};
