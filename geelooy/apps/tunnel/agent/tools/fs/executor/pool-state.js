// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Affinity = require("./pool-affinity.js");
const Priority = require("./pool-priority.js");
const Requester = require("./requester.js");

/**
 * @file Owns filesystem pool state while delegating affinity and scheduling policy.
 * @description
 * The Awtsmoos keeps state as state; Awtsmoos.com lets priority and ownership
 * live in smaller vessels so one map cannot become the hidden law of every lane.
 */
function create() {
	return {
		active: new Map(),
		bootFailures: 0,
		consecutiveBootFailures: 0,
		idleTimer: null,
		queue: [],
		resourceOwners: new Map(),
		scaleTimer: null,
		spawnTimer: null,
		stopped: false,
		taskOwners: new Map(),
		workers: []
	};
}

function createJob(payload, resolve, reject, metadata = {}) {
	return Priority.decorate({
		id: crypto.randomUUID(),
		payload,
		queueExpired: false,
		queueTimer: null,
		reject,
		requester: Requester.key(payload),
		resolve
	}, metadata);
}

function eligibleIndex(state, maximum, worker = null) {
	return Priority.eligibleIndex(state, {
		MAX_PER_REQUESTER: maximum,
		RESERVED_INTERACTIVE_WORKERS: 0
	}, worker);
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
		activeRequesters: requesterCount(state.active),
		bootFailures: state.bootFailures,
		busy: state.workers.filter(worker => worker.busy).length,
		consecutiveBootFailures: state.consecutiveBootFailures,
		maxPerRequester: policy.MAX_PER_REQUESTER,
		maxQueue: policy.MAX_QUEUE,
		minimumWorkers: policy.MIN_WORKERS,
		queued: state.queue.length,
		ready: state.workers.filter(worker => worker.ready).length,
		reservedInteractiveWorkers: policy.RESERVED_INTERACTIVE_WORKERS,
		resourceAffinities: state.resourceOwners.size,
		starting: state.workers.filter(worker => !worker.ready).length,
		taskAffinities: state.taskOwners.size,
		workerLimit: policy.WORKERS,
		workers: state.workers.length
	};
}

function requesterCount(active) {
	return new Set([...active.keys()].map(key => String(key).split("|")[0])).size;
}

module.exports = {
	asyncTaskId: Affinity.asyncTaskId,
	create,
	createJob,
	decrement,
	eligibleIndex,
	failure,
	increment,
	ownerForPayload: Affinity.ownerForPayload,
	removeWorkerOwners: Affinity.removeWorkerOwners,
	resourceId: Affinity.resourceId,
	stats,
	trackOwners: Affinity.trackOwners,
	workerOwnsState: Affinity.workerOwnsState
};
