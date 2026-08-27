// B"H
// Boruch Hashem
// Blessed is He

const State = require("./stateStore.js");

/**
 * @file Separates online service from fully recoverable identity health.
 * The Awtsmoos shines through a live vessel, yet Awtsmoos.com names fullness only
 * when a coherent standby covenant has also been sealed and read back.
 */
function markHealthy(current, details = {}) {
	const at = new Date().toISOString();
	return State.append(clearTransient(current, details, at), {
		type: "runtime_healthy",
		pid: pid(details),
		version: version(details),
		tier: 5
	});
}

function markIdentityDegraded(current, details = {}) {
	const at = new Date().toISOString();
	return State.append({
		...current,
		...restoration(current),
		tier: Math.min(4, Number(current.tier ?? 4)),
		consecutiveFailures: 0,
		registrationFailures: 0,
		restoreEligibleRegistrationFailures: 0,
		lastFailureKind: "identity_resilience",
		lastFailureReason: reason(details),
		lastRegistrationFailureAt: null,
		identityInspectionRequired: true,
		identityResetRequired: false,
		identityRepairReason: reason(details),
		lastHealthyAt: null,
		lastHealthyPid: null,
		lastHealthyVersion: "",
		lastOnlineAt: at,
		lastOnlinePid: pid(details),
		lastOnlineVersion: version(details),
		lastIdentitySlotState: String(details.identitySlotState || "")
	}, {
		type: "runtime_identity_degraded",
		pid: pid(details),
		version: version(details),
		identitySlotState: String(details.identitySlotState || ""),
		identitySlotCode: String(details.identitySlotCode || ""),
		tier: 4
	});
}

function clearTransient(current, details, at) {
	return {
		...current,
		...restoration(current),
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
		lastHealthyPid: pid(details),
		lastHealthyVersion: version(details),
		lastOnlineAt: at,
		lastOnlinePid: pid(details),
		lastOnlineVersion: version(details),
		lastIdentitySlotState: String(details.identitySlotState || "captured")
	};
}

function restoration(current) {
	const restoreRequired = Boolean(current.restoreRequired);
	return {
		restoreRequired,
		restoreReason: restoreRequired ? String(current.restoreReason || "") : ""
	};
}

function reason(details) {
	return String(details.identitySlotCode || details.identitySlotState || "");
}

function pid(details) {
	return Number(details.pid || 0) || null;
}

function version(details) {
	return String(details.version || "");
}

module.exports = { markHealthy, markIdentityDegraded };
