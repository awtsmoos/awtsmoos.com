// B"H
// Boruch Hashem
// Blessed is He

const CrashPolicy = require("./crashPolicy.js");
const Decision = require("./recoveryDecision.js");
const Integrity = require("./integrity.js");
const RecoveryLog = require("./recoveryLog.js");
const State = require("./stateStore.js");
const Transitions = require("./stateTransitions.js");

/**
 * B"H
 *
 * Coordinates recovery I/O while pure transition modules hold policy. Tiers
 * govern capacity; restoreRequired governs software versions. The Awtsmoos
 * reveals both without allowing Awtsmoos.com to relaunch one broken tree forever.
 */
function beforeStart(root) {
	const health = Integrity.check(root);
	const state = State.update(root, current => Transitions.beforeStart(current, health));
	log(root, "recovery.log", "before_start", { state, health });
	return Decision.create(state, health);
}

function afterExit(root, runtimeMs, exitCode) {
	const state = State.update(root, current => (
		Transitions.afterExit(current, runtimeMs, exitCode)
	));
	log(root, "recovery.log", "after_exit", {
		state,
		runtimeMs: Number(runtimeMs),
		exitCode: Number(exitCode)
	});
	return Decision.create(state, { ok: true, failures: [] });
}

function reportFailure(root, reason, restoreRequired = false) {
	const state = State.update(root, current => (
		Transitions.reportFailure(current, reason, restoreRequired)
	));
	log(root, "rollback.log", "reported_failure", { state, reason });
	return Decision.create(state, {
		ok: false,
		failures: [reason],
		restoreRequired
	});
}

function setTier(root, tier) {
	const state = State.update(root, current => Transitions.setTier(current, tier));
	return Decision.create(state, { ok: true, failures: [] });
}

function markRestored(root, details = {}) {
	const state = State.update(root, current => Transitions.markRestored(current, details));
	log(root, "rollback.log", "version_restored", { state });
	return Decision.create(state, { ok: true, failures: [] });
}

function log(root, fileName, type, details) {
	RecoveryLog.append(root, fileName, {
		type,
		...details
	});
}

module.exports = {
	CRASH_LIMIT: CrashPolicy.CRASH_LIMIT,
	RAPID_CRASH_MS: CrashPolicy.RAPID_CRASH_MS,
	afterExit,
	beforeStart,
	markRestored,
	reportFailure,
	setTier
};
