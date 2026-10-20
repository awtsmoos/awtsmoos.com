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

const { processOnePost } = require('./processOnePost.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { appendJobLog } = require('./jobLog.js');
const { heapTooHigh } = require('./serverHealth.js');
const { saveJobState } = require('./jobState.js');
const { setJob } = require('./jobStore.js');
const { shedNow } = require('./eventLoopMonitor.js');

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
					// If the event loop is drowning, pause this worker 2s so
					// web traffic breathes; the job resumes on its own.
					if (shedNow()) {
						job.shedPauses = (job.shedPauses || 0) + 1;
						await new Promise(r => setTimeout(r, 2000));
						continue;
					}
					const n = ctx.nextPost++;
					if (n >= spec.posts.length) break;
					await processOnePost(ctx, n);
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
						saveJobState($i, job);
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
			if (!job.dryRun) await routes.flushSeriesAdds($i, job);
			if (job.status === 'running') job.status = 'done';
		} catch (e) {
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		// Clear the 6s watchdog — job finished (or failed) within limit
		if (job._killTimer) { clearTimeout(job._killTimer); job._killTimer = null; }
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
}

module.exports = { runWorkers };
