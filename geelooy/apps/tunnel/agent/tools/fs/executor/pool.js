// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Lifecycle = require("./pool-lifecycle.js");
const Observer = require("./executionObserver.js");
const Policy = require("./policy.js");
const Priority = require("./pool-priority.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");
const Warm = require("./pool-warm.js");
const WorkerEvents = require("./pool-worker-events.js");

/**
 * @file Orchestrates priority-aware filesystem execution without owning worker lifecycle detail.
 * @description
 * The Awtsmoos keeps orchestration spacious and bounded; Awtsmoos.com separates
 * queue custody from worker fate so interactive capacity remains visible and testable.
 */
function createPool(options = {}) {
	const policy = Policy.resolve(options);
	const state = State.create();
	let events;

	function execute(payload = {}, metadata = {}) {
		if (state.stopped) {
			return Promise.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
		}
		if (state.queue.length >= policy.MAX_QUEUE) {
			return Promise.reject(State.failure("FS_EXECUTOR_BACKPRESSURE", "fs_executor_queue_full"));
		}
		return new Promise((resolve, reject) => {
			const job = State.createJob(payload, resolve, reject, metadata);
			Queue.enqueue(state, job, policy, expireQueued);
			pump();
		});
	}

	function pump() {
		if (state.stopped) return;
		Lifecycle.touch(state);
		ensureWorkers();
		for (const worker of state.workers) {
			if (worker.busy || !worker.ready) continue;
			const index = Priority.eligibleIndex(state, policy, worker);
			if (index < 0) continue;
			const job = state.queue.splice(index, 1)[0];
			require("./pool-jobs.js").assign(state, worker, job, policy, events.expireRunning);
		}
		Lifecycle.schedule(state, policy);
	}

	function expireQueued(job, timeoutMs) {
		Observer.mark(job.payload, "executor_start_timeout", {
			consumerStarted: false,
			lane: job.lane,
			queued: false,
			queueStartTimeoutMs: timeoutMs
		});
		job.reject(State.failure("FS_EXECUTOR_START_TIMEOUT", "fs_executor_consumer_start_timed_out"));
		pump();
	}

	function ensureWorkers(requested) {
		if (state.spawnTimer || state.workers.some(worker => !worker.ready)) return;
		const target = Capacity.wanted(state, policy, requested);
		if (state.workers.length >= target) return;
		Capacity.spawn(state, policy, {
			bootExpired: events.bootExpired,
			complete: events.complete,
			exited: events.exited
		});
	}

	function shutdown() {
		Queue.clearAll(state);
		Lifecycle.shutdown(state);
	}

	events = WorkerEvents.create({ state, policy, pump });
	const stats = () => State.stats(state, policy);
	const warm = () => Warm.start(ensureWorkers, stats, policy.MIN_WORKERS);
	const warmReady = optionsValue => Warm.untilReady(ensureWorkers, stats, state, policy, optionsValue);
	return { execute, shutdown, state, stats, warm, warmReady };
}

module.exports = {
	createPool,
	eligibleIndex: State.eligibleIndex,
	failure: State.failure
};
