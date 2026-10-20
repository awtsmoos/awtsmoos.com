//B"H
//Blessed is He
//Boruch Hashem

/** @module StartMixin
 * POST /posts/import/bulk - accepts inline posts or a staged uploadId,
 * validates identity, enforces the per-heichel concurrency cap, creates
 * the job, and kicks off runJob fire-and-forget. A 202-style queued
 * response returns immediately; poll status() for progress.
 * AI SAFEGUARD: the timeBudgetMs cap (600s default) protects the server;
 * admin jobs are never throttled, but the cap must exist (2026-10-19).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { heapTooHigh, yieldTick, admissionHealthy } = require('./serverHealth.js');
const { validatePost, contentHash } = require('./postValidate.js');
const { runningJobsForHeichel, setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { buildJob } = require('./jobFactory.js');
const { resolveStartPosts } = require('./startPosts.js');
const { MAX_CONCURRENT_PER_HEICHEL } = require('./importBounds.js');

module.exports = {

	// -- routes ------------------------------------------------------------------
	/**
	 * POST /packed/import/posts/start
	 * Body: { operatorKey, heichelId?, dryRun?, timeBudgetMs?,
	 *         posts?: [...] }  — inline, ≤500 posts and ~20 MB
	 *     or  { operatorKey, uploadId, timeBudgetMs? } — staged tarball via /packed/import/bulk/stage
	 */
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// AGENT IDENTITY 2026-10-19
		try{const _h=(this.$i&&this.$i.headers)||{};console.log("[AGENT-OP] id="+(_h["x-agent-identity"]||"UNIDENTIFIED")+" kind="+(_h["x-agent-kind"]||"UNKNOWN"));}catch(_){}
		const body = this.$i?.body || {};
		const heichelId = body.heichelId || requestValue(this.$i, 'heichelId') || 'ikar';
		// B"H 2026-10-20 (crash-guard): fail-fast admission - one job at a
		// time, heap + system-RAM headroom, event-loop circuit breaker.
		// A refused job returns NOW with retryAfterMs: the server sheds
		// load instead of queueing into a hang (2026-10-20 00:01 EDT).
		const admission = admissionHealthy(heichelId);
		if (!admission.ok) {
			return { success: false, error: admission.code, retryAfterMs: admission.retryAfterMs, message: admission.message };
		}
		// dryRun may arrive as boolean true (JSON body) or string 'true' ($_POST/$_GET).
		const dryRunRaw = body.dryRun ?? requestValue(this.$i, 'dryRun');
		const dryRun = dryRunRaw === true || dryRunRaw === 'true';
		// Job-level alias fallback for posts without a commentator.
		const jobAliasId = String(body.aliasId || requestValue(this.$i, 'aliasId') || (heichelId + '-import'));
		const jobAliasName = String(body.aliasName || requestValue(this.$i, 'aliasName') || (heichelId + ' Import'));
		// B"H 2026-10-19: admin imports must NEVER be killed - the old 6s cap
		// (Yaakov's 2026-10-13 law) is superseded by the standing admin order
		// that the admin never faces limits. Budget matches the 600s watchdog.
		const timeBudgetMs = Math.min(
			Number(body.timeBudgetMs) > 0 ? Math.floor(Number(body.timeBudgetMs)) : 600000,
			600000
		);
		// B"H 2026-10-13 (import-speed): skipLiveCheck skips the full core-shard
		// scan at job start. Use when the client guarantees the posts are new
		// (fresh bulk load) — the 3.9 GB scan is pure overhead in that case.
		// Within-job idempotency (doneHashes) still applies.
		const skipLiveCheckRaw = body.skipLiveCheck ?? requestValue(this.$i, 'skipLiveCheck');
		const skipLiveCheck = skipLiveCheckRaw === true || skipLiveCheckRaw === 'true';
		const resolved = await resolveStartPosts(this, this.$i, body);
		if (!resolved.posts) return resolved;
		const posts = resolved.posts, source = resolved.source, stagedDir = resolved.stagedDir;
		// Pre-validate identity so a job never starts with zero importable posts.
		let identityOk = 0;
		for (let n = 0; n < posts.length; n++) {
			if (!validatePost(posts[n], n)) identityOk++;
		}
		if (!identityOk) {
			return { success: false, error: 'NO_VALID_POSTS', message: 'No post in the batch carries a postId.' };
		}
		const busy = runningJobsForHeichel(heichelId);
		// B"H 2026-10-20 (crash-guard): MAX_CONCURRENT_PER_HEICHEL is 1
		// again - backstop behind admissionHealthy(). Series flushes are
		// mutex-guarded; native writes are per-post keys (no races).
		if (busy.length >= MAX_CONCURRENT_PER_HEICHEL) {
			return {
				success: false, error: 'JOB_ALREADY_RUNNING', retryAfterMs: 30000,
				jobId: busy[0].id, scope: 'heichel', heichelId,
				running: busy.length, maxConcurrent: MAX_CONCURRENT_PER_HEICHEL,
			};
		}
		const job = buildJob({ dryRun, heichelId, posts, source, stagedDir,
			jobAliasId, jobAliasName, timeBudgetMs, skipLiveCheck });
		setJob(job);
		saveJobState(this.$i, job);
		// Fire and forget — the job updates its own record; poll via status.
		// runJob yields to the event loop first (await yieldTick), so the
		// HTTP response is sent before any heavy synchronous work begins.
		this.runJob(this.$i, job).catch(() => {});
		return { success: { jobId: job.id, status: job.status, dryRun, totalPosts: posts.length, source } };
	}
};
