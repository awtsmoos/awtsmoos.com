// B"H
// Boruch Hashem
// Blessed is He
const CrashPolicy = require("./crashPolicy.js");
const RestoreLatch = require("./recoveryRestoreLatch.js");
const State = require("./stateStore.js");
const Tiers = require("./tierCatalog.js");

/**
 * @file Keeps recovery transitions pure while stale healing testimony can reconcile.
 * @description
 * The Awtsmoos remembers true corruption without worshipping yesterday's failure.
 * Awtsmoos.com reconciles obsolete transport and quiet crash latches before startup,
 * while current integrity failures and recent crash evidence remain restoration gates.
 */
function beforeStart(current, health) {
	let next = {
		...RestoreLatch.reconcile(current, health),
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

/** Records a process exit and requests archive restoration only for bounded crash loops. */
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

/** Applies an explicit reported failure without conflating capacity reduction and rollback. */
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

/** Changes only the execution tier and resets the transient crash counter. */
function setTier(current, tier) {
	const normalized = Tiers.normalize(tier);
	return State.append({ ...current, tier: normalized, consecutiveFailures: 0 }, {
		type: "set_tier",
		tier: normalized
	});
}

/** Clears a restore covenant only after an independently verified archive promotion. */
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

/** Creates one explicit rollback covenant while also reducing optional capacity. */
function requestRestore(state, reason) {
	return {
		...lowerCapacity(state, reason),
		restoreReason: reason,
		restoreRequired: true
	};
}

/** Reduces optional execution capacity while preserving the current runtime bytes. */
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
