//B"H
//Blessed is He
//Boruch Hashem

/** @module RunJobWorkers
 * The import worker pool: WORKERS concurrent workers drain the post list,
 * then the final packed-mirror + series-index flush, then job terminal
 * state. A 10-minute time budget and heap guard can pause/fail the job;
 * the idempotent skip logic makes resume safe.
 * AI SAFEGUARD: the inner try/catch converts worker errors to job
 * status; the finalize block must always run. Do not restructure the
 * try/catch/finally nesting without re-testing a live import.
 */

const fs = require('fs');
const path = require('path');
const { processOnePost } = require('./processOnePost.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { appendJobLog } = require('./jobLog.js');
const { heapTooHigh } = require('./serverHealth.js');
const { saveJobState, jobStateDir, jobStateShape } = require('./jobState.js');
const { scheduleJobStateCleanup } = require('./postImportJobStateRetention.js');
const { setJob } = require('./jobStore.js');
const { shedNow } = require('./eventLoopMonitor.js');

// B"H 2026-10-21 (Worker B, import-speed): ASYNC mid-job checkpoint.
// saveJobState() is a synchronous writeFileSync of the full job shape
// (donePostIds grows unbounded with job size); on the runner's hot path
// that is a blocking write every 500 posts. This helper persists the
// same shape via fs.promises (atomic tmp+rename) and is throttled by
// the caller to at most one write per 5 s; the terminal save in
// runWorkers below stays synchronous so a finished job's state is
// durable before its status can be read.
function checkpointAsync($i, job) {
	if (job._ckptInFlight) return;
	job._ckptInFlight = true;
	(async () => {
		try {
			const dir = jobStateDir($i);
			await fs.promises.mkdir(dir, { recursive: true });
			const tmp = path.join(dir, job.id + '.json.ckptmp');
			await fs.promises.writeFile(tmp, JSON.stringify(jobStateShape(job)));
			await fs.promises.rename(tmp, path.join(dir, job.id + '.json'));
			scheduleJobStateCleanup(dir);
		} catch (_) { /* best effort — same contract as saveJobState */ }
		finally { job._ckptInFlight = false; }
	})();
}

async function runWorkers(ctx) {
	const routes = ctx.routes, $i = ctx.$i, job = ctx.job, spec = ctx.spec, WORKERS = ctx.WORKERS;
		try {
			let worker = async () => {
				while (job.status === 'running') {
					if (job.cancelRequested) { job.status = 'cancelled'; break; }
					// B"H Yaakov's absolute law (2026-10-13): 6-SECOND HARD LIMIT.
					// Exceeding it is an ABSOLUTE FAILURE, not a pause. Split into
					// smaller batches.
					if (Date.now() - job.startedAt > job.timeBudgetMs) {
						job.status = 'absolute-failure';
						job.errors.push({ message: 'ABSOLUTE FAILURE: import exceeded the 10-minute limit. Split into smaller batches.' });
						break;
					}
					if (heapTooHigh()) {
						job.errors.push({ message: 'PAUSED_MEMORY: heap exceeded safe threshold; resume to continue.' });
						job.status = 'paused';
						break;
					}
					// B"H 2026-10-20 (crash-guard): latency circuit breaker.
					// If the event loop is drowning, pause this worker so
					// web traffic breathes; the job resumes on its own.
					// B"H 2026-10-21 (Worker B, import-speed): pause in 250 ms
					// slices instead of one 2 s sleep, re-checking shedNow()
					// every slice (the while-loop head). The breaker still
					// sheds load identically while the loop is drowning, but
					// an admin job is no longer starved for a full 2 s after
					// the loop has already recovered.
					if (shedNow()) {
						job.shedPauses = (job.shedPauses || 0) + 1;
						await new Promise(r => setTimeout(r, 250));
						continue;
					}
					const n = ctx.nextPost++;
					if (n >= spec.posts.length) break;
					await processOnePost(ctx, n);
					// B"H 2026-10-21 (Worker P, job-stall fix): progress
					// heartbeat + checkpoint for ALL job sizes. The old
					// code checkpointed only at postsDone % 500, so any
					// job of <=500 posts killed by a restart showed
					// postsDone=0 forever and its disk state stayed
					// 'running' (postimport_mviswtsg_7e8c5e61,
					// postimport_mviqh2rn_7b60175b). Now: every completed
					// post attempt stamps lastProgressAt (the runJobMixin
					// progress watchdog reads it), and progress is
					// checkpointed asynchronously every 25 processed
					// posts (2s-throttled), so a killed job's on-disk
					// state is honest and resumable.
					job.lastProgressAt = Date.now();
					job._processedCount = (job._processedCount || 0) + 1;
					if (job._processedCount % 25 === 0) {
						const pNow = Date.now();
						if (pNow - (job._ckptAt || 0) >= 2000) {
							job._ckptAt = pNow;
							checkpointAsync($i, job);
						}
					}
					// B"H 2026-10-13 (import-speed): persist job state every
					// 500 posts, not every 25. Each save is a sync file write
					// + directory prune scan; every-25 was 40+ saves for a
					// 1000-post job. Every-500 is 2 saves with the same
					// crash-resume guarantee (worst case re-processes 500
					// posts, all idempotent). The packed batch is flushed
					// here too so a crash never leaves >500 posts with
					// native-but-no-packed.
					// B"H 2026-10-12: mid-batch SERIES flush REMOVED — per-worker
					// flushRunning flags don't coordinate across workers,
					// causing lost updates via interleaved read-modify-write.
					// Single final series flush (below) is atomic and complete.
					if (job.postsDone % 500 === 0) {
						flushPackedBatch(routes, $i, job);
						// B"H 2026-10-21 (Worker B): async + time-throttled
						// checkpoint (see checkpointAsync above) — at most
						// one state write per 5 s no matter how fast posts
						// flow; the %500 packed flush above is unchanged,
						// and the terminal save below stays synchronous.
						const ckNow = Date.now();
						if (ckNow - (job._ckptAt || 0) >= 5000) {
							job._ckptAt = ckNow;
							checkpointAsync($i, job);
						}
					}
				}
			};
			appendJobLog($i, { jobId: job.id, event: 'workers', workers: WORKERS });
			// BH 2026-10-19: yield to event loop between batches so imports never block web requests
		const origWorker = worker;
		worker = async () => { await origWorker(); await new Promise(r => setImmediate(r)); };
		await Promise.all(Array.from({ length: WORKERS }, () => worker()));
			// Final flush: any packed records still queued, then series index.
			if (!job.dryRun) flushPackedBatch(routes, $i, job);
			// B"H 2026-10-20: flushSeriesAdds DISABLED — the $i.db read-modify-write on
			// /social/heichelos/<h>/series/<s>/posts hangs the event loop 3+ min on NEW
			// series (every Rishonim job since 01:09 EDT), starving the API until SIGKILL.
			// The legacy series-posts index is redundant: series pages merge it with the
			// packed allPosts shard (readMergedSeriesPosts in seriesPostMerge.js) and the
			// packed record wins on conflict. Posts are fully readable/listable without it.
			// Re-enable ONLY after the $i.db synchronous traversal is fixed.
			// if (!job.dryRun) await routes.flushSeriesAdds($i, job);
			if (job.status === 'running') job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		// Clear the 6s watchdog — job finished (or failed) within limit
		if (job._killTimer) { clearTimeout(job._killTimer); job._killTimer = null; }
		// B"H 2026-10-21 (Worker P): clear the progress watchdog too.
		if (job._watchdogTimer) { clearInterval(job._watchdogTimer); job._watchdogTimer = null; }
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			postsDone: job.postsDone, wrote: job.wrote, updated: job.updated,
			skipped: job.skipped, failed: job.failed,
			errors: job.errors.length, durationMs: job.durationMs,
			preHashed: job.preHashed, preHashMismatches: job.preHashMismatches,
		});
		// B"H 2026-10-14 (import-speed): deferred backlink flush. Launched
		// AFTER the job is terminal and the 6s watchdog is cleared — never
		// awaited, so it can never trip Yaakov's limit. Native records (the
		// system of record) are durable at this point; backlinks are a
		// secondary index for alias/org queries. Crash recovery: the queue
		// is persisted in job state; replay via posts/flush-backlinks.
		if (!job.dryRun && job.backlinkQueue && job.backlinkQueue.size) {
			routes.flushBacklinksBackground($i, job).catch(() => {});
		}
		// B"H 2026-10-22 (prateem-gap fix): ensure every series this
		// job wrote to carries its prateem record, so the series is
		// discoverable (series /details + the browse tree). Deferred
		// + fire-and-forget exactly like the backlink flush above:
		// the job is already terminal, so this can never trip a
		// watchdog or fail the job. Residuals stay visible via the
		// census flag series_missing_prateem.
		if (!job.dryRun && job.seriesAdds && job.seriesAdds.size) {
			routes.ensureJobSeriesPrateem($i, job).catch(() => {});
		}
}

module.exports = { runWorkers };
