//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file resumeMixin.js
 * @description
 * Bulk-upload redesign §3.6: resume and retry-failed-only.
 *  POST /packed/import/posts/resume {jobId} — a new attempt under the
 *    same job lineage, reading the receipts file and skipping every
 *    post with status wrote|updated|skipped. No re-upload, no re-scan
 *    of done posts beyond their receipt lines.
 *  POST /packed/import/posts/retry-failed {jobId} — the same, but the
 *    attempt contains ONLY the posts whose receipt status is failed.
 *    The reply lists the failed postIds and their recorded errors.
 * A caller may only resume/retry their own jobs (alias scope; foreign
 * jobs return JOB_NOT_FOUND). A running or queued job cannot be
 * resumed. Inline jobs whose payload was released after terminal state
 * cannot be resumed — staged jobs are the resumable shape.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { buildJob } = require('./jobFactory.js');
const { getJobView } = require('./jobState.js');
const { scheduleImportJob } = require('./importLaneScheduler.js');
const { accountScope, jobAliasOf } = require('./statusAccess.js');
const { donePostIdsFromReceipts, failedReceipts } = require('./jobReceipts.js');

const TERMINAL_RESUMABLE = new Set(['done', 'failed', 'cancelled', 'absolute-failure', 'interrupted', 'paused']);

/** Rebuild the staged entries for a job whose payload lives in a tarball. */
async function rebuildStagedEntries(route, $i, view) {
	const uploadId = view.uploadId || (typeof view.source === 'string' && view.source.startsWith('upload:') ? view.source.slice('upload:'.length) : null);
	if (!uploadId) return { error: 'RESUME_NEEDS_STAGED' };
	const loaded = await route.loadStagedPosts($i, uploadId);
	if (loaded.error) return { error: 'RESUME_STAGED_UNREADABLE', message: String(loaded.error.message || loaded.error.error || loaded.error) };
	return { entries: loaded.entries, stagedDir: loaded.dest, source: loaded.source };
}

/** The resumable entries for a job view: live memory first, staged tarball second. */
async function resumableEntries(route, $i, found) {
	const view = found.view;
	const live = found.live && found.job;
	if (live && Array.isArray(live.spec?.posts) && live.spec.posts.length) {
		return { entries: live.spec.posts, stagedDir: live.spec.stagedDir, source: live.spec.source };
	}
	if (live && Array.isArray(live.spec?.updates) && live.spec.updates.length) {
		return { updates: live.spec.updates, stagedDir: live.spec.stagedDir, source: live.spec.source, kind: 'update' };
	}
	if (view.stagedDir || (typeof view.source === 'string' && view.source.startsWith('upload:'))) {
		return rebuildStagedEntries(route, $i, view);
	}
	if (view.kind === 'update' && view.updatesFile) {
		return { updatesFile: view.updatesFile, stagedDir: view.stagedDir, source: view.source, kind: 'update' };
	}
	return { error: 'RESUME_NEEDS_STAGED' };
}

