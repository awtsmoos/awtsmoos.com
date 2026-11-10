//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobMixin.js
 * @description
 * The Awtsmoos lets admitted work pass from queue to bounded motion without a mortal clock above;
 * Awtsmoos.com prepares indexed hints, arms one heartbeat guardian, and lets terminal truth arrive with love.
 *
 * Nov 8 instant pass: the live-hash prepass no longer gates the first
 * write. startLiveHashPrep runs it in the background (chunked slices,
 * setImmediate breaths) while the workers start at once; a worker whose
 * post is not cached yet resolves the miss against the native record
 * (processOneWrite's existing v4 fallback). The prepass completion is
 * logged when it lands — the `started` event's liveCacheSize is 0
 * because the cache is still filling, which is the correct truth.
 *
 * Nov 10 speed fix (C): the job defers the AwtsmoosDB complement
 * refresh (a full-graph verify, seconds-to-minutes at 14 GB) while it
 * runs — the growth gate would otherwise fire it about every 270
 * posts mid-import and stall the job for the whole verify each time.
 * The deferral is refcounted and cleared in the finally, so a crashed
 * job cannot defer refreshes forever; the next idle boundary or
 * maintenance timer then runs the one refresh the job earned.
 *
 * Nov 10 speed fix (E): the job widens the FS3 durability budget for
 * its run (setImportBatching, refcounted, cleared in the finally) and
 * flushes every pending file once at the end (flushAllPending, before
 * it reports done). The 25-write budget charged the whole directory
 * child-map rewrite (~400 allocates, ~400ms) to every post at 2,000
 * keys — the measured FS3 rate was ~2.5 posts/sec with fixes B/C/D
 * in place. Under the widened budget (2,000 writes / 60s) the
 * child-map is re-written once for the whole job instead of once per
 * 25 posts, and the job-end flush means a job that says "done" has
 * its data durable. Crash loss stays bounded by the job's idempotency
 * (a lost batch is re-written on resume — the job re-checks the live
 * store, it does not trust receipts alone).
 *
 * Nov 10 speed fix (I): the job also suppresses the FS3 session-cache
 * auto-flush for its run (setFs3ImportBatching, refcounted, cleared
 * in the finally). writeRecord() auto-flushes whenever the session
 * cache exceeds its 8 MB budget, but flush() does not clear the cache
 * or reset cacheBytes — so once the cache is over budget EVERY write
 * pays a full flush (whole child-map rewrite + seal + fsync). A
 * 2,000-post job crosses the budget ~1,500 posts in and collapses
 * from ~15/s to under 1/s (measured: chunk medians 0ms -> 3ms ->
 * 62ms -> 175ms -> 494ms -> 803ms -> 7,205ms). With the auto-flush
 * suppressed the cache grows to ~5 MB for a 2,000-post job and the
 * job-end flushAllPending() -> db.fs.flush() persists everything
 * once, so a job that says "done" has its data durable.
 */

const { yieldTick } = require('./serverHealth.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { appendJobLog } = require('./jobLog.js');
const { startLiveHashPrep } = require('./jobLiveHashPrep.js');
const { buildRunJobContext } = require('./runJobContext.js');
const { armJobWatchdog, clearJobWatchdog } = require('./jobWatchdog.js');
const { runWorkers } = require('./runJobWorkers.js');
const { deferRefresh, undeferRefresh } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/allocator/refreshDeferral.js');
const { setImportBatching, clearImportBatching, flushAllPending } = require('../../../../../../ayzarim/DosDB/durableFlush.js');
const { setImportBatching: setFs3ImportBatching, clearImportBatching: clearFs3ImportBatching } = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/storeState.js');

/** Persist the queued-to-running transition before expensive preparation begins. */
function markJobRunning($i, job) {
	job.status = 'running';
	job.updatedAt = Date.now();
	setJob(job);
	saveJobState($i, job);
}

/** Emit the established start event with the new lane/watchdog facts attached. */
function logJobStarted($i, job, liveHashes, context) {
	appendJobLog($i, {
		jobId: job.id,
		event: 'started',
		heichelId: job.spec.heichelId,
		totalPosts: job.spec.posts.length,
		dryRun: !!job.dryRun,
		source: job.spec.source,
		liveCacheSize: liveHashes.size,
		skipLiveCheck: !!job.skipLiveCheck,
		cacheBuildMs: job.cacheBuildMs,
		workers: context.WORKERS,
		isAdmin: !!job.isAdmin
	});
}

module.exports = {
	/** Run one accepted import job entirely inside its acquired scheduler lane. */
	async runJob($i, job) {
		await yieldTick();
		markJobRunning($i, job);

		// Bulk-upload redesign §3.5: a staged set's series.json is applied
		// by the series-upsert path BEFORE the first post is written, so
		// posts never land under a series whose fields are stale. A
		// series failure is recorded on the job but never aborts the import.
		if (job.spec && job.spec.series && typeof this.applyStagedSeries === 'function') {
			try {
				const applied = await this.applyStagedSeries($i, job);
				if (applied && applied.error) {
					job.errors.push({ message: 'SERIES_JSON_FAILED: ' + applied.error });
				}
			} catch (error) {
				job.errors.push({ message: 'SERIES_JSON_FAILED: ' + (error.message || error) });
			}
		}

		// Nov 8 instant pass: the live-hash prepass is a background
		// optimization, never a gate. Workers start at once; the cache
		// fills slice by slice and a miss is resolved per post against
		// the native record. The lane is NOT held for the prepass.
		const prep = startLiveHashPrep(this, $i, job);
		const liveHashes = prep.liveHashes;
		armJobWatchdog($i, job);
		setJob(job);
		saveJobState($i, job);

		const context = buildRunJobContext(this, $i, job, liveHashes);
		await yieldTick();
		logJobStarted($i, job, liveHashes, context);
		prep.done.then(result => {
			try {
				appendJobLog($i, {
					jobId: job.id,
					event: 'live-cache-ready',
					liveCacheSize: result.size,
					cacheBuildMs: result.ms,
					abandoned: !!result.abandoned
				});
			} catch (_) { /* logging must never throw */ }
		}).catch(() => { /* the prepass never rejects */ });

		deferRefresh();
		setImportBatching();
		setFs3ImportBatching();
		try {
			await runWorkers(context);
		} finally {
			clearJobWatchdog(job);
			flushAllPending();
			undeferRefresh();
			clearImportBatching();
			clearFs3ImportBatching();
		}
	}
};
