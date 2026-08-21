// B"H
// Boruch Hashem
// Blessed is He

const Dispatch = require("./coordinatorDispatch.js");
const Helpers = require("./coordinatorHelpers.js");
const Identity = require("./coordinatorIdentity.js");
const Prompt = require("./prompt.js");
const RecoveryContext = require("./recoveryContext.js");
const TerminalDispatch = require("./terminalDispatch.js");

/**
 * @file Coordinates declared, task-leased, generation-fenced Mission Room continuation.
 * @description
 * The Awtsmoos lets the checkpoint pass through as many generations as unfinished work
 * requires. Awtsmoos.com performs observation, eligibility, admission, and dispatch in
 * distinct vessels so successor freedom never dissolves exact custody or auditability.
 */
async function run(config, options = {}) {
	if (Helpers.disabled(options)) {
		return Helpers.suppressed("auto_continuation_disabled");
	}
	if (Helpers.candidateProbe(options.env)) {
		return Helpers.suppressed("candidate_probe_suppressed");
	}
	const deps = Helpers.dependencies(options.deps);
	const lock = options.lock || deps.Lock.active(config);
	if (!lock?.missionId) {
		return Helpers.suppressed("no_active_mission");
	}
	const mission = options.mission || await deps.Mission.load(config, lock.missionId);
	if (!mission?.id) {
		return Helpers.suppressed("active_mission_missing");
	}
	const projectRoot = deps.ProjectRoot.resolve(config, mission, lock, options.binding);
	const scopedConfig = deps.ProjectRoot.scope(config, projectRoot);
	const fingerprint = Prompt.fingerprint(scopedConfig, mission, lock);
	const recovery = RecoveryContext.build(mission, fingerprint, {
		lock,
		now: options.now,
		inactivityMs: options.inactivityMs,
		planningFiles: Prompt.recentPlans(projectRoot)
	});
	const identity = Identity.build(mission, fingerprint, projectRoot, recovery);
	const blocked = Identity.reconcileActive(scopedConfig, identity, deps, Helpers);
	if (blocked) {
		return blocked;
	}
	const current = deps.State.read(scopedConfig, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
	const terminal = TerminalDispatch.settle(scopedConfig, identity, current, websiteRecord, deps);
	if (terminal) {
		return terminal;
	}
	if (websiteRecord) {
		return Helpers.recoverExisting(scopedConfig, identity, current, websiteRecord, deps);
	}
	const decision = deps.Eligibility.decide({
		mission,
		lock,
		taskLease: recovery.taskLease,
		record: current,
		websiteRecord,
		candidateProbe: false,
		now: options.now,
		inactivityMs: options.inactivityMs,
		backoffMs: options.backoffMs,
		maxAttempts: options.maxAttempts
	});
	if (!decision.eligible) {
		return Helpers.receipt(identity, decision.reason, false, current);
	}
	const lease = deps.State.acquire(scopedConfig, identity, {
		owner: options.owner,
		leaseMs: options.leaseMs,
		now: options.now
	});
	if (!lease.ok) {
		return Helpers.receipt(identity, lease.reason, false, lease.record);
	}
	return Dispatch.dispatch(
		scopedConfig,
		options,
		deps,
		mission,
		lock,
		identity,
		lease.record,
		Helpers
	);
}

module.exports = {
	dispatchContinuation: Dispatch.dispatch,
	identityFor: Identity.build,
	reconcileActive: Identity.reconcileActive,
	run
};
