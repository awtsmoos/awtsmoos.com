// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Requester = require("./requester.js");

function create() {
	return {
		active: new Map(),
		bootFailures: 0,
		consecutiveBootFailures: 0,
		idleTimer: null,
		queue: [],
		scaleTimer: null,
		spawnTimer: null,
		stopped: false,
		workers: []
	};
}

function createJob(payload, resolve, reject) {
	return {
		id: crypto.randomUUID(),
		payload,
		reject,
		requester: Requester.key(payload),
		resolve
	};
}

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
		bootFailures: state.bootFailures,
		busy: state.workers.filter(worker => worker.busy).length,
		consecutiveBootFailures: state.consecutiveBootFailures,
		maxPerRequester: policy.MAX_PER_REQUESTER,
		maxQueue: policy.MAX_QUEUE,
		minimumWorkers: policy.MIN_WORKERS,
		queued: state.queue.length,
		ready: state.workers.filter(worker => worker.ready).length,
		starting: state.workers.filter(worker => !worker.ready).length,
		workerLimit: policy.WORKERS,
		workers: state.workers.length
	};
}

module.exports = {
	create,
	createJob,
	decrement,
	eligibleIndex,
	failure,
	increment,
	stats
};
