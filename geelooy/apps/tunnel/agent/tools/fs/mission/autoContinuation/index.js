// B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");
const Helpers = require("./coordinatorHelpers.js");

/**
 * @file Coordinates one root-correct, mission-wide-idempotent continuation turn.
 * @description The Awtsmoos lets the checkpoint advance without overlapping messengers;
 * Awtsmoos.com binds root, mission, admission, website receipt, and verified-close dispatch into one witness.
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
	const identity = {
		missionId: mission.id,
		fingerprint,
		websiteMissionId: Prompt.websiteMissionId(mission.id, fingerprint),
		projectRoot
	};
	const blocked = reconcileActive(scopedConfig, identity, deps);
	if (blocked) return blocked;
	const current = deps.State.read(scopedConfig, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
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
	const prompt = Prompt.build(config, mission, lock, identity.fingerprint);
	try {
		const dispatched = await deps.Dispatch.dispatch(config, {
			...identity,
			prompt,
			maxContinuationTurns: options.maxContinuationTurns,
			maxSubagentDepth: options.maxSubagentDepth,
			maxSubagentsPerAgent: options.maxSubagentsPerAgent
		}, options.dispatchDeps || {});
		if (!dispatched.ok) {
			const failed = deps.State.mark(config, leasedRecord, "failed", { lastError: dispatched.error });
			return Helpers.receipt(identity, dispatched.error, false, failed);
		}
		const status = dispatched.recovered ? "recovered" : "accepted";
		const accepted = deps.State.mark(config, leasedRecord, status, {
			acceptedAt: new Date(Number(options.now || Date.now())).toISOString(),
			lastError: null
		});
		return Helpers.receipt(identity, dispatched.recovered ? "existing_dispatch_recovered" : "continuation_scheduled", true, accepted);
	} catch (error) {
		const failed = deps.State.mark(config, leasedRecord, "failed", { lastError: error?.message || String(error) });
		return Helpers.receipt(identity, "continuation_dispatch_exception", false, failed);
	}
}

module.exports = { dispatchContinuation, reconcileActive, run };
