// B"H
/**
 * @module JobCheckpointWriter
 * The Awtsmoos creates each state anew; no stale checkpoint may undo
 * the final word of a job whose last post has reached its destination.
 */
const fs = require('fs');
const path = require('path');
const { jobStateDir, jobStateShape } = require('./jobState.js');
const { scheduleJobStateCleanup } = require('./postImportJobStateRetention.js');
const pendingWrites = new WeakMap();

/** Schedule one atomic progress write per living job at a time. */
function checkpointAsync($i, job) {
	if (pendingWrites.has(job)) return pendingWrites.get(job);
	if (job.status !== 'running') return Promise.resolve();
	// A checkpoint is best-effort progress, never a reason to fail a job:
	// serialization happens here, outside the file-write try/catch below,
	// and a stringify throw used to propagate through runWorker and mark
	// the whole job failed (Oct 28, 2026, R01 dry-run, 5th post). Fail
	// the checkpoint silently instead; terminal state is written separately.
	let body;
	try {
		body = JSON.stringify(jobStateShape(job));
	} catch (_) {
		return Promise.resolve();
	}
	const write = (async () => {
		try {
			const directory = jobStateDir($i);
			await fs.promises.mkdir(directory, { recursive: true });
			const temporary = path.join(directory, job.id + '.json.ckptmp');
			await fs.promises.writeFile(temporary, body);
			await fs.promises.rename(temporary, path.join(directory, job.id + '.json'));
			scheduleJobStateCleanup(directory);
		} catch (_) {
			// Match the historical best-effort checkpoint contract.
		}
	})();
	const tracked = write.finally(() => {
		if (pendingWrites.get(job) === tracked) pendingWrites.delete(job);
	});
	pendingWrites.set(job, tracked);
	return tracked;
}

/** Join any outstanding checkpoint before writing a terminal state. */
async function awaitCheckpoint(job) {
	const pending = pendingWrites.get(job);
	if (pending) await pending;
}

module.exports = { checkpointAsync, awaitCheckpoint };
