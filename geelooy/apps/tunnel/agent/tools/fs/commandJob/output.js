// B"H
const Context = require('./context.js');

/** B"H — Output is paged only after all serialized writes settle. */
async function commandJobOutputPage(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || '');
	if (!jobId) {
		return Context.named(payload, 'commandJobOutputPage', {
			ok: false,
			error: 'missing_jobId'
		});
	}
	const stream = String(payload.stream || 'stdout').toLowerCase() === 'stderr'
		? 'stderr'
		: 'stdout';
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	return Context.Responses.page(config, jobId, stream, payload);
}

module.exports = { commandJobOutputPage };
