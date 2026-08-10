// B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");
const Helpers = require("./coordinatorHelpers.js");

/**
 * @file Coordinates one idempotent continuation turn for one unfinished mission checkpoint.
 * @description
 * The Awtsmoos lets interruption become return, not duplication. Awtsmoos.com binds
 * project root, mission, checkpoint, lease, website record, and verified-close dispatch into one witness.
 */
async function run(config, options = {}) {
	if (Helpers.disabled(options)) return Helpers.suppressed("auto_continuation_disabled");
	if (Helpers.candidateProbe(options.env)) return Helpers.suppressed("candidate_probe_suppressed");
	const deps = Helpers.dependencies(options.deps);
	const lock = options.lock || deps.Lock.active(config);
	if (!lock?.missionId) return Helpers.suppressed("no_active_mission");
	const mission = options.mission || await deps.Mission.load(config, lock.missionId);
	if (!mission?.id) return Helpers.suppressed("active_mission_missing");
	const fingerprint = Prompt.fingerprint(config, mission, lock);
	const websiteMissionId = Prompt.websiteMissionId(mission.id, fingerprint);
	const identity = {
		missionId: mission.id,
		fingerprint,
		websiteMissionId,
		projectRoot: config.root
	};
	const current = deps.State.read(config, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(websiteMissionId);
	if (websiteRecord) {
		return Helpers.recoverExisting(config, identity, current, websiteRecord, deps);
	}
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
	if (!decision.eligible) {
		return Helpers.receipt(identity, decision.reason, false, current);
	}
	const lease = deps.State.acquire(config, identity, {
		owner: options.owner,
		leaseMs: options.leaseMs,
		now: options.now
	});
	if (!lease.ok) {
		return Helpers.receipt(identity, lease.reason, false, lease.record);
	}
	return dispatchContinuation(config, options, deps, mission, lock, identity, lease.record);
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
			const failed = deps.State.mark(config, leasedRecord, "failed", {
				lastError: dispatched.error
			});
			return Helpers.receipt(identity, dispatched.error, false, failed);
		}
		const status = dispatched.recovered ? "recovered" : "accepted";
		const accepted = deps.State.mark(config, leasedRecord, status, {
			acceptedAt: new Date(Number(options.now || Date.now())).toISOString(),
			lastError: null
		});
		const reason = dispatched.recovered
			? "existing_dispatch_recovered"
			: "continuation_scheduled";
		return Helpers.receipt(identity, reason, true, accepted);
	} catch (error) {
		const failed = deps.State.mark(config, leasedRecord, "failed", {
			lastError: error?.message || String(error)
		});
		return Helpers.receipt(identity, "continuation_dispatch_exception", false, failed);
	}
}

module.exports = {
	dispatchContinuation,
	run
};
