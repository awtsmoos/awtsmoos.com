// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const FsError = require("../filesystemError.js");
const Affinity = require("./pool-affinity.js");
const Circuit = require("./family-circuit.js");
const Priority = require("./pool-priority.js");
const Requester = require("./requester.js");

/**
 * @file Owns filesystem pool state and bounded family-healing testimony.
 * @description
 * The Awtsmoos renews each requester without confusing waiting with possession.
 * Awtsmoos.com also keeps family crash evidence beside worker state, while restoring
 * only allowlisted filesystem failure testimony across the isolated process boundary.
 */
function create() {
	return {
		active: new Map(),
		bootFailures: 0,
		consecutiveBootFailures: 0,
		dynamicCap: 0,
		eagerGrowth: false,
		familyFailures: new Map(),
		idempotency: new Map(),
		idleTimer: null,
		lastRequesterByRank: new Map(),
		queue: [],
		queuedByRequester: new Map(),
		resourceOwners: new Map(),
		saturatedPumps: 0,
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

/**
 * Reserve-blind eligibleIndex kept for internal use only. It intentionally
 * bypasses the interactive reserve (RESERVED_INTERACTIVE_WORKERS: 0); it is NOT
 * exported from pool.js anymore (item 62) because any external caller would
 * silently defeat the lane starvation protection.
 */
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
	else active.delete(count);
}

function failure(code, message, stack, filesystem = null) {
	const error = new Error(message || code || "fs_executor_failed");
	error.code = code || "FS_EXECUTOR_FAILED";
	if (stack) error.stack = stack;
	return FsError.restore(error, filesystem);
}

function stats(state, policy) {
	const running = runningAges(state);
	return {
		activeRequesters: requesterCount(state.active),
		bootFailures: state.bootFailures,
		busy: state.workers.filter(worker => worker.busy).length,
		consecutiveBootFailures: state.consecutiveBootFailures,
		dynamicCap: Number(state.dynamicCap) || policy.WORKERS,
		eagerGrowth: state.eagerGrowth === true,
		familyCircuit: Circuit.snapshot(state, policy),
		maxPerRequester: policy.MAX_PER_REQUESTER,
		maxQueue: policy.MAX_QUEUE,
		maxQueuePerRequester: policy.MAX_QUEUE_PER_REQUESTER,
		minimumWorkers: policy.MIN_WORKERS,
		oldestRunningAgeMs: running.oldest,
		oldestRunningAgeMsByLane: running.byLane,
		queued: state.queue.length,
		queuedRequesters: state.queuedByRequester.size,
		ready: state.workers.filter(worker => worker.ready).length,
		resourceAffinities: state.resourceOwners.size,
		reservedInteractiveWorkers: policy.RESERVED_INTERACTIVE_WORKERS,
		starting: state.workers.filter(worker => !worker.ready).length,
		taskAffinities: state.taskOwners.size,
		workerLimit: policy.WORKERS,
		workers: state.workers.length
	};
}

/** Age of the oldest running job overall and per lane (item 36, feeds H51). */
function runningAges(state) {
	const byLane = {};
	let oldest = 0;
	const now = Date.now();
	for (const worker of state.workers) {
		if (!worker.busy || !worker.job) continue;
		const startedAt = worker.job.assignedAt || worker.job.queuedAt || now;
		const age = Math.max(0, now - startedAt);
		if (age > oldest) oldest = age;
		const lane = worker.job.lane || "unknown";
		byLane[lane] = Math.max(byLane[lane] || 0, age);
	}
	return { oldest, byLane };
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
