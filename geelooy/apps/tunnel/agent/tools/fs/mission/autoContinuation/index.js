//B"H
// Boruch Hashem
// Blessed is He

const Dispatch = require("./coordinatorDispatch.js");
const Helpers = require("./coordinatorHelpers.js");
const Identity = require("./coordinatorIdentity.js");
const Prompt = require("./prompt.js");
const RecoveryContext = require("./recoveryContext.js");
const TerminalDispatch = require("./terminalDispatch.js");

/**
 * @file Coordinates debt-aware, generation-fenced Mission continuation.
 * @description The Awtsmoos lets an ended messenger yield to one successor until durable
 * completion turns green; Awtsmoos.com keeps custody, identity and dispatch separately auditable.
 */
async function run(config, options = {}) {
	if (Helpers.disabled(options)) return Helpers.suppressed("auto_continuation_disabled");
	if (Helpers.candidateProbe(options.env)) return Helpers.suppressed("candidate_probe_suppressed");
	const deps = Helpers.dependencies(options.deps);
	const lock = options.lock || deps.Lock.active(config);
	if (!lock?.missionId) return Helpers.suppressed("no_active_mission");
	const mission = options.mission || await deps.Mission.load(config, lock.missionId);
	if (!mission?.id) return Helpers.suppressed("active_mission_missing");
	const projectRoot = deps.ProjectRoot.resolve(config, mission, lock, options.binding);
	const scopedConfig = deps.ProjectRoot.scope(config, projectRoot);
	const fingerprint = Prompt.fingerprint(scopedConfig, mission, lock);
	const recoveryOptions = {
		lock,
		now: options.now,
		inactivityMs: options.inactivityMs,
		planningFiles: Prompt.recentPlans(projectRoot)
	};
	let recovery = RecoveryContext.build(mission, fingerprint, recoveryOptions);
	const debt = await deps.CompletionDebt.assess(
		scopedConfig,
		mission,
		lock,
		{ logicalAgentId: recovery.predecessorAgentId || lock.logicalAgentId },
		{ Mission: deps.Mission }
	);
	if (debt.green) return Helpers.suppressed("completion_debt_green");
	if (!recovery.taskLease) {
		const fallbackTaskLease = deps.DebtRecoveryLease.build(mission, recovery, debt, fingerprint);
		if (fallbackTaskLease) {
			recovery = RecoveryContext.build(mission, fingerprint, {
				...recoveryOptions,
				fallbackTaskLease
			});
		}
	}
	const identity = Identity.build(mission, fingerprint, projectRoot, recovery);
	const blocked = Identity.reconcileActive(scopedConfig, identity, deps, Helpers);
	if (blocked) return blocked;
	const current = deps.State.read(scopedConfig, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
	const terminal = TerminalDispatch.settle(scopedConfig, identity, current, websiteRecord, deps);
	if (terminal) return terminal;
	if (websiteRecord) return Helpers.recoverExisting(scopedConfig, identity, current, websiteRecord, deps);
	const debtRecovery = recovery.taskLease?.kind === "debt_recovery";
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
		completionDebt: debt,
		debtRecovery
	});
	if (!decision.eligible) return Helpers.receipt(identity, decision.reason, false, current, { debt });
	const lease = deps.State.acquire(scopedConfig, identity, {
		owner: options.owner,
		leaseMs: options.leaseMs,
		now: options.now
	});
	if (!lease.ok) return Helpers.receipt(identity, lease.reason, false, lease.record, { debt });
	return Dispatch.dispatch(
		scopedConfig,
		{ ...options, completionDebt: debt, transport: Helpers.transport(options) },
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
