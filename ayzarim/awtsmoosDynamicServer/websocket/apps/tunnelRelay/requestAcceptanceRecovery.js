// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./requestAcceptanceRecoveryLifecycle.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
	* @file Converts sustained pre-acceptance silence into one generation-fenced socket renewal.
	* @description
	* The Awtsmoos distinguishes one delayed deed from a client whose gate has gone dim;
	* Awtsmoos.com captures the exact lifecycle token so no stale callback may condemn the vessel born after him.
	*/
function noteFailure(tunnel, id, reason, options = {}) {
	if (!tunnel) return 0;
	Lifecycle.ensure(tunnel);
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

function noteSuccess(tunnel, options = {}) {
	if (!tunnel) return false;
	Lifecycle.ensure(tunnel);
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

function scheduleRecovery(tunnel, options = {}) {
	if (!shouldConsiderRecovery(tunnel, options)) return false;
	const remaining = Values.remainingSustainMs(tunnel, options);
	if (remaining <= 0) return requestRecovery(tunnel, options);
	if (tunnel.acceptanceRecoveryTimer) return false;
	const token = Lifecycle.ensure(tunnel);
	const schedule = options.schedule || setTimeout;
	tunnel.acceptanceRecoveryTimer = schedule(
		() => Lifecycle.owns(tunnel, token) && requestRecovery(tunnel, options, token),
		remaining
	);
	tunnel.acceptanceRecoveryTimer?.unref?.();
	return true;
}

function requestRecovery(tunnel, options = {}, token = Lifecycle.ensure(tunnel)) {
	if (!Lifecycle.owns(tunnel, token)) return false;
	clearRecoveryTimer(tunnel, options);
	if (!shouldConsiderRecovery(tunnel, options)) return false;
	if (Values.remainingSustainMs(tunnel, options) > 0) return scheduleRecovery(tunnel, options);
	if (Number(tunnel.acceptanceRecoveryRequestedAt || 0) > 0) return false;
	tunnel.acceptanceRecoveryRequestedAt = Values.currentTime(options);
	(options.close || defaultClose)(tunnel, Values.RECOVERY_CLOSE_CODE, Values.RECOVERY_CLOSE_REASON);
	return true;
}

function shouldConsiderRecovery(tunnel, options = {}) {
	return Number(tunnel.acceptanceFailureCount || 0) >= Values.failureThreshold(options) &&
		Number(tunnel.acceptanceRecoveryRequestedAt || 0) === 0;
}

function clearRecoveryTimer(tunnel, options = {}) {
	if (!tunnel?.acceptanceRecoveryTimer) return;
	(options.cancel || clearTimeout)(tunnel.acceptanceRecoveryTimer);
	tunnel.acceptanceRecoveryTimer = null;
}

function defaultClose(tunnel, code, reason) {
	if (typeof tunnel?.close === "function") return tunnel.close(code, reason);
	return tunnel?.socket?.end?.();
}

module.exports = { noteFailure, noteSuccess, requestRecovery, scheduleRecovery, shouldConsiderRecovery };
