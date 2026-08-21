// B"H
// Boruch Hashem
// Blessed is He

const Helpers = require("./coordinatorHelpers.js");
const Prompt = require("./prompt.js");
const RecoveryContext = require("./recoveryContext.js");
const TerminalDispatch = require("./terminalDispatch.js");

/**
 * @file Coordinates one root-correct, mission-wide-idempotent continuation generation.
 * @description
 * The Awtsmoos lets a checkpoint advance without overlapping messengers. Awtsmoos.com
 * binds root, lifecycle, predecessor, generation, sibling group, handoff vessels,
 * lease, and verified-close dispatch into one durable successor witness.
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
	const recovery = RecoveryContext.build(mission, fingerprint, {
		config: scopedConfig,
		projectRoot,
		lock,
		now: options.now,
		inactivityMs: options.inactivityMs,
		planningFiles: Prompt.recentPlans(projectRoot)
	});
	const identity = identityFor(mission, fingerprint, projectRoot, recovery);
	const blocked = reconcileActive(scopedConfig, identity, deps);
	if (blocked) return blocked;
	const current = deps.State.read(scopedConfig, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
	const terminal = TerminalDispatch.settle(scopedConfig, identity, current, websiteRecord, deps);
	if (terminal) return terminal;
	if (websiteRecord) return Helpers.recoverExisting(scopedConfig, identity, current, websiteRecord, deps);
	const decision = deps.Eligibility.decide({
		mission,
		lock,
		record: current,
		websiteRecord,
		candidateProbe: false,
		now: options.now,
		inactivityMs: options.inactivityMs,
		backoffMs: options.backoffMs,
		maxAttempts: options.maxAttempts
	});
	if (!decision.eligible) return Helpers.receipt(identity, decision.reason, false, current);
	const lease = deps.State.acquire(scopedConfig, identity, {
		owner: options.owner,
		leaseMs: options.leaseMs,
		now: options.now
	});
	if (!lease.ok) return Helpers.receipt(identity, lease.reason, false, lease.record);
	return dispatchContinuation(scopedConfig, options, deps, mission, lock, identity, lease.record);
}

function identityFor(mission, fingerprint, projectRoot, recovery) {
	return {
		missionId: mission.id,
		fingerprint,
		websiteMissionId: Prompt.websiteMissionId(mission.id, fingerprint),
		projectRoot,
		recoveryReason: recovery.recoveryReason,
		predecessorAgentId: recovery.predecessorAgentId,
		predecessorLastSeenAt: recovery.predecessorLastSeenAt,
		predecessorStatus: recovery.predecessorStatus,
		predecessorLifecycle: recovery.predecessorLifecycle,
		predecessorIntentional: recovery.predecessorIntentional,
		predecessorGeneration: recovery.predecessorGeneration,
		successorGeneration: recovery.successorGeneration,
		spawnGroupId: recovery.spawnGroupId,
		successorAgentId: recovery.successorAgentId,
		handoffPaths: recovery.handoffPaths,
		staleDetected: recovery.staleDetected,
		recoveryCheckpoint: recovery.recoveryCheckpoint
	};
}

function reconcileActive(config, identity, deps) {
	if (typeof deps.State.readActive !== "function" || typeof deps.State.blocking !== "function") return null;
	const active = deps.State.readActive(config, identity.missionId);
	if (!active || active.fingerprint === identity.fingerprint || !deps.State.blocking(active)) return null;
	const websiteRecord = active.websiteMissionId ? deps.WebsiteStore.read(active.websiteMissionId) : null;
	const status = deps.WebsiteStatus.classify(websiteRecord, active);
	if (status.terminal) {
		if (typeof deps.State.settleActive === "function") deps.State.settleActive(config, active, status.reason);
		return null;
	}
	return Helpers.receipt(identity, status.reason, false, active);
}

async function dispatchContinuation(config, options, deps, mission, lock, identity, leasedRecord) {
	const context = { ...identity, ...(leasedRecord || {}) };
	const prompt = Prompt.build(config, mission, lock, identity.fingerprint, context);
	try {
		const dispatched = await deps.Dispatch.dispatch(config, {
			...identity,
			prompt,
			maxContinuationTurns: options.maxContinuationTurns,
			maxSubagentDepth: options.maxSubagentDepth,
			maxSubagentsPerAgent: options.maxSubagentsPerAgent
		}, options.dispatchDeps || {});
		if (!dispatched.ok) return failedReceipt(config, deps, identity, leasedRecord, dispatched.error);
		const status = dispatched.recovered ? "recovered" : "accepted";
		const accepted = deps.State.mark(config, leasedRecord, status, {
			acceptedAt: new Date(Number(options.now || Date.now())).toISOString(),
			lastError: null
		});
		return Helpers.receipt(identity, dispatched.recovered ? "existing_dispatch_recovered" : "continuation_scheduled", true, accepted);
	} catch (error) {
		return failedReceipt(config, deps, identity, leasedRecord, error?.message || String(error), "continuation_dispatch_exception");
	}
}

function failedReceipt(config, deps, identity, record, error, reason = error) {
	const failed = deps.State.mark(config, record, "failed", { lastError: error });
	return Helpers.receipt(identity, reason, false, failed);
}

module.exports = { dispatchContinuation, identityFor, reconcileActive, run };
