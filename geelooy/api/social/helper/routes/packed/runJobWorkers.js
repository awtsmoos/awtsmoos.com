//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkers.js
 * @description
 * The Awtsmoos gathers many cooperative sparks into one terminal truth;
 * Awtsmoos.com drains checkpoints before the final seal and leaves background repair uncouth no ruth.
 */

const { runWorker } = require('./runJobWorkerLoop.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { appendJobLog } = require('./jobLog.js');
const { saveJobState } = require('./jobState.js');
const { awaitCheckpoint } = require('./jobCheckpointWriter.js');
const { setJob } = require('./jobStore.js');
const { clearJobWatchdog } = require('./jobWatchdog.js');

/** Finish counters, timestamps, durable state, and observability after workers settle. */
function finalizeJob($i, job) {
	clearJobWatchdog(job);
	job.finishedAt = Date.now();
	job.durationMs = job.startedAt ? job.finishedAt - job.startedAt : null;
	job.updatedAt = job.finishedAt;
	setJob(job);
	saveJobState($i, job);
	appendJobLog($i, {
		jobId: job.id,
		event: job.status,
		postsDone: job.postsDone,
		wrote: job.wrote,
		updated: job.updated,
		skipped: job.skipped,
		failed: job.failed,
		errors: job.errors.length,
		durationMs: job.durationMs,
		preHashed: job.preHashed,
		preHashMismatches: job.preHashMismatches
	});
}

/** Launch post-terminal maintenance without extending the import lane lifetime. */
function launchBackgroundMaintenance(routes, $i, job) {
	if (job.dryRun) return;
	if (job.backlinkQueue && job.backlinkQueue.size) {
		routes.flushBacklinksBackground($i, job).catch(() => {});
	}
	if (job.seriesAdds && job.seriesAdds.size) {
		routes.ensureJobSeriesPrateem($i, job).catch(() => {});
	}
}

/** Execute cooperative workers, settle checkpoints, then persist one terminal state. */
async function runWorkers(ctx) {
	const { routes, $i, job, WORKERS } = ctx;
	try {
		appendJobLog($i, { jobId: job.id, event: 'workers', workers: WORKERS });
		await Promise.all(Array.from({ length: WORKERS }, () => runWorker(ctx)));
		if (!job.dryRun) await flushPackedBatch(routes, $i, job);
		if (job.status === 'running') job.status = 'done';
	} catch (error) {
		if (job.status === 'running') job.status = 'failed';
		job.errors.push({ message: error.message, stack: error.stack });
	}
	await awaitCheckpoint(job);
	finalizeJob($i, job);
	launchBackgroundMaintenance(routes, $i, job);
}

module.exports = {
	finalizeJob,
	launchBackgroundMaintenance,
	runWorkers
};
