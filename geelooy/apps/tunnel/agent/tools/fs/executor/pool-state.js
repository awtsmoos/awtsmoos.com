// B"H

const crypto = require("node:crypto");
const Requester = require("./requester.js");

/** Creates one private queued job and its fairness identity. */
function createJob(payload, resolve, reject) {
	return {
		id: crypto.randomUUID(),
		payload,
		reject,
		requester: Requester.key(payload),
		resolve
	};
}

/** Finds the first queued job whose requester still has capacity. */
function eligibleIndex(state, maximum) {
	return state.queue.findIndex(job => {
		return Number(state.active.get(job.requester) || 0) < maximum;
	});
}

function increment(active, key) {
	active.set(key, Number(active.get(key) || 0) + 1);
}

function decrement(active, key) {
	const count = Number(active.get(key) || 0) - 1;
	if (count > 0) active.set(key, count);
	else active.delete(key);
}

function failure(code, message, stack) {
	const error = new Error(message || code || "fs_executor_failed");
	error.code = code || "FS_EXECUTOR_FAILED";
	if (stack) error.stack = stack;
	return error;
}

function stats(state, policy) {
	return {
		activeRequesters: state.active.size,
		busy: state.workers.filter(worker => worker.busy).length,
		maxPerRequester: policy.MAX_PER_REQUESTER,
		maxQueue: policy.MAX_QUEUE,
		queued: state.queue.length,
		ready: state.workers.filter(worker => worker.ready).length,
		workerLimit: policy.WORKERS,
		workers: state.workers.length
	};
}

module.exports = {
	createJob,
	decrement,
	eligibleIndex,
	failure,
	increment,
	stats
};
