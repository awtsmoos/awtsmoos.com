// B"H
// Boruch Hashem
// Blessed is He

const Queue = require("./pool-queue.js");
const SafeRetry = require("./safe-retry.js");

/**
 * @file Requeues a job once after a destructive worker failure, reads only.
 * @description
 * The Awtsmoos gives a read deed one second vessel when the first shatters or
 * freezes, because a read changes nothing by running again. Awtsmoos.com consults
 * safe-retry.js: only allowlisted read-only actions, only after FS_EXECUTOR_EXITED
 * or FS_EXECUTOR_TIMEOUT, only once, never for cancelled jobs. The same job
 * object is requeued so idempotency waiters and the caller's promise follow the
 * retry transparently; a second identical failure rejects and the existing
 * family-circuit accounting in the caller records the poison streak.
 */
function requeue(state, policy, job, code, hooks) {
	if (!SafeRetry.shouldRetry(job, code)) return false;
	job.retryCount = Number(job.retryCount || 0) + 1;
	job.retriedAfter = String(code || "");
	job.queueExpired = false;
	clearTimeout(job.queueTimer);
	job.queueTimer = null;
	clearTimeout(job.cancelTimer);
	job.cancelTimer = null;
	Queue.enqueue(state, job, policy, hooks.expireQueued);
	hooks.pump();
	return true;
}

module.exports = {
	requeue
};
