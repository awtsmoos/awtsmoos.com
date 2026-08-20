// B"H
// Boruch Hashem
// Blessed is He

const Priority = require("./pool-priority.js");

/**
 * @file Owns bounded requester-local waiting custody for filesystem jobs.
 * @description
 * The Awtsmoos gives every waiting deed a clock and every shliach a measured share.
 * Awtsmoos.com counts pending work by requester before global pressure, releases that
 * count at assignment or expiry, and never lets one queue disguise the burden of all.
 */
function canEnqueue(state, job, policy) {
	const requesterQueued = queuedFor(state, job.requester);
	if (requesterQueued >= policy.MAX_QUEUE_PER_REQUESTER) {
		return {
			ok: false,
			code: "FS_EXECUTOR_REQUESTER_BACKPRESSURE",
			message: "fs_executor_requester_queue_full",
			requesterQueued,
			requesterLimit: policy.MAX_QUEUE_PER_REQUESTER
		};
	}
	if (state.queue.length >= policy.MAX_QUEUE) {
		return {
			ok: false,
			code: "FS_EXECUTOR_BACKPRESSURE",
			message: "fs_executor_queue_full",
			requesterQueued,
			requesterLimit: policy.MAX_QUEUE_PER_REQUESTER
		};
	}
	return { ok: true, requesterQueued, requesterLimit: policy.MAX_QUEUE_PER_REQUESTER };
}

function enqueue(state, job, policy, onExpire) {
	state.queue.push(job);
	increment(state.queuedByRequester, job.requester);
	const timeoutMs = timeoutFor(job, policy);
	job.queueTimer = setTimeout(() => {
		if (!remove(state, job)) return;
		job.queueExpired = true;
		onExpire(job, timeoutMs);
	}, timeoutMs);
	job.queueTimer.unref?.();
	return job;
}

function take(state, index) {
	if (index < 0 || index >= state.queue.length) return null;
	const [job] = state.queue.splice(index, 1);
	if (!job) return null;
	decrement(state.queuedByRequester, job.requester);
	clear(job);
	return job;
}

function remove(state, job) {
	const index = state.queue.indexOf(job);
	if (index < 0) return false;
	const removed = take(state, index);
	return Boolean(removed);
}

function takeAll(state) {
	const jobs = state.queue.splice(0);
	for (const job of jobs) clear(job);
	state.queuedByRequester.clear();
	return jobs;
}

function clear(job) {
	if (!job?.queueTimer) return;
	clearTimeout(job.queueTimer);
	job.queueTimer = null;
}

function clearAll(state) {
	for (const job of state.queue) clear(job);
}

function queuedFor(state, requester) {
	return Number(state.queuedByRequester.get(String(requester || "anonymous")) || 0);
}

function increment(map, key) {
	const stable = String(key || "anonymous");
	map.set(stable, Number(map.get(stable) || 0) + 1);
}

function decrement(map, key) {
	const stable = String(key || "anonymous");
	const next = Math.max(0, Number(map.get(stable) || 0) - 1);
	if (next) map.set(stable, next);
	else map.delete(stable);
}

function timeoutFor(job, policy) {
	return job?.bucket === Priority.HEAVY
		? policy.HEAVY_QUEUE_START_TIMEOUT_MS
		: policy.QUEUE_START_TIMEOUT_MS;
}

module.exports = {
	canEnqueue,
	clear,
	clearAll,
	enqueue,
	queuedFor,
	remove,
	take,
	takeAll,
	timeoutFor
};