module.exports = {
	/** POST /packed/import/posts/resume {jobId} */
	async resume() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		return this.resumeAttempt(false);
	},

	/** POST /packed/import/posts/retry-failed {jobId} */
	async retryFailed() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		return this.resumeAttempt(true);
	},

	/** Shared resume/retry-failed implementation. */
	async resumeAttempt(failedOnly) {
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		const detailed = typeof this.checkAuthDetailed === 'function' ? this.checkAuthDetailed() : null;
		const caller = (detailed && detailed.caller) || null;
		const body = this.$i?.body || {};
		const jobId = String(body.job || body.jobId || requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || '');
		if (!jobId) return { success: false, error: 'NO_JOB', message: 'Provide {jobId}.' };
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (account.scope && !jobAliasOf(found)) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (account.scope && !account.scope.has(String(jobAliasOf(found)))) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const view = found.view;
		if (!TERMINAL_RESUMABLE.has(view.status)) {
			return { success: false, error: 'JOB_NOT_RESUMABLE', jobId, status: view.status, message: 'Only a terminal or interrupted job can be resumed.' };
		}
		if (found.live && found.job && (found.job.status === 'running' || found.job.status === 'queued')) {
			return { success: false, error: 'JOB_RUNNING', jobId, status: found.job.status };
		}
		const lineageId = view.resumeOf || view.id;
		const kind = view.kind || 'import';
		const resolved = await resumableEntries(this, this.$i, found);
		if (resolved.error) {
			return { success: false, error: resolved.error, jobId, message: resolved.message || 'This job cannot be resumed: its input was inline and has been released. Re-stage the set and start a new job.' };
		}
		// Staged update jobs stream their file at run time; the runner
		// skips receipted entries while streaming, so no list is built here.
		if (kind === 'update' && resolved.updatesFile) {
			const attempt = buildJob({
				kind: 'update',
				resumeOf: lineageId,
				attempt: (view.attempt || 0) + 1,
				originalTotalPosts: view.originalTotalPosts || view.totalPosts,
				dryRun: view.dryRun,
				heichelId: view.heichelId,
				isAdmin: !!(caller && caller.isAdmin),
				jobAliasId: view.aliasId,
				jobAliasName: view.aliasName,
				posts: [],
				skipLiveCheck: false,
				source: view.source,
				stagedDir: resolved.stagedDir,
				caller: caller,
				timeBudgetMs: 600000
			});
			attempt.spec.updatesFile = resolved.updatesFile;
			attempt.spec.updates = null;
			attempt.totalPosts = view.totalPosts || 0;
			const admission = scheduleImportJob(this.$i, attempt, () => this.runUpdateJob(this.$i, attempt));
			if (admission.error) return { error: admission.error, message: admission.message, retryable: admission.retryable, retryAfterMs: admission.retryAfterMs, persistError: admission.persistError || undefined };
			return { success: { jobId: attempt.id, resumeOf: lineageId, attempt: attempt.attempt, status: attempt.status, kind: 'update', streamed: true } };
		}
		const entries = kind === 'update' ? (resolved.updates || []) : (resolved.entries || []);
		const entryPostId = entry => String((entry && (entry.postId || entry.id)) || '');
		let remaining;
		let failedList = [];
		if (failedOnly) {
			const failed = failedReceipts(this.$i, lineageId);
			const failedIds = new Set(failed.map(r => String(r.postId)));
			failedList = failed.map(r => ({ postId: r.postId, error: r.error || null }));
			remaining = entries.filter(entry => failedIds.has(entryPostId(entry)));
		} else {
			const done = donePostIdsFromReceipts(this.$i, lineageId);
			remaining = entries.filter(entry => !done.has(entryPostId(entry)));
		}
		if (!remaining.length) {
			return { success: { jobId: view.id, resumeOf: lineageId, resumed: false, remaining: 0, failed: failedList, message: failedOnly ? 'No failed posts to retry.' : 'Every post already has a receipt: nothing left to resume.' } };
		}
		const attempt = buildJob({
			kind,
			resumeOf: lineageId,
			attempt: (view.attempt || 0) + 1,
			originalTotalPosts: view.originalTotalPosts || view.totalPosts,
			dryRun: view.dryRun,
			heichelId: view.heichelId,
			isAdmin: !!(caller && caller.isAdmin),
			jobAliasId: view.aliasId,
			jobAliasName: view.aliasName,
			posts: kind === 'update' ? [] : remaining,
			skipLiveCheck: false,
			source: resolved.source || view.source,
			stagedDir: resolved.stagedDir || view.stagedDir,
			caller: caller,
			timeBudgetMs: 600000
		});
		if (kind === 'update') {
			attempt.spec.updates = remaining;
			attempt.totalPosts = remaining.length;
		}
		const runner = kind === 'update'
			? () => this.runUpdateJob(this.$i, attempt)
			: () => this.runJob(this.$i, attempt);
		const admission = scheduleImportJob(this.$i, attempt, runner);
		if (admission.error) {
			return { error: admission.error, message: admission.message, retryable: admission.retryable, retryAfterMs: admission.retryAfterMs, persistError: admission.persistError || undefined };
		}
		return {
			success: {
				jobId: attempt.id,
				resumeOf: lineageId,
				attempt: attempt.attempt,
				status: attempt.status,
				kind,
				held: admission.held || false,
				totalPosts: remaining.length,
				failed: failedOnly ? failedList : undefined
			}
		};
	}
};
