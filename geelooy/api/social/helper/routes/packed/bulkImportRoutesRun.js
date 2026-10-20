//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes job runner with the 6-second hard kill switch (split from bulkImportRoutes.js).
 */

const { setJob } = require('./bulkImportRoutesJobs.js');
const { appendJobLog } = require('./bulkImportRoutesGuards.js');

module.exports = {
	async runJob($i, job) {
		const { kind, seriesId, postId, aliasId, heichelId, items } = job.spec;
		job.status = 'running';
		job.startedAt = Date.now();
		setJob(job);
		appendJobLog($i, { jobId: job.id, event: 'started', kind, seriesId, postId, aliasId, itemCount: items.length, dryRun: !!job.dryRun });
		// B"H Yaakov's absolute law (2026-10-13): 6-SECOND HARD KILL SWITCH.
		// Any import exceeding 6 seconds is terminated immediately and labeled
		// ABSOLUTE FAILURE. No exceptions. This is enforced via Promise.race
		// so even a stuck job cannot block the event loop.
		const HARD_LIMIT_MS = 6000;
		const killSwitch = new Promise(resolve => {
			job._killTimer = setTimeout(() => {
				resolve('killed-6s-limit');
			}, HARD_LIMIT_MS);
			// Don't keep the process alive for this timer
			if (job._killTimer.unref) job._killTimer.unref();
		});
		try {
			const ctx = { heichelId, seriesId, postId, aliasId, kind };
			let outcome;
			const work = (async () => {
				if (kind === 'perPost') return await this.importPerPost($i, job, items, ctx);
				else if (kind === 'perPostIndex') return await this.buildPerPostIndex($i, job);
				else return 'retired-kind';
			})();
			outcome = await Promise.race([work, killSwitch]);
			// Clear the kill timer — job finished within limit
			if (job._killTimer) { clearTimeout(job._killTimer); job._killTimer = null; }
			if (outcome === 'killed-6s-limit') {
				job.status = 'absolute-failure';
				job.errors.push({ message: 'ABSOLUTE FAILURE: import exceeded Yaakov\'s 6-second limit and was terminated. Split into smaller batches.' });
				appendJobLog($i, { jobId: job.id, event: 'ABSOLUTE_FAILURE', reason: 'exceeded-6s-limit', kind });
			}
			else if (outcome === 'cancelled') job.status = 'cancelled';
			else if (outcome === 'paused-budget') {
				// Budget pause within 6s is fine — but if we hit the hard limit
				// it's an absolute failure, not a pause.
				job.status = 'paused';
			}
			else if (outcome === 'failed') job.status = 'failed';
			else if (outcome === 'retired-kind') {
				job.status = 'failed';
				job.errors.push({ message: 'KIND_RETIRED: per-comment kinds (translation/summary/ocrFix) are retired for this corpus — use kind=perPost (PATH2). The per-comment write path is physically non-viable at this scale.' });
			} else job.status = 'done';
		} catch (e) {
			if (job._killTimer) { clearTimeout(job._killTimer); job._killTimer = null; }
			job.status = 'failed';
			job.errors.push({ message: e.message, stack: e.stack });
		}
		job.finishedAt = Date.now();
		job.durationMs = job.finishedAt - job.startedAt;
		setJob(job);
		appendJobLog($i, {
			jobId: job.id, event: job.status,
			wrote: job.wrote, skipped: job.skipped,
			errors: job.errors.length, durationMs: job.durationMs,
		});
	}
};
