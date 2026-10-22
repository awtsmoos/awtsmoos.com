// B"H
/**
 * @module RunJobWorkers
 * The Awtsmoos gathers many sparks into one illuminated flame.
 * A delayed checkpoint must bow before the final state takes its name.
 */
const { processJobPosts } = require('./runJobWorkerLoop.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { appendJobLog } = require('./jobLog.js');
const { saveJobState } = require('./jobState.js');
const { awaitCheckpoint } = require('./jobCheckpointWriter.js');
const { setJob } = require('./jobStore.js');

/** Execute cooperative workers, settle checkpoints, save terminal state. */
async function runWorkers(ctx) {
	const { routes, $i, job, WORKERS } = ctx;
	try {
		appendJobLog($i, { jobId: job.id, event: 'workers', workers: WORKERS });
		await Promise.all(Array.from({ length: WORKERS }, () => processJobPosts(ctx)));
		if (!job.dryRun) flushPackedBatch(routes, $i, job);
		// Legacy synchronous series-index traversal stays disabled.
		if (job.status === 'running') job.status = 'done';
	} catch (error) {
		job.status = 'failed';
		job.errors.push({ message: error.message, stack: error.stack });
	}
	await awaitCheckpoint(job);
	if (job._killTimer) {
		clearTimeout(job._killTimer);
		job._killTimer = null;
	}
	if (job._watchdogTimer) {
		clearInterval(job._watchdogTimer);
		job._watchdogTimer = null;
	}
	job.finishedAt = Date.now();
	job.durationMs = job.finishedAt - job.startedAt;
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
		preHashMismatches: job.preHashMismatches,
	});
	if (!job.dryRun && job.backlinkQueue && job.backlinkQueue.size) {
		routes.flushBacklinksBackground($i, job).catch(() => {});
	}
	if (!job.dryRun && job.seriesAdds && job.seriesAdds.size) {
		routes.ensureJobSeriesPrateem($i, job).catch(() => {});
	}
}

module.exports = { runWorkers };
