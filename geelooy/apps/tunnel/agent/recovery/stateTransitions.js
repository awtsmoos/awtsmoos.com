// B"H
// Boruch Hashem
// Blessed is He

const CrashPolicy = require("./crashPolicy.js");
const State = require("./stateStore.js");
const Tiers = require("./tierCatalog.js");

/**
 * B"H — Pure transitions keep software restoration separate from capacity
 * reduction. No broken world repeats merely because its tier became smaller.
 */
function beforeStart(current, health) {
	let next = {
		...current,
		lastStartAt: new Date().toISOString()
	};
	if (!health.ok) {
		next = requestRestore(next, `startup:${health.failures.join(",")}`);
	}
	return State.append(next, {
		type: "before_start",
		tier: next.tier,
		restoreRequired: next.restoreRequired,
		health
	});
}

function afterExit(current, runtimeMs, exitCode) {
	const rapidCrash = CrashPolicy.isRapidCrash(runtimeMs, exitCode);
	let next = { ...current };
	if (rapidCrash) {
		next.consecutiveFailures += 1;
		next.lastFailureReason = `rapid_exit:${exitCode}`;
	} else {
		next.consecutiveFailures = 0;
		next.lastHealthyAt = new Date().toISOString();
	}
	if (CrashPolicy.requiresVersionRestore(next.consecutiveFailures)) {
		next = requestRestore(next, "rapid_crash_loop");
		next.consecutiveFailures = 0;
	}
	return State.append(next, {
		type: "after_exit",
		runtimeMs: Number(runtimeMs),
		exitCode: Number(exitCode),
		tier: next.tier,
		restoreRequired: next.restoreRequired
	});
}

function reportFailure(current, reason, restoreRequired) {
	const next = restoreRequired
		? requestRestore(current, reason)
		: lowerCapacity(current, reason);
	return State.append(next, {
		type: "reported_failure",
		reason,
		tier: next.tier,
		restoreRequired: next.restoreRequired
	});
}

function setTier(current, tier) {
	const normalized = Tiers.normalize(tier);
	return State.append({
		...current,
		tier: normalized,
		consecutiveFailures: 0
	}, {
		type: "set_tier",
		tier: normalized
	});
}

function markRestored(current, details = {}) {
	return State.append({
		...current,
		consecutiveFailures: 0,
		lastHealthyAt: new Date().toISOString(),
		lastRecoveredVersion: details.version || "",
		lastRecoveryCandidate: details.candidate || "",
		restoreReason: "",
		restoreRequired: false
	}, {
		type: "version_restored",
		version: details.version || "",
		candidate: details.candidate || ""
	});
}

function requestRestore(state, reason) {
	return {
		...lowerCapacity(state, reason),
		restoreReason: reason,
		restoreRequired: true
	};
}

function lowerCapacity(state, reason) {
	return {
		...state,
		tier: Tiers.lower(state.tier),
		lastFailureReason: reason,
		lastDowngradeAt: new Date().toISOString()
	};
}

module.exports = {
	afterExit,
	beforeStart,
	markRestored,
	reportFailure,
	requestRestore,
	setTier
};
