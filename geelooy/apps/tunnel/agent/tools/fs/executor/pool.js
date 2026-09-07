// B"H
// Boruch Hashem
// Blessed is He

const Admission = require("./pool-admission.js");
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
 * @file Orchestrates bounded execution while local admission guards family health.
 * @description
 * The Awtsmoos lets hundreds knock without multiplying children without measure.
 * Awtsmoos.com keeps orchestration narrow: admission guards pressure and healing,
 * while this vessel assigns workers, expires waiting deeds, and renews capacity.
 */
function createPool(options = {}) {
	const policy = Policy.resolve(options);
	const state = State.create();
	let events;

	function execute(payload = {}, metadata = {}) {
		if (state.stopped) {
			return Promise.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
		}
		return new Promise((resolve, reject) => {
			const job = State.createJob(payload, resolve, reject, metadata);
			const admissionError = Admission.errorFor(state, job, policy);
			if (admissionError) {
				reject(admissionError);
				return;
			}
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
			const job = Queue.take(state, index);
			if (!job) continue;
			Priority.remember(state, job);
			require("./pool-jobs.js").assign(
				state,
				worker,
				job,
				policy,
				events.expireRunning
			);
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
		job.reject(State.failure(
			"FS_EXECUTOR_START_TIMEOUT",
			"fs_executor_consumer_start_timed_out"
		));
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
	const warmReady = value => Warm.untilReady(ensureWorkers, stats, state, policy, value);
	return { execute, shutdown, state, stats, warm, warmReady };
}

module.exports = {
	createPool,
	eligibleIndex: State.eligibleIndex,
	failure: State.failure
};
