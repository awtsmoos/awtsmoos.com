//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes start dispatch and publishAll job queueing (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { UPLOAD_ID_RE, uploadDir } = require('./bulkPublishAllRoutesPaths.js');
const { newJobId, setJob, runningJob } = require('./bulkPublishAllRoutesPlumbing.js');

module.exports = {
	/** POST /packed/import/bulk/start — dispatch publishAll, else parent. */
	async start() {
		const body = this.$i?.body || {};
		const kind = body.kind || requestValue(this.$i, 'kind');
		if (kind === 'publishAll') return this.startPublishAll(body);
		return super.start();
	},

	/** Validate + queue the one-call publish job. */
	async startPublishAll(body) {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// OOM guard: refuse new jobs when the heap is already hot.
		// (Shares the guard with the parent bulkImportRoutes module.)
		try {
			const mu = process.memoryUsage();
			if (mu.heapUsed > 1200 * 1024 * 1024) {
				return { success: false, error: 'SERVER_MEMORY_HIGH', message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.' };
			}
		} catch (_) { /* ignore */ }
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}.' };
		}
		const qv = requestValue(this.$i, 'oversizedStoreApproval');
		const approved = body.oversizedStoreApproval === true || qv === true || qv === 'true';
		if (!approved) {
			return {
				success: false, error: 'OVERSIZED_STORE_APPROVAL_REQUIRED',
				message: 'publishAll targets the 17.5GB legacy rich-comment store; pass oversizedStoreApproval:true as explicit per-call approval.',
			};
		}
		const dir = uploadDir(this.$i, uploadId);
		if (!fs.existsSync(path.join(dir, 'upload.tar.gz'))) {
			return { success: false, error: 'STAGE_NOT_FOUND', message: 'No completed upload for this uploadId. POST /packed/import/bulk/stage first.' };
		}
		const _pubHeichel = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		const busy = runningJob(_pubHeichel);
		if (busy) return { success: false, error: 'JOB_ALREADY_RUNNING', jobId: busy.id, scope: 'heichel', heichelId: _pubHeichel };
		const dryRun = !!body.dryRun;
		const freshImport = body.freshImport === true || requestValue(this.$i, 'freshImport') === 'true';
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: {
				kind: 'publishAll', uploadId,
				heichelId: body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar',
				idempotencyKey: body.idempotencyKey || null,
				// INSTANT MODE (2026-10-09): freshImport=true means the caller
				// guarantees these posts are new (or full overwrites are safe).
				// The job then skips the read-per-post idempotent merge and
				// flushes once at the end instead of every 100 posts — the two
				// biggest costs in the standard path. Combine with a prebuilt
				// manifest (pre-serialized binaries) for the fastest path.
				// Idempotency is preserved: re-running writes byte-identical
				// files (deterministic comment IDs), it just doesn't merge.
				freshImport,
			},
			timeBudgetMs: Math.min(Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000),
			totalPosts: 0, postsDone: 0, wrote: 0, skipped: 0, errors: [],
			cancelRequested: false, createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		// Fire and forget — the job updates its own record; poll via status.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, kind: 'publishAll', dryRun } };
	}
};
