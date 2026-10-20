//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes job status, list and cancel endpoints (split from bulkImportRoutes.js).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { jobs, getJob, setJob } = require('./bulkImportRoutesJobs.js');

module.exports = {
	/** GET /packed/import/bulk/status?job=<id> */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job');
		const job = getJob(jobId);
		if (!job) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const { spec, ...rest } = job;
		return { success: { ...rest, kind: spec.kind, seriesId: spec.seriesId, postId: spec.postId, aliasId: spec.aliasId, totalItems: spec.totalItems } };
	},

	/** GET /packed/import/bulk/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		return {
			success: [...jobs.values()]
				.sort((a, b) => b.createdAt - a.createdAt)
				.map(j => ({
					id: j.id, status: j.status, kind: j.spec.kind, dryRun: j.dryRun,
					seriesId: j.spec.seriesId, postId: j.spec.postId, aliasId: j.spec.aliasId,
					totalItems: j.totalItems, wrote: j.wrote, skipped: j.skipped,
					errors: j.errors.length, durationMs: j.durationMs,
				}))
		};
	},

	/** POST /packed/import/bulk/cancel {job} */
	async cancel() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const jobId = requestValue(this.$i, 'job') || this.$i?.body?.job;
		const job = getJob(jobId);
		if (!job) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (job.status !== 'running' && job.status !== 'queued') {
			return { success: false, error: 'JOB_NOT_RUNNING', status: job.status };
		}
		job.cancelRequested = true;
		job.updatedAt = Date.now();
		setJob(job);
		return { success: { jobId, cancelRequested: true } };
	}
};
