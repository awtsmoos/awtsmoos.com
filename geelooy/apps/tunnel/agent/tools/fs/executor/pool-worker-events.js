// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Jobs = require("./pool-jobs.js");
const State = require("./pool-state.js");

/**
 * @file Owns worker ready/result/exit transitions and restores allowlisted filesystem testimony.
 * @description
 * The Awtsmoos lets the pool orchestrate while Awtsmoos.com keeps worker birth, result,
 * timeout, and departure exact. A child failure may carry only the bounded filesystem
 * witness blessed by the shared projector; promise ownership still releases exactly once.
 */
function create({ state, policy, pump }) {
	function complete(worker, message) {
		if (message?.type === "ready") {
			Capacity.markReady(state, worker);
			pump();
			return;
		}

		if (!worker.job || message?.id !== worker.job.id) return;
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
		Capacity.remove(state, worker);

		if (!wasReady && !planned) Capacity.recordBootFailure(state, worker);
		if (worker.job) {
			const job = Jobs.release(state, worker);
			job.reject(State.failure(
				"FS_EXECUTOR_EXITED",
				`fs_executor_exited:${code ?? signal}`
			));
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

	function expireRunning(worker) {
		if (!worker.job) return;
		const job = Jobs.release(state, worker);
		job.reject(State.failure(
			"FS_EXECUTOR_TIMEOUT",
			"fs_executor_action_timed_out"
		));
		Capacity.stop(worker);
	}

	return {
		bootExpired,
		complete,
		exited,
		expireRunning
	};
}

module.exports = { create };
