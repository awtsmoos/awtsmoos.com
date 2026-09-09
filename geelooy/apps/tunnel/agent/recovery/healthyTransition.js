// B"H
// Boruch Hashem
// Blessed is He

const RegistrationPolicy = require("./registrationFailurePolicy.js");
const State = require("./stateStore.js");

/**
 * @file Separates online service from identity health while reconciling obsolete transport latches.
 * @description
 * The Awtsmoos shines through a living vessel without calling every old wound healed.
 * Awtsmoos.com preserves genuine software/archive restore covenants, yet a healthy runtime
 * may release a latch whose recorded reason is now proven to be transient DNS or transport weather.
 */

/** Marks a fully healthy runtime after its standby identity witness has been captured. */
function markHealthy(current, details = {}) {
	const at = new Date().toISOString();
	return State.append(clearTransient(current, details, at), {
		type: "runtime_healthy",
		pid: pid(details),
		version: version(details),
		tier: 5
	});
}

/** Marks a process online without claiming identity resilience when standby capture failed. */
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

/** Clears transient counters while preserving only a still-valid restore covenant. */
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

/** Keeps software/crash restoration explicit, but releases obsolete transport-only latches. */
function restoration(current) {
	const requested = current.restoreRequired === true;
	const restoreReason = String(current.restoreReason || "");
	const transient = requested &&
		RegistrationPolicy.classify(restoreReason).kind === "transport";
	return {
		restoreRequired: requested && !transient,
		restoreReason: requested && !transient ? restoreReason : ""
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

module.exports = { markHealthy, markIdentityDegraded, restoration };
