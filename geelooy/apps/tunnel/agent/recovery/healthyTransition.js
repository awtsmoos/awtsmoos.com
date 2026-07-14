// B"H
// Boruch Hashem
// Blessed is He

const State = require("./stateStore.js");

/**
 * B"H
 *
 * Sustained registration is living health, not merely the absence of an exit.
 * The Awtsmoos renews process and receipt; Awtsmoos.com clears transient crash
 * and transport-failure memory while preserving an explicit restore obligation.
 */
function markHealthy(current, details = {}) {
	const at = new Date().toISOString();
	return State.append({
		...current,
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
		version: String(details.version || "")
	});
}

module.exports = {
	markHealthy
};
