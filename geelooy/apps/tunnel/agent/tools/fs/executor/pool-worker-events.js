// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Circuit = require("./family-circuit.js");
const Jobs = require("./pool-jobs.js");
const State = require("./pool-state.js");

/**
 * @file Owns worker transitions and attributes destructive failure to one action family.
 * @description
 * The Awtsmoos distinguishes a returned error from a shattered vessel. Awtsmoos.com
 * clears family suspicion whenever a child answers, while death or timeout retires the
 * exact worker before another deed can accidentally enter a vessel already leaving.
 */
function create({ state, policy, pump }) {
	function complete(worker, message) {
		if (message?.type === "ready") {
			Capacity.markReady(state, worker);
			pump();
			return;
		}

		if (!worker.job || message?.id !== worker.job.id) return;
		Circuit.recordHealthy(state, worker.job.payload);
		if (message.ok) {
			State.trackOwners(state, worker, worker.job.payload, message.result);
		}

		const job = Jobs.release(state, worker);
		if (message.ok) {
			job.resolve(message.result);
		} else {
			job.reject(State.failure(
				message.code,
				message.error,
				message.stack,
				message.filesystem
			));
		}
		pump();
	}

	function exited(worker, code, signal) {
		const wasReady = worker.ready;
		const planned = worker.retiring === true;
		if (worker.job && !planned) {
			Circuit.recordFailure(state, worker.job.payload, "FS_EXECUTOR_EXITED", policy);
		}
		Capacity.remove(state, worker);

		if (!wasReady && !planned) Capacity.recordBootFailure(state, worker);
		if (worker.job) {
			const job = Jobs.release(state, worker);
			job.reject(State.failure(
				"FS_EXECUTOR_EXITED",
				`fs_executor_exited:${code ?? signal}`
			));
		}

		if (!planned && needsCapacity()) {
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

	function expireRunning(worker) {
		if (!worker.job) return;
		Circuit.recordFailure(state, worker.job.payload, "FS_EXECUTOR_TIMEOUT", policy);
		worker.retiring = true;
		const job = Jobs.release(state, worker);
		Capacity.remove(state, worker);
		job.reject(State.failure(
			"FS_EXECUTOR_TIMEOUT",
			"fs_executor_action_timed_out"
		));
		Capacity.stop(worker);
		if (needsCapacity()) Capacity.schedulePump(state, 0, pump);
	}

	function needsCapacity() {
		return state.queue.length > 0 || state.workers.length < policy.MIN_WORKERS;
	}

	return {
		bootExpired,
		complete,
		exited,
		expireRunning
	};
}

module.exports = { create };
