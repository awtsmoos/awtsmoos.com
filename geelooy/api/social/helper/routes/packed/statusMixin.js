// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StatusMixin
 * @description Serves packed import job status/list views with persisted restart fallback and caller-alias scoping.
 * The Awtsmoos counts every completed vessel without revealing another caller's hidden labor.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { getJobViewAsync, jobStateShape, listJobStatesAsync } = require('./jobState.js');
const { jobs } = require('./jobStore.js');
const { accountScope, jobAliasOf, visibleJobs } = require('./statusAccess.js');
const { summarizeReceipts, readReceiptsPage } = require('./jobReceipts.js');

const DONE_IDS_CAP = 1000;
const TERMINAL = new Set(['done', 'failed', 'cancelled', 'absolute-failure', 'interrupted', 'paused']);

function agentLog(route) {
	try {
		const headers = route.$i?.headers || {};
		console.log(`[AGENT-OP] id=${headers['x-agent-identity'] || 'UNIDENTIFIED'} kind=${headers['x-agent-kind'] || 'UNKNOWN'}`);
	} catch (_error) {}
}

function statusResponse(found, $i) {
	const v = found.view;
	// Bulk-upload redesign §3.3/§3.6: the durable per-post truth is the
	// receipts file (summarized here, pageable from /packed/import/posts/
	// receipts). The capped donePostIds[:1000] list is derived from the
	// receipts' first page — never from a linear list in the state file,
	// which keeps counters only. A job with no receipts yet reports an
	// empty list; its count still comes from the state counter.
	let receipts = null;
	let receiptPage = null;
	try {
		if ($i && v.id) {
			receipts = summarizeReceipts($i, v.resumeOf || v.id);
			receiptPage = readReceiptsPage($i, v.resumeOf || v.id, 1, DONE_IDS_CAP);
		}
	} catch (_) { /* receipts are advisory on status */ }
	const allDoneIds = receiptPage ? receiptPage.receipts.map(r => r.postId) : [];
	const doneCount = v.donePostIdsCount != null ? v.donePostIdsCount : (receipts ? receipts.total : allDoneIds.length);
	return {
		success: {
			id: v.id, status: v.status, dryRun: v.dryRun, live: found.live,
			kind: v.kind || 'import', resumeOf: v.resumeOf || undefined, attempt: v.attempt || 0,
			held: v.status === 'held', holdReason: v.holdReason || undefined, holdFreeBytes: v.holdFreeBytes,
			persistDegraded: !!v.persistDegraded,
			heichelId: v.heichelId, source: v.source, totalPosts: v.totalPosts,
			postsDone: v.postsDone, wrote: v.wrote, updated: v.updated,
			skipped: v.skipped, failed: v.failed,
			backlinksPending: v.backlinksPending || 0, backlinksDone: v.backlinksDone || 0,
			preHashed: v.preHashed || 0, preHashVerified: v.preHashVerified || 0,
			preHashMismatches: v.preHashMismatches || 0, preHashUntrusted: !!v.preHashUntrusted,
			errors: (v.errors || []).slice(-10),
			donePostIds: allDoneIds.slice(0, DONE_IDS_CAP),
			donePostIdsCount: doneCount,
			donePostIdsTruncated: doneCount > DONE_IDS_CAP,
			receipts,
			receiptsUrl: v.id ? ('/packed/import/posts/receipts?jobId=' + encodeURIComponent(v.resumeOf || v.id)) : undefined,
			createdAt: v.createdAt, updatedAt: v.updatedAt,
			startedAt: v.startedAt, finishedAt: v.finishedAt, durationMs: v.durationMs
		}
	};
}

module.exports = {
	/** GET /packed/import/posts/status?job=<id> | ?jobId=<id> [&wait=1&waitMs=1000] */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		agentLog(this);
		const jobId = requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'id');
		const waitRaw = requestValue(this.$i, 'wait');
		const wait = waitRaw === '1' || waitRaw === 'true';
		const waitMs = wait ? Math.min(Math.max(parseInt(requestValue(this.$i, 'waitMs'), 10) || 1000, 100), 5000) : 0;
		if (wait && waitMs > 0) {
			const start = Date.now();
			while (Date.now() - start < waitMs) {
				const found = await getJobViewAsync(this.$i, jobId);
				if (!found || TERMINAL.has(found.view.status)) break;
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
		const found = await getJobViewAsync(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (account.scope) {
			const alias = jobAliasOf(found);
			if (!alias || !account.scope.has(String(alias))) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		}
		return statusResponse(found, this.$i);
	},

	/** GET /packed/import/posts/receipts?jobId=<id>[&page=N&perPage=N] — paginated per-post receipts. */
	async receipts() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		const jobId = requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'id');
		const found = await getJobViewAsync(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (account.scope) {
			const alias = jobAliasOf(found);
			if (!alias || !account.scope.has(String(alias))) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		}
		const page = Number(requestValue(this.$i, 'page') || 1);
		const perPage = Number(requestValue(this.$i, 'perPage') || 100);
		const lineageId = found.view.resumeOf || found.view.id;
		const result = readReceiptsPage(this.$i, lineageId, page, perPage);
		const summary = summarizeReceipts(this.$i, lineageId);
		return { success: { jobId: found.view.id, lineageId, ...result, summary } };
	},

	/** GET /packed/import/posts/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		agentLog(this);
		const byId = new Map();
		for (const job of jobs.values()) byId.set(job.id, { ...jobStateShape(job), live: true });
		for (const disk of await listJobStatesAsync(this.$i, 50)) {
			if (disk?.id && !byId.has(disk.id)) byId.set(disk.id, { ...disk, live: false });
		}
		return {
			success: visibleJobs(byId.values(), account.scope)
				.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 50)
				.map(job => ({ id: job.id, status: job.status, kind: job.kind || 'import', dryRun: job.dryRun, live: job.live, heichelId: job.heichelId, source: job.source, totalPosts: job.totalPosts, postsDone: job.postsDone, wrote: job.wrote, updated: job.updated, skipped: job.skipped, failed: job.failed, holdReason: job.holdReason || undefined, resumeOf: job.resumeOf || undefined, errors: (job.errors || []).length, durationMs: job.durationMs }))
		};
	}
};
