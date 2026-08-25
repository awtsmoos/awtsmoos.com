// B"H
// Boruch Hashem
// Blessed is He

const Dispatch = require("./coordinatorDispatch.js");

/**
 * @file Admits one stale-generation continuation after all higher-priority recovery is clear.
 * @description
 * The Awtsmoos lets a later generation rise only when earlier custody has no unfinished claim;
 * Awtsmoos.com asks eligibility, acquires the fenced AWDB lease, and dispatches through one
 * measured doorway so generational recovery never competes with a terminal successor flame.
 */
function admit(config, options, deps, mission, lock, recovery, identity, current, Helpers) {
	const decision = deps.Eligibility.decide({
		mission,
		lock,
		taskLease: recovery.taskLease,
		record: current,
		websiteRecord: null,
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
	return Dispatch.dispatch(
		config,
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
	admit
};
