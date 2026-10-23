//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkerLoop.js
 * @description
 * The Awtsmoos renews each worker step without binding the work to a mortal clock;
 * Awtsmoos.com yields under pressure, marks true progress, and lets one watchdog guard the flock.
 */

const { checkpointAsync } = require('./jobCheckpointWriter.js');
const { heartbeatJob, markJobProgress } = require('./jobWatchdogPolicy.js');
const { watchdogTick } = require('./jobWatchdog.js');
const { waitForImportPressure } = require('./runJobBackpressure.js');
const { processOnePost } = require('./processOnePost.js');
const { flushPackedBatch } = require('./runJobBatch.js');

/** Yield one event-loop turn between post attempts. */
function yieldTick() {
	return new Promise(resolve => setImmediate(resolve));
}

/** Schedule a bounded nonterminal checkpoint after recurring useful work. */
function maybeCheckpoint($i, job) {
	job._processedCount = (job._processedCount || 0) + 1;
	const oldEnough = Date.now() - (job._lastCheckpointAt || 0) >= 1000;
	if (!oldEnough || job._processedCount % 5 !== 0) return;
	job._lastCheckpointAt = Date.now();
	checkpointAsync($i, job);
}

/** Run one cooperative post worker until input, cancellation, or terminal state ends it. */
async function runWorker(ctx) {
	const { routes, $i, job, spec } = ctx;
	while (job.status === 'running') {
		if (job.cancelRequested) {
			job.status = 'cancelled';
			break;
		}
		if (!(await watchdogTick($i, job))) break;
		heartbeatJob(job);
		if (await waitForImportPressure(job)) continue;

		const index = ctx.nextPost++;
		if (index >= spec.posts.length) break;
		await processOnePost(ctx, spec.posts[index], index);
		markJobProgress(job);
		maybeCheckpoint($i, job);

		if (job.status === 'running' && job.postsDone > 0 && job.postsDone % 500 === 0) {
			await flushPackedBatch(routes, $i, job, spec);
		}
		await yieldTick();
	}
}

module.exports = {
	maybeCheckpoint,
	runWorker,
	yieldTick
};
