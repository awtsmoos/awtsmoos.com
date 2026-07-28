// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Jobs = require("./pool-jobs.js");
const Lifecycle = require("./pool-lifecycle.js");
const Policy = require("./policy.js");
const State = require("./pool-state.js");

/** Creates a bounded, requester-fair pool of isolated filesystem executors. */
function createPool(options = {}) {
	const policy = Policy.resolve(options);
	const state = State.create();

	function execute(payload = {}) {
		if (state.stopped) {
			return Promise.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
		}
		if (state.queue.length >= policy.MAX_QUEUE) {
			return Promise.reject(State.failure("FS_EXECUTOR_BACKPRESSURE", "fs_executor_queue_full"));
		}
		return new Promise((resolve, reject) => {
			state.queue.push(State.createJob(payload, resolve, reject));
			pump();
		});
	}

	function pump() {
		if (state.stopped) return;
		Lifecycle.touch(state);
		ensureWorkers();
		for (const worker of state.workers) {
			if (worker.busy || !worker.ready) continue;
			const index = State.eligibleIndex(
				state,
				policy.MAX_PER_REQUESTER,
				worker
			);
			if (index < 0) continue;
			Jobs.assign(state, worker, state.queue.splice(index, 1)[0], policy, expire);
		}
		Lifecycle.schedule(state, policy);
	}

	function complete(worker, message) {
		if (message?.type === "ready") {
			Capacity.markReady(state, worker);
			pump();
			return;
		}
		if (!worker.job || message?.id !== worker.job.id) return;
		if (message.ok) State.trackOwners(state, worker, worker.job.payload, message.result);
		const job = Jobs.release(state, worker);
		if (message.ok) job.resolve(message.result);
		else job.reject(State.failure(message.code, message.error, message.stack));
		pump();
	}

	function exited(worker, code, signal) {
		const wasReady = worker.ready;
		const planned = worker.retiring === true;
		Capacity.remove(state, worker);
		if (!wasReady && !planned) Capacity.recordBootFailure(state, worker);
		if (worker.job) {
			const job = Jobs.release(state, worker);
			job.reject(State.failure("FS_EXECUTOR_EXITED", `fs_executor_exited:${code ?? signal}`));
		}
		if (!planned && (state.queue.length || state.workers.length < policy.MIN_WORKERS)) {
			const delay = wasReady ? 0 : Capacity.retryDelay(state, policy);
			Capacity.schedulePump(state, delay, pump);
		}
	}

	function bootExpired(worker) {
		if (worker.ready || !state.workers.includes(worker)) return;
		worker.bootTimedOut = true;
		Capacity.recordBootFailure(state, worker);
		Capacity.stop(worker);
	}

	function expire(worker) {
		if (!worker.job) return;
		const job = Jobs.release(state, worker);
		job.reject(State.failure("FS_EXECUTOR_TIMEOUT", "fs_executor_action_timed_out"));
		Capacity.stop(worker);
	}

	function ensureWorkers(requested) {
		if (state.spawnTimer) return;
		const target = Capacity.wanted(state, policy, requested);
		while (state.workers.length < target) {
			Capacity.spawn(state, policy, { bootExpired, complete, exited });
		}
	}

	const stats = () => State.stats(state, policy);
	function warm() {
		ensureWorkers(policy.MIN_WORKERS);
		return stats();
	}

	return {
		execute,
		shutdown: () => Lifecycle.shutdown(state),
		state,
		stats,
		warm
	};
}

module.exports = {
	createPool,
	eligibleIndex: State.eligibleIndex,
	failure: State.failure
};
