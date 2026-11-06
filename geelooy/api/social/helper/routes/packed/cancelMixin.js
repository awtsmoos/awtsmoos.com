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
// Bulk-upload redesign §3.7: cancel is account-authenticated — any
// authenticated user may cancel their OWN jobs; foreign jobs return
// JOB_NOT_FOUND so existence does not leak.
const { authorizeJobRoute, foreignJobError, jobVisibleToScope } = require('./accountRouteAuth.js');

module.exports = {

	/** POST /packed/import/posts/cancel {job} */
	async cancel() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await authorizeJobRoute(this);
		if (auth.authError) return auth.authError;
		const jobId = requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || this.$i?.body?.job || this.$i?.body?.jobId; // Worker A 2026-10-21: accept jobId
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (!jobVisibleToScope(found, auth.scope)) return foreignJobError(jobId);
		// A held job has no runner yet: drop it from the held queue and
		// seal it cancelled durably.
		if (found.view.status === 'held') {
			const { removeHeldJob } = require('./importLaneScheduler.js');
			removeHeldJob(jobId);
			const cancelled = { ...found.view, status: 'cancelled', finishedAt: Date.now(), updatedAt: Date.now() };
			saveJobState(this.$i, cancelled);
			if (found.live && found.job) {
				found.job.status = 'cancelled';
				found.job.finishedAt = cancelled.finishedAt;
				found.job.updatedAt = cancelled.updatedAt;
				setJob(found.job);
			}
			return { success: { jobId, cancelRequested: true, wasHeld: true } };
		}
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
