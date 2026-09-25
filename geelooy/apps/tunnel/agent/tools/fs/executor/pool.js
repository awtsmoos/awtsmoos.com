// B"H
// Boruch Hashem
// Blessed is He

const Admission = require("./pool-admission.js");
const Cancel = require("./pool-cancel.js");
const Capacity = require("./pool-capacity.js");
const Idempotency = require("./pool-idempotency.js");
const Jobs = require("./pool-jobs.js");
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
 *
 * Item 62: the reserve-blind eligibleIndex helper stays internal-only (see
 * pool-state.js); it is deliberately NOT exported here anymore, because any
 * external caller would silently defeat the interactive-reserve lane
 * starvation protection.
 */
function createPool(options = {}) {
	const policy = Policy.resolve(options);
	const state = State.create();
	state.dynamicCap = policy.WORKERS;
	let events;

	function execute(payload = {}, metadata = {}) {
		if (state.stopped) {
			return Promise.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
		}
		const job = State.createJob(payload, null, null, metadata);
		// Item 35: derive the idempotency key before admission, so a duplicate
		// submission attaches to the in-flight job instead of executing twice.
		job.idempotencyKey = Idempotency.keyFor(payload, metadata);
		const duplicate = attachDuplicate(job);
		if (duplicate) return duplicate;
		const promise = new Promise((resolve, reject) => {
			job.resolve = value => {
				resolve(value);
				Idempotency.settle(state, policy, job.idempotencyKey, true, value, null);
			};
			job.reject = error => {
				reject(error);
				Idempotency.settle(state, policy, job.idempotencyKey, false, null, error);
			};
			const admissionError = Admission.errorFor(state, job, policy);
			if (admissionError) {
				job.reject(admissionError);
				return;
			}
			Queue.enqueue(state, job, policy, expireQueued);
			pump();
		});
		// Item 34: the caller-facing seam for cancellation. The control layer
		// should call promise.cancel(reason), or cancelForRequest(requestId),
		// when a request is abandoned.
		promise.jobId = job.id;
		promise.cancel = reason => Cancel.cancel(state, policy, null, job.id, reason);
		return promise;
	}

	/** Item 35: a duplicate submission rides the original job's outcome. */
	function attachDuplicate(job) {
		const entry = Idempotency.lookup(state, policy, job.idempotencyKey);
		if (!entry) {
			Idempotency.trackInflight(state, policy, job.idempotencyKey, job);
			return null;
		}
		if (entry.status === "done") {
			return entry.ok
				? Promise.resolve(entry.result)
				: Promise.reject(State.failure(
					entry.error.code,
					entry.error.message,
					entry.error.stack
				));
		}
		return new Promise((resolve, reject) => {
			entry.waiters.push({ resolve, reject });
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
			// Item 60: assign() guards child.send(); on a send race it returns
			// false after workerLost() rejected the job and retired the worker.
			Jobs.assign(state, worker, job, policy, events.expireRunning, onSendFailure);
		}
		Lifecycle.schedule(state, policy);
		// Item 33: observe saturation AFTER this pump's assignment attempt so
		// eager growth reacts to demand the lazy path could not serve.
		Capacity.noteSaturation(state, policy, () => Capacity.schedulePump(state, 25, pump));
	}

	/** Item 60: assignment-time send-race callback wired into assign(). */
	function onSendFailure(worker, error) {
		events.workerLost(worker, error);
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
		// Item 33: eager growth bypasses the not-ready guard so saturation can
		// keep spawning (one pump at a time) while previous workers boot; the
		// effective ceiling still bounds it.
		const eager = state.eagerGrowth === true;
		if (!eager && (state.spawnTimer || state.workers.some(worker => !worker.ready))) return;
		const target = eager
			? Capacity.effectiveCeiling(state, policy)
			: Capacity.wanted(state, policy, requested);
		if (state.workers.length >= target) {
			if (eager) state.eagerGrowth = false;
			return;
		}
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

	events = WorkerEvents.create({ state, policy, pump, expireQueued });
	const stats = () => State.stats(state, policy);
	const warm = () => Warm.start(ensureWorkers, stats, policy.MIN_WORKERS);
	const warmReady = value => Warm.untilReady(ensureWorkers, stats, state, policy, value);
	const cancel = (jobId, reason) => Cancel.cancel(state, policy, null, jobId, reason);
	const cancelForRequest = (requestId, reason) =>
		Cancel.cancelForRequest(state, policy, null, requestId, reason);
	return {
		cancel,
		cancelForRequest,
		execute,
		shutdown,
		state,
		stats,
		warm,
		warmReady
	};
}

module.exports = {
	createExecutor: createPool,
	createPool,
	failure: State.failure
};
