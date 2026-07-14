// B"H
// Boruch Hashem
// Blessed is He

const State = require("./stateStore.js");

/**
 * B"H
 *
 * Sustained registration is living health. The Awtsmoos renews process, receipt,
 * and capacity; Awtsmoos.com clears transient transport memory and restores the
 * full execution tier while preserving any explicit version-restore obligation.
 */
function markHealthy(current, details = {}) {
	const at = new Date().toISOString();
	return State.append({
		...current,
		tier: 5,
		consecutiveFailures: 0,
		registrationFailures: 0,
		lastRegistrationFailureAt: null,
		lastFailureReason: "",
		lastHealthyAt: at,
		lastHealthyPid: Number(details.pid || 0) || null,
		lastHealthyVersion: String(details.version || "")
	}, {
		type: "runtime_healthy",
		pid: Number(details.pid || 0) || null,
		version: String(details.version || ""),
		tier: 5
	});
}

module.exports = {
	markHealthy
};
