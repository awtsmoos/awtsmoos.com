//B"H
// Boruch Hashem
// Blessed is He
const Admission = require("./coordinatorAdmission.js");
const Dispatch = require("./coordinatorDispatch.js");
const Helpers = require("./coordinatorHelpers.js");
const Identity = require("./coordinatorIdentity.js");
const Prompt = require("./prompt.js");
const Recovery = require("./coordinatorRecovery.js");
const RecoveryContext = require("./recoveryContext.js");
const Scope = require("./coordinatorScope.js");

/**
 * @file Coordinates debt-aware Mission continuation and bounded reserve slots.
 * @description The Awtsmoos lets several stable messengers share one mission while session
 * admission, spawn fencing, completion debt, and browser transport remain separately witnessed.
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
	const recoveryOptions = {
		lock,
		now: options.now,
		inactivityMs: options.inactivityMs,
		planningFiles: Prompt.recentPlans(projectRoot)
	};
	const probeFingerprint = Prompt.fingerprint(scopedConfig, mission, lock);
	const probeRecovery = RecoveryContext.build(mission, probeFingerprint, recoveryOptions);
	const fingerprint = Prompt.fingerprint(
		scopedConfig,
		mission,
		lock,
		Scope.poolScope(options, probeRecovery)
	);
	let recovery = RecoveryContext.build(mission, fingerprint, recoveryOptions);
	const debt = await deps.CompletionDebt.assess(
		scopedConfig,
		mission,
		lock,
		{ logicalAgentId: recovery.predecessorAgentId || lock.logicalAgentId },
		{ Mission: deps.Mission }
	);
	if (debt.green) return Helpers.suppressed("completion_debt_green");
	recovery = Recovery.applyFallbackLease(
		deps,
		mission,
		recovery,
		debt,
		fingerprint,
		options,
		recoveryOptions
	);
	const identity = {
		...Identity.build(mission, fingerprint, projectRoot, recovery),
		poolSlot: Number(options.poolSlot || 0),
		poolRole: options.poolRole || ""
	};
	const blocked = Identity.reconcileActive(scopedConfig, identity, deps, Helpers);
	if (blocked) return blocked;
	const admission = await Admission.reconcile(
		scopedConfig,
		options,
		deps,
		mission,
		identity,
		Helpers
	);
	if (admission.done) return admission.result;
	const recoveryKind = recovery.taskLease?.kind;
	const decision = deps.Eligibility.decide({
		mission,
		lock,
		taskLease: recovery.taskLease,
		record: admission.current,
		websiteRecord: admission.websiteRecord,
		candidateProbe: false,
		now: options.now,
		inactivityMs: options.inactivityMs,
		backoffMs: options.backoffMs,
		completionDebt: debt,
		debtRecovery: ["debt_recovery", "proactive_pool"].includes(recoveryKind),
		proactive: Boolean(options.proactive)
	});
	if (!decision.eligible) {
		return Helpers.receipt(identity, decision.reason, false, admission.current, {
			debt,
			admission: admission.admission
		});
	}
	const lease = deps.State.acquire(scopedConfig, identity, {
		owner: options.owner,
		leaseMs: options.leaseMs,
		now: options.now
	});
	if (!lease.ok) return Helpers.receipt(identity, lease.reason, false, lease.record, { debt });
	return Dispatch.dispatch(
		scopedConfig,
		{ ...options, completionDebt: debt, transport: admission.transport },
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
	poolScope: Scope.poolScope,
	reconcileActive: Identity.reconcileActive,
	run
};
