// B"H
const Context = require('./context.js');
const Reconciliation = require('./reconcile.js');

/** B"H — Status is a reconciled receipt, never a stale promise. */
async function commandStatus(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || '');
	if (!jobId) {
		return Context.named(payload, 'commandStatus', {
			ok: false,
			error: 'missing_jobId',
			status: 'missing_jobId'
		});
	}
	let meta = await Context.Meta.read(config, jobId);
	if (!meta) {
		return Context.named(payload, 'commandStatus', {
			ok: false,
			error: 'job_not_found_or_expired',
			status: 'missing',
			jobId
		});
	}
	meta = await Reconciliation.reconcile(config, jobId, meta);
	return Context.Responses.status(jobId, meta, payload);
}

module.exports = { commandStatus };
