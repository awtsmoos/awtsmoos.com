// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');

/** B"H — Durable status asks active memory, fresh metadata, and the operating system. */
async function reconcile(config, jobId, meta) {
	await Context.refreshCounts(config, jobId, meta);
	const live = Context.activeJobs.get(jobId);
	if (live && !Context.Policy.TERMINAL.has(meta.status)) {
		return mergeLive(meta, live);
	}
	if (!Context.running(meta.status)) return meta;
	const fresh = await Context.Meta.read(config, jobId);
	if (fresh) {
		await Context.refreshCounts(config, jobId, fresh);
		if (!Context.running(fresh.status)) return fresh;
		const freshLive = Context.activeJobs.get(jobId);
		if (freshLive && !Context.Policy.TERMINAL.has(fresh.status)) {
			return mergeLive(fresh, freshLive);
		}
		meta = fresh;
	}
	const pid = Context.pidOf(meta);
	if (Context.pidAlive(pid)) return markDetached(meta, pid);
	return Lifecycle.finalizeDetached(config, jobId, meta, {
		status: 'stale_lost_worker',
		staleRecovered: true,
		detachedPid: pid || null,
		error: meta.error || 'running_receipt_had_no_live_worker_or_live_pid'
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

function markDetached(meta, pid) {
	return {
		...meta,
		status: 'detached_running',
		detachedRunning: true,
		worker: {
			...(meta.worker || {}),
			pid,
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
