// B"H
/**
 * @module RunJobWorkerLoop
 * The Awtsmoos renews each post; a bounded stream of living sparks
 * leaves enough breath for every visitor to read while authors write.
 */
const { processOnePost } = require('./processOnePost.js');
const { flushPackedBatch } = require('./runJobBatch.js');
const { heapTooHigh } = require('./serverHealth.js');
const { shedNow } = require('./eventLoopMonitor.js');
const { checkpointAsync } = require('./jobCheckpointWriter.js');

/** Retain the original circuit, failure messages, and checkpoint cadence. */
async function processJobPosts(ctx) {
	const { job, spec, routes, $i } = ctx;
	while (job.status === 'running') {
		if (job.cancelRequested) {
			job.status = 'cancelled';
			break;
		}
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
		if (shedNow()) {
			job.shedPauses = (job.shedPauses || 0) + 1;
			await new Promise(resolve => setTimeout(resolve, 250));
			continue;
		}
		const postIndex = ctx.nextPost++;
		if (postIndex >= spec.posts.length) break;
		await processOnePost(ctx, postIndex);
		job.lastProgressAt = Date.now();
		job._processedCount = (job._processedCount || 0) + 1;
		if (job._processedCount % 25 === 0) {
			const now = Date.now();
			if (now - (job._ckptAt || 0) >= 2000) {
				job._ckptAt = now;
				checkpointAsync($i, job);
			}
		}
		if (job.postsDone % 500 === 0) {
			flushPackedBatch(routes, $i, job);
			const now = Date.now();
			if (now - (job._ckptAt || 0) >= 5000) {
				job._ckptAt = now;
				checkpointAsync($i, job);
			}
		}
	}
	await new Promise(resolve => setImmediate(resolve));
}

module.exports = { processJobPosts };
