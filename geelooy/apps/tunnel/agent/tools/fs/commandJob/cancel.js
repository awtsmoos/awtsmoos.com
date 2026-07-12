// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');

/**
 * B"H — Cancellation returns the same terminal receipt it writes. A caller never
 * receives a hollow acknowledgement while the durable worker already knows more.
 */
async function cancelCommandJob(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || '');
	if (!jobId) {
		return Context.named(payload, 'commandCancel', {
			ok: false,
			error: 'missing_jobId'
		});
	}
	const live = Context.activeJobs.get(jobId);
	if (live) return cancelLive(config, payload, jobId, live);
	return cancelDetached(config, payload, jobId);
}

async function cancelLive(config, payload, jobId, live) {
	Context.ProcessControl.kill(live.child);
	live.meta.status = 'cancelled';
	const finalMeta = await Lifecycle.finishJob(config, jobId, live.meta, {
		status: 'cancelled',
		cancelled: true
	});
	return terminalCancel(payload, jobId, finalMeta, {
		cancelled: true,
		detachedRecovered: false
	});
}

async function cancelDetached(config, payload, jobId) {
	let meta = await Context.Meta.read(config, jobId);
	if (!meta) {
		return Context.named(payload, 'commandCancel', {
			ok: true,
			jobId,
			cancelled: false,
			status: 'missing'
		});
	}
	if (Context.Policy.TERMINAL.has(meta.status)) {
		return terminalCancel(payload, jobId, meta, {
			cancelled: meta.status === 'cancelled',
			alreadyTerminal: true
		});
	}
	const pid = Context.pidOf(meta);
	if (Context.pidAlive(pid)) Context.killPid(pid);
	meta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: 'cancelled',
		cancelled: true,
		detachedRecovered: true
	});
	return terminalCancel(payload, jobId, meta, {
		cancelled: true,
		detachedRecovered: true
	});
}

function terminalCancel(payload, jobId, meta, extra = {}) {
	const response = Context.Responses.status(jobId, meta, {
		...payload,
		action: 'commandCancel',
		requestAction: payload.requestAction || payload.action || 'commandCancel',
		actualAction: 'commandCancel'
	});
	return Context.named(payload, 'commandCancel', {
		...response,
		...extra,
		jobId,
		status: meta.status
	});
}

module.exports = { cancelCommandJob, cancelDetached, cancelLive, terminalCancel };
