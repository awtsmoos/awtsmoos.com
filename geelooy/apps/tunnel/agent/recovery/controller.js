// B"H
// Boruch Hashem
// Blessed is He

const CrashPolicy = require("./crashPolicy.js");
const Decision = require("./recoveryDecision.js");
const Healthy = require("./healthyTransition.js");
const IdentityRepair = require("./identityRepairController.js");
const IdentitySlots = require("../lib/deviceIdentity/identitySlots.js");
const Integrity = require("./integrity.js");
const Registration = require("./registrationFailureTransition.js");
const RecoveryLog = require("./recoveryLog.js");
const State = require("./stateStore.js");
const Transitions = require("./stateTransitions.js");

/** Coordinates durable recovery I/O while pure transitions hold policy. */
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
	return Decision.create(state, { ok: false, failures: [reason], restoreRequired });
}

function reportRegistrationFailure(root, reason) {
	const state = State.update(root, current => Registration.report(current, reason));
	log(root, "recovery.log", "registration_failure", { state, reason });
	return Decision.create(state, { ok: false, failures: [reason] });
}

function repairIdentity(root, reason, forceReset = false) {
	return IdentityRepair.run(root, reason, forceReset);
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

function markHealthy(root, details = {}) {
	const slot = IdentitySlots.capture({ installRoot: root }, details);
	const transition = slot.ok ? Healthy.markHealthy : Healthy.markIdentityDegraded;
	const enriched = {
		...details,
		identitySlotState: slot.state,
		identitySlotCode: slot.code || ""
	};
	const state = State.update(root, current => transition(current, enriched));
	const event = slot.ok ? "runtime_healthy" : "runtime_identity_degraded";
	log(root, "recovery.log", event, { state, details, slot });
	return { ...Decision.create(state, { ok: true, failures: [] }), slot };
}

function log(root, fileName, type, details) {
	RecoveryLog.append(root, fileName, { type, ...details });
}

module.exports = {
	CRASH_LIMIT: CrashPolicy.CRASH_LIMIT,
	RAPID_CRASH_MS: CrashPolicy.RAPID_CRASH_MS,
	afterExit,
	beforeStart,
	markHealthy,
	markRestored,
	repairIdentity,
	reportFailure,
	reportRegistrationFailure,
	setTier
};
