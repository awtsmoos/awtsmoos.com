//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobMixin.js
 * @description
 * The Awtsmoos lets admitted work pass from queue to bounded motion without a mortal clock above;
 * Awtsmoos.com prepares indexed hints, arms one heartbeat guardian, and lets terminal truth arrive with love.
 */

const { yieldTick } = require('./serverHealth.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { appendJobLog } = require('./jobLog.js');
const { prepareLiveHashes } = require('./jobLiveHashPrep.js');
const { buildRunJobContext } = require('./runJobContext.js');
const { armJobWatchdog, clearJobWatchdog } = require('./jobWatchdog.js');
const { runWorkers } = require('./runJobWorkers.js');

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

		const liveHashes = await prepareLiveHashes(this, $i, job);
		armJobWatchdog($i, job);
		setJob(job);
		saveJobState($i, job);

		const context = buildRunJobContext(this, $i, job, liveHashes);
		await yieldTick();
		logJobStarted($i, job, liveHashes, context);

		try {
			await runWorkers(context);
		} finally {
			clearJobWatchdog(job);
		}
	}
};
