//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes job start endpoint with OOM gates (split from bulkImportRoutes.js).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { heapTooHigh, memoryGuardError, INLINE_ITEMS_MAX_COUNT, INLINE_ITEMS_MAX_BYTES } = require('./bulkImportRoutesGuards.js');
const { validateCommentItem } = require('./bulkImportRoutesComments.js');
const { runningJob, newJobId, setJob } = require('./bulkImportRoutesJobs.js');

module.exports = {
	// -- routes ----------------------------------------------------------------
	/**
	 * POST /packed/import/bulk/start
	 * Body: { operatorKey, kind, seriesId?, postId?, aliasId?, heichelId?, dryRun?, items?|payloadFile?, maxComments?, timeBudgetMs? }
	 *   kind=perPost      — seriesId, postId, aliasId required
	 *   kind=perPostIndex — no post params; rebuilds the commentId→postId index
	 */
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// OOM guard: refuse new jobs when the heap is already hot.
		if (heapTooHigh()) return memoryGuardError();
		const body = this.$i?.body || {};
		for (const k of ['kind', 'seriesId', 'postId', 'aliasId']) {
			if (body[k] === undefined || body[k] === null || body[k] === '') {
				const v = requestValue(this.$i, k);
				if (v) body[k] = v;
			}
		}
		const kind = body.kind || 'perPost';
		const seriesId = body.seriesId;
		const postId = body.postId;
		const aliasId = body.aliasId;
		const heichelId = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		const dryRun = !!(body.dryRun ?? (requestValue(this.$i, 'dryRun') === 'true' || requestValue(this.$i, 'dryRun') === true));
		if (!['perPost', 'perPostIndex', 'translation', 'summary', 'ocrFix'].includes(kind)) {
			return { success: false, error: 'BAD_KIND', message: 'kind must be perPost|perPostIndex' };
		}
		let items = [];
		if (kind === 'perPost') {
			if (!seriesId || !postId || !aliasId) {
				return { success: false, error: 'MISSING_PARAMS', message: 'seriesId, postId and aliasId are required for kind=perPost' };
			}
			// OOM gate: inline items are for SMALL payloads only. Large imports
			// must use the chunked /packed/import/bulk/stage upload + kind=publishAll,
			// which streams one payload file at a time with bounded memory.
			// (2026-09-30 quarantine: inline 98 MB payloads OOM-killed production.)
			const hasInlineItems = body.items !== undefined && body.items !== null && !body.payloadFile;
			if (hasInlineItems) {
				const inlineCount = Array.isArray(body.items) ? body.items.length : 0;
				if (inlineCount > INLINE_ITEMS_MAX_COUNT) {
					return {
						success: false, error: 'INLINE_TOO_LARGE',
						message: 'Inline items exceed ' + INLINE_ITEMS_MAX_COUNT + ' (' + inlineCount + ' given). Use POST /packed/import/bulk/stage (chunked upload) + kind=publishAll for large imports.',
					};
				}
			}
			const loaded = this.loadItems(body);
			if (loaded.error) return loaded.error;
			items = loaded.items;
			// Byte-size gate (catches deep/large individual items the count misses).
			if (hasInlineItems) {
				let approxBytes = 0;
				for (let n = 0; n < items.length; n++) {
					const c = items[n] && typeof items[n].content === 'string' ? items[n].content.length : 0;
					approxBytes += c;
					if (approxBytes > INLINE_ITEMS_MAX_BYTES) {
						return {
							success: false, error: 'INLINE_TOO_LARGE',
							message: 'Inline payload exceeds ~2 MB. Use POST /packed/import/bulk/stage (chunked upload) + kind=publishAll for large imports.',
						};
					}
				}
			}
			for (let n = 0; n < items.length; n++) {
				const err = validateCommentItem(items[n], n);
				if (err) return { success: false, error: 'ITEM_INVALID', message: err };
			}
		}
		const busy = runningJob(heichelId);
		if (busy) return { success: false, error: 'JOB_ALREADY_RUNNING', jobId: busy.id, scope: 'heichel', heichelId };
		const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: { kind, heichelId, seriesId, postId, aliasId, items },
			maxComments: Math.min(Number(body.maxComments) > 0 ? Math.floor(Number(body.maxComments)) : 200000, 500000),
			// B"H Yaakov's absolute law (2026-10-13): NO import may EVER exceed 6 seconds.
			// Anything taking longer is cancelled immediately and labeled ABSOLUTE FAILURE.
			// Imports must be small, fast batches — never long-running jobs.
			timeBudgetMs: Math.min(Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 6000, 6000),
			totalItems: items.length, wrote: 0, skipped: 0, errors: [],
			cancelRequested: false, createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
		};
		setJob(job);
		// Fire and forget — the job updates its own record; poll via status.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, kind, dryRun, totalItems: items.length } };
	}
};
