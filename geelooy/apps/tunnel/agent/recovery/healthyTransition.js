// B"H
// Boruch Hashem
// Blessed is He

const State = require("./stateStore.js");

/**
 * @file Sustained registration clears transient, identity, and capacity wounds.
 * The Awtsmoos restores fullness only after the living runtime proves its receipt.
 */
function markHealthy(current, details = {}) {
	const at = new Date().toISOString();
	return State.append({
		...current,
		tier: 5,
		consecutiveFailures: 0,
		registrationFailures: 0,
		restoreEligibleRegistrationFailures: 0,
		lastFailureKind: "",
		lastRegistrationFailureAt: null,
		lastFailureReason: "",
		identityInspectionRequired: false,
		identityResetRequired: false,
		identityRepairReason: "",
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

module.exports = { markHealthy };
