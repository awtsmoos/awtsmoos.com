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
		resourceOwners: new Map(),
		taskOwners: new Map(),
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

function eligibleIndex(state, maximum, worker = null) {
	return state.queue.findIndex(job => {
		if (Number(state.active.get(job.requester) || 0) >= maximum) return false;
		const owner = ownerForPayload(state, job.payload);
		return !owner || !worker || owner === worker;
	});
}

function asyncTaskId(payload = {}) {
	if (!/^asyncTask(?:Status|Wait|OutputPage|Cancel)$/i.test(String(payload.action || ""))) {
		return "";
	}
	return String(payload.taskId || payload.id || "");
}

function resourceId(payload = {}) {
	if (!/^staticServer(?:Stop|Logs)$/i.test(String(payload.action || ""))) return "";
	return String(payload.serverId || "");
}

function ownerForPayload(state, payload = {}) {
	const taskId = asyncTaskId(payload);
	if (taskId) return state.taskOwners.get(taskId) || null;
	const id = resourceId(payload);
	return id ? state.resourceOwners.get(id) || null : null;
}

function trackOwners(state, worker, payload = {}, result = {}) {
	const taskId = String(result.taskId || "");
	if (taskId) state.taskOwners.set(taskId, worker);
	if (
		String(result.action || payload.action || "") === "staticServerStart"
		&& result.ok !== false
		&& result.serverId
	) {
		state.resourceOwners.set(String(result.serverId), worker);
	}
	if (
		String(payload.action || "") === "staticServerStop"
		&& result.ok !== false
		&& (result.stopped || result.alreadyStopped)
	) {
		state.resourceOwners.delete(String(payload.serverId || ""));
	}
}

function removeWorkerOwners(state, worker) {
	for (const [taskId, owner] of state.taskOwners) {
		if (owner === worker) state.taskOwners.delete(taskId);
	}
	for (const [resourceId, owner] of state.resourceOwners) {
		if (owner === worker) state.resourceOwners.delete(resourceId);
	}
}

function workerOwnsState(state, worker) {
	for (const owner of state.taskOwners.values()) {
		if (owner === worker) return true;
	}
	for (const owner of state.resourceOwners.values()) {
		if (owner === worker) return true;
	}
	return false;
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
		resourceAffinities: state.resourceOwners.size,
		starting: state.workers.filter(worker => !worker.ready).length,
		taskAffinities: state.taskOwners.size,
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
	asyncTaskId,
	ownerForPayload,
	removeWorkerOwners,
	resourceId,
	stats,
	trackOwners,
	workerOwnsState
};
