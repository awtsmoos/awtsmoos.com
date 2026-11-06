//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkers.js
 * @description
 * The Awtsmoos gathers cooperative sparks into one terminal truth and then loosens what is safely sealed;
 * Awtsmoos.com preserves recovery context when durable state cannot land, and releases input only after truth is revealed.
 */

const { runWorker } = require('./runJobWorkerLoop.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { appendJobLog } = require('./jobLog.js');
const { saveJobState } = require('./jobState.js');
const { awaitCheckpoint } = require('./jobCheckpointWriter.js');
const { closeReceipts } = require('./jobReceipts.js');
const { setJob } = require('./jobStore.js');
const { clearJobWatchdog } = require('./jobWatchdog.js');
const { releaseTerminalJobPayload } = require('./terminalJobPayload.js');

/** Finish counters, timestamps, durable state, and observability after workers settle. */
function finalizeJob($i, job) {
	clearJobWatchdog(job);
	job.finishedAt = Date.now();
	job.durationMs = job.startedAt ? job.finishedAt - job.startedAt : null;
	job.updatedAt = job.finishedAt;
	setJob(job);
	// Bulk-upload redesign §3.3: the receipts file is fsynced at terminal
	// state, so a resume after a crash reads exactly what happened.
	try { closeReceipts($i, job); } catch (_) { /* best effort */ }
	const persisted = saveJobState($i, job);
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
	return persisted;
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

/** Execute workers, persist terminal truth, launch repair, then release safely sealed input. */
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
	const persisted = finalizeJob($i, job);
	launchBackgroundMaintenance(routes, $i, job);
	if (persisted) releaseTerminalJobPayload(job);
}

module.exports = {
	finalizeJob,
	launchBackgroundMaintenance,
	runWorkers
};
