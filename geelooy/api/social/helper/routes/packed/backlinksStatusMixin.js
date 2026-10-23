//B"H
//Blessed is He
//Boruch Hashem

/** @module BacklinksStatusMixin
 * Backlink repair job status route and the synchronous flush-backlinks
 * route (loads a job's persisted backlink queue and flushes it now).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { getJobView } = require('./jobState.js');

module.exports = {

	/** GET /packed/import/posts/backlinks-status?backlinks=<id> */
	async backlinksStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const backlinkId = requestValue(this.$i, 'backlinks') || requestValue(this.$i, 'backlinksId') || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'job') || requestValue(this.$i, 'id'); // Worker A 2026-10-21: alias parity with status
		const found = getJobView(this.$i, backlinkId);
		if (!found) return { success: false, error: 'BACKLINKS_NOT_FOUND', backlinkId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, live: found.live,
				uploadId: v.uploadId, heichelId: v.heichelId,
				total: v.total, checked: v.checked,
				written: v.written, skipped: v.skipped,
				errors: (v.errors || []).slice(0, 50),
				errorCount: (v.errors || []).length,
				durationMs: v.durationMs,
			}
		};
	},


	// POST /packed/import/posts/flush-backlinks {job}
	// Crash-recovery replay for the deferred backlink queue: the normal path
	// needs no call (runJob flushes automatically post-job), but if the
	// server restarted between job completion and the background flush, the
	// persisted queue replays here. Idempotent: parent-merged writes skip
	// backlinks that already exist.
	async flushBacklinks() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const body = this.$i?.body || {};
		const jobId = String(body.job || body.jobId || requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || ''); // Worker A 2026-10-21: accept jobId
		if (!jobId) return { success: false, error: 'NO_JOB', message: 'Provide {job}.' };
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const persisted = Array.isArray(found.view.backlinkQueue) ? found.view.backlinkQueue : [];
		if (!persisted.length) {
			return { success: { jobId, flushed: 0, message: 'no pending backlinks' } };
		}
		const job = found.live && found.job
			? found.job
			: { id: jobId, status: 'done', errors: [], backlinksDone: 0, backlinkErrors: 0 };
		job.backlinkQueue = new Map(persisted.map((b, i) => [i + '|' + (b && b.pid), b]));
		this.flushBacklinksBackground(this.$i, job).catch(() => {});
		return { success: { jobId, status: 'flushing', pending: persisted.length } };
	}
};
