// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');
const Identity = require('./processIdentity.js');
const Observe = require('./processObserve.js');

/**
 * B"H — Detached recovery requires exact birth identity. Missing, recycled, or
 * mismatched processes become terminal evidence and are never adopted or signaled.
 */
async function reconcile(config, jobId, meta) {
	await Context.refreshCounts(config, jobId, meta);
	const live = Context.activeJobs.get(jobId);
	if (live && !Context.Policy.TERMINAL.has(meta.status)) return mergeLive(meta, live);
	if (!Context.running(meta.status) && meta.status !== 'spawning' && meta.status !== 'cancelling') {
		return meta;
	}
	const fresh = await Context.Meta.read(config, jobId);
	if (fresh) {
		await Context.refreshCounts(config, jobId, fresh);
		if (Context.Policy.TERMINAL.has(fresh.status)) return fresh;
		const freshLive = Context.activeJobs.get(jobId);
		if (freshLive) return mergeLive(fresh, freshLive);
		meta = fresh;
	}
	const expected = Identity.fromMeta(meta);
	const observed = await Observe.observe(expected.pid);
	const comparison = Identity.compare(expected, observed);
	if (comparison.ok) return markDetached(meta, observed);
	const state = comparison.state === 'dead'
		? 'stale_lost_worker'
		: 'identity_unverified';
	return Lifecycle.finalizeDetached(config, jobId, meta, {
		status: state,
		staleRecovered: comparison.state === 'dead',
		error: comparison.reason || comparison.state,
		processComparison: comparison
	});
}

function mergeLive(meta, live) {
	return {
		...meta,
		...live.meta,
		stdoutChars: meta.stdoutChars,
		stderrChars: meta.stderrChars
	};
}

function markDetached(meta, observed) {
	return {
		...meta,
		status: 'detached_running',
		detachedRunning: true,
		processIdentity: Identity.create(observed),
		worker: {
			...(meta.worker || {}),
			pid: observed.pid,
			processGroupId: observed.processGroupId,
			birthToken: observed.birthToken,
			state: 'detached_running',
			detached: true,
			heartbeatAt: meta.heartbeatAt || meta.updatedAt || meta.startedAt
		},
		receipt: {
			...(meta.receipt || {}),
			state: 'detached_running',
			updatedAt: new Date().toISOString()
		}
	};
}

module.exports = { markDetached, mergeLive, reconcile };
