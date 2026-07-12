// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');
const Scheduler = require('./scheduler.js');
const Identity = require('./processIdentity.js');

/** B"H — Queued and running cancellation both return the written terminal receipt. */
async function cancelCommandJob(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || '');
	if (!jobId) return Context.named(payload, 'commandCancel', { ok: false, error: 'missing_jobId' });
	const live = Context.activeJobs.get(jobId);
	if (live) return cancelLive(config, payload, jobId, live);
	return cancelStored(config, payload, jobId);
}

async function cancelLive(config, payload, jobId, live) {
	const meta = await Lifecycle.reserveFinalization(config, jobId, live, async () => {
		live.meta.status = 'cancelling';
		live.meta.worker = { ...(live.meta.worker || {}), state: 'cancelling' };
		await Context.Meta.write(config, jobId, live.meta);
		const identity = await live.identityPromise;
		const cleanup = await Context.ProcessControl.cleanup(identity, Lifecycle.cleanupOptions());
		return { status: cleanup.ok ? 'cancelled' : cleanup.state, cancelled: cleanup.ok, cleanup };
	});
	return terminalCancel(payload, jobId, meta, { cancelled: meta.status === 'cancelled', detachedRecovered: false });
}

async function cancelStored(config, payload, jobId) {
	let meta = await Context.Meta.read(config, jobId);
	if (!meta) return Context.named(payload, 'commandCancel', { ok: true, jobId, cancelled: false, status: 'missing' });
	if (Context.Policy.TERMINAL.has(meta.status)) {
		return terminalCancel(payload, jobId, meta, { cancelled: meta.status === 'cancelled', alreadyTerminal: true });
	}
	if (meta.status === 'queued') return cancelQueued(config, payload, jobId, meta);
	const cleanup = await Context.ProcessControl.cleanup(Identity.fromMeta(meta), Lifecycle.cleanupOptions());
	meta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: cleanup.ok ? 'cancelled' : cleanup.state,
		cancelled: cleanup.ok,
		detachedRecovered: true,
		cleanup
	});
	return terminalCancel(payload, jobId, meta, { cancelled: meta.status === 'cancelled', detachedRecovered: true });
}

async function cancelQueued(config, payload, jobId, meta) {
	Scheduler.cancelQueued(jobId);
	const cleanup = { ok: true, state: 'not_started', signals: [], at: new Date().toISOString() };
	const finalMeta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: 'cancelled',
		cancelled: true,
		cleanup
	});
	return terminalCancel(payload, jobId, finalMeta, { cancelled: true, queued: true });
}

function terminalCancel(payload, jobId, meta, extra = {}) {
	const response = Context.Responses.status(jobId, meta, {
		...payload,
		action: 'commandCancel',
		requestAction: payload.requestAction || payload.action || 'commandCancel',
		actualAction: 'commandCancel'
	});
	return Context.named(payload, 'commandCancel', { ...response, ...extra, jobId, status: meta.status });
}

module.exports = { cancelCommandJob, cancelLive, cancelQueued, cancelStored, terminalCancel };
