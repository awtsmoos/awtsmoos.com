//B"H
//Blessed is He
//Boruch Hashem

/** @module RunJobMixin
 * Job runner entry: marks the job running, arms the 10-minute time-budget
 * watchdog, builds the live-hash cache (targeted lookups), then delegates
 * to runWorkers with a ctx object. The per-post closures live in
 * processOneValidate / processOneWrite; behavior is unchanged.
 */

const { yieldTick } = require('./serverHealth.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { appendJobLog } = require('./jobLog.js');
const { runWorkers } = require('./runJobWorkers.js');

module.exports = {
	async runJob($i, job) {
		// Yield immediately so the HTTP response is sent before we do any
		// synchronous work (file reads, JSON.parse, disk writes). Without
		// this, the first posts block the event loop and the client sees
		// a 502/504.
		await yieldTick();
		const spec = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		setJob(job);
		saveJobState($i, job);
		// B"H Yaakov's absolute law (2026-10-13): 6-SECOND HARD KILL SWITCH.
		// A watchdog timer enforces this even if the worker loop is stuck in
		// a long sync operation. Exceeding 6s = ABSOLUTE FAILURE.
		const HARD_LIMIT_MS = 600000; // BH 2026-10-19: raised 6s->600s, admin imports must never be killed
		job._killTimer = setTimeout(() => {
			if (job.status === 'running') {
				job.status = 'absolute-failure';
				job.errors.push({ message: 'ABSOLUTE FAILURE: watchdog killed import exceeding the 10-minute limit.' });
				setJob(job);
				saveJobState($i, job);
			}
		}, HARD_LIMIT_MS);
		if (job._killTimer.unref) job._killTimer.unref();
		// B"H 2026-10-13: no import lock — imports never block deploys/restarts.
		try {
		// One-time scan of the live core shard into {postId -> contentHash}.
		// This replaces the per-post full-shard read that made imports O(n^2).
		// B"H 2026-10-11: async streaming scan — parses only this heichel's
		// post lines and yields to the event loop (the sync scan blocked ~45s
		// on the 3.9 GB production shard).
		// B"H 2026-10-13 (import-speed): skipLiveCheck bypasses the live check
		// for known-fresh bulk loads. Within-job idempotency via job.doneHashes
		// still applies.
		// B"H 2026-10-15 (import-speed-fix): targeted O(1) lookups replace the
		// 3.9 GB full-shard scan. DB operations must be fast — never scan.
		let liveHashes = new Map();
		if (!job.skipLiveCheck) {
			try {
				const batchPostIds = (spec.posts || []).map(p => p.postId).filter(Boolean);
				liveHashes = this.buildLiveHashCacheForPosts($i, spec.heichelId, batchPostIds);
			} catch (e) {
				job.errors.push({ message: 'LIVE_CACHE_FAILED: ' + (e.message || e) });
			}
		}
		await yieldTick();
		appendJobLog($i, {
			jobId: job.id, event: 'started',
			heichelId: spec.heichelId, totalPosts: spec.posts.length,
			dryRun: !!job.dryRun, source: spec.source,
			liveCacheSize: liveHashes.size, skipLiveCheck: !!job.skipLiveCheck,
		});
		const now = Date.now();
		// B"H 2026-10-11: parallel worker pool (Yaakov: maximum throughput).
		// Posts are independent (per-post keys); workers share the job's
		// Maps/Sets, which are safe under the single-threaded event loop
		// because every mutation is synchronous. Series-index flushes are
		// mutex-guarded (a skipped flush's entries stay queued for the next
		// checkpoint) and snapshot+clear so concurrent adds are never lost.
		const WORKERS = Math.max(1, Math.min(16, Number(process.env.AWTSMOOS_IMPORT_WORKERS) || 4)); // BH 2026-10-19: reduced default 16->4, imports must never starve web requests
		let nextPost = 0;
		const ctx = { routes: this, $i: $i, job: job, spec: spec, now: now,
			liveHashes: liveHashes, WORKERS: WORKERS, nextPost: 0 };
		await runWorkers(ctx);
		} finally {
			// B"H 2026-10-13: lock removed — nothing to release.
			// Job state is already persisted above; the client resumes
			// 'interrupted' jobs after a restart.
		}
	}
};
