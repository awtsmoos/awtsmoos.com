//B"H
//Blessed is He
//Boruch Hashem

/** @module CancelMixin
 * Job cancel route: sets cancelRequested on the running job; the worker
 * loop observes it at the next post boundary and stops cleanly.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { getJobView, saveJobState } = require('./jobState.js');
const { setJob } = require('./jobStore.js');

module.exports = {

	/** POST /packed/import/posts/cancel {job} */
	async cancel() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || this.$i?.body?.job || this.$i?.body?.jobId; // Worker A 2026-10-21: accept jobId
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (!found.live) {
			return { success: false, error: 'JOB_NOT_RUNNING', status: found.view.status, message: 'Job is not live on this server instance; nothing to cancel.' };
		}
		const job = found.job;
		if (job.status !== 'running' && job.status !== 'queued') {
			return { success: false, error: 'JOB_NOT_RUNNING', status: job.status };
		}
		job.cancelRequested = true;
		job.updatedAt = Date.now();
		setJob(job);
		saveJobState(this.$i, job);
		return { success: { jobId, cancelRequested: true } };
	}
};
