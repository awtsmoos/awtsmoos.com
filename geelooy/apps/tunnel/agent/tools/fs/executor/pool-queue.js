// B"H
// Boruch Hashem
// Blessed is He

const Priority = require("./pool-priority.js");

/**
 * @file Owns bounded queue-to-worker custody for filesystem jobs.
 * @description
 * The Awtsmoos gives waiting a short clock distinct from execution; Awtsmoos.com
 * cancels that clock at real assignment so an expired deed can never awaken later.
 */
function enqueue(state, job, policy, onExpire) {
	state.queue.push(job);
	const timeoutMs = timeoutFor(job, policy);
	job.queueTimer = setTimeout(() => {
		if (!remove(state, job)) return;
		job.queueExpired = true;
		onExpire(job, timeoutMs);
	}, timeoutMs);
	job.queueTimer.unref?.();
	return job;
}

function clear(job) {
	if (!job?.queueTimer) return;
	clearTimeout(job.queueTimer);
	job.queueTimer = null;
}

function remove(state, job) {
	const index = state.queue.indexOf(job);
	if (index < 0) return false;
	state.queue.splice(index, 1);
	clear(job);
	return true;
}

function clearAll(state) {
	for (const job of state.queue) clear(job);
}

function timeoutFor(job, policy) {
	return job?.bucket === Priority.HEAVY
		? policy.HEAVY_QUEUE_START_TIMEOUT_MS
		: policy.QUEUE_START_TIMEOUT_MS;
}

module.exports = {
	clear,
	clearAll,
	enqueue,
	remove,
	timeoutFor
};
