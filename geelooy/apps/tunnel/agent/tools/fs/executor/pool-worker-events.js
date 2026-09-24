// B"H
// Boruch Hashem
// Blessed is He

const Cancel = require("./pool-cancel.js");
const Capacity = require("./pool-capacity.js");
const Circuit = require("./family-circuit.js");
const Jobs = require("./pool-jobs.js");
const Observer = require("./executionObserver.js");
const Retry = require("./pool-retry.js");
const State = require("./pool-state.js");

/**
 * @file Owns worker transitions and attributes destructive failure to one action family.
 * @description
 * The Awtsmoos distinguishes a returned error from a shattered vessel. Awtsmoos.com
 * clears family suspicion whenever a child answers, while death or timeout retires the
 * exact worker before another deed can accidentally enter a vessel already leaving.
 *
 * Every terminal job outcome marks exactly one telemetry event (item 63, feeds
 * items 48/51): executor_completed on success, executor_failed on failure, so
 * stall forensics can account for each job's duration and lane.
 */
function create({ state, policy, pump, expireQueued }) {
	const retryHooks = {
		expireQueued: typeof expireQueued === "function" ? expireQueued : () => {},
		pump
	};

	function complete(worker, message) {
		if (message?.type === "ready") {
			Capacity.markReady(state, worker);
			pump();
			return;
		}

		// Item 36: throttled slow-operation progress marks. The child may emit
		// { type: "progress", id, phase, done, total } between batches; the
		// parent keeps at most one mark per job per second so a chatty child
		// cannot flood IPC or the observer.
		if (message?.type === "progress") {
			onProgress(worker, message);
			return;
		}

		if (!worker.job || message?.id !== worker.job.id) return;
		const job = worker.job;

		// Item 34: a terminal reply for a cancel-requested job always settles
		// as cancelled; the child cooperated, so the worker lives on.
		if (job.cancelRequested) {
			Cancel.settleCooperative(state, worker, job, pump);
			return;
		}

		Circuit.recordHealthy(state, job.payload);
		const durationMs = jobDurationMs(job);
		const workerPid = pidOf(worker);

		if (message.ok) {
			// Item 61: per-job output-size ceiling. A result larger than the
			// policy bound rejects with FS_EXECUTOR_OUTPUT_TOO_LARGE instead of
			// letting unbounded accumulation through; the worker survives.
			const maxBytes = Math.max(1024 * 1024, Number(policy.MAX_JOB_RESULT_BYTES) || 64 * 1024 * 1024);
			if (resultBytes(message.result) > maxBytes) {
				const released = Jobs.release(state, worker);
				markTerminal(released, "executor_failed", {
					code: "FS_EXECUTOR_OUTPUT_TOO_LARGE",
					durationMs,
					workerPid
				});
				released.reject(State.failure(
					"FS_EXECUTOR_OUTPUT_TOO_LARGE",
					"fs_executor_output_too_large"
				));
				pump();
				return;
			}
			State.trackOwners(state, worker, job.payload, message.result);
		}

		const released = Jobs.release(state, worker);
		if (message.ok) {
			markTerminal(released, "executor_completed", { durationMs, workerPid });
			released.resolve(message.result);
		} else {
			markTerminal(released, "executor_failed", {
				code: String(message.code || "FS_EXECUTOR_ACTION_FAILED"),
				durationMs,
				workerPid
			});
			released.reject(State.failure(
				message.code,
				message.error,
				message.stack,
				message.filesystem
			));
		}
		pump();
	}

	function onProgress(worker, message) {
		const job = worker.job;
		if (!job || message?.id !== job.id || job.settled || job.cancelRequested) return;
		const now = Date.now();
		if (job.lastProgressAt && now - job.lastProgressAt < 1000) return;
		job.lastProgressAt = now;
		const detail = {
			consumerStarted: true,
			executorJobId: job.id,
			lane: job.lane,
			phase: String(message.phase || ""),
			done: Number(message.done || 0),
			total: Number(message.total || 0),
			queued: false
		};
		Observer.mark(job.payload, "executor_progress", detail);
		// Priority.decorate spreads caller metadata onto job.metadata, so an
		// optional onProgress callback travels there (never to the child).
		const onProgress = job.metadata && job.metadata.onProgress;
		if (typeof onProgress === "function") {
			try {
				onProgress({ phase: detail.phase, done: detail.done, total: detail.total });
			} catch {
				// A throwing progress callback must not break the worker loop.
			}
		}
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
			clearTimeout(job.cancelTimer);
			job.cancelTimer = null;
			if (job.cancelRequested) {
				markTerminal(job, "executor_cancelled", {
					reason: job.cancelReason || "cancelled",
					workerPid: pidOf(worker)
				});
				job.settled = true;
				job.reject(State.failure("FS_EXECUTOR_CANCELLED", "fs_executor_cancelled"));
			} else if (!Retry.requeue(state, policy, job, "FS_EXECUTOR_EXITED", retryHooks)) {
				markTerminal(job, "executor_failed", {
					code: "FS_EXECUTOR_EXITED",
					durationMs: jobDurationMs(job),
					workerPid: pidOf(worker)
				});
				job.reject(State.failure(
					"FS_EXECUTOR_EXITED",
					`fs_executor_exited:${code ?? signal}`
				));
			}
		}

		if (!planned && needsCapacity()) {
			const delay = wasReady ? 0 : Capacity.retryDelay(state, policy);
			Capacity.schedulePump(state, delay, pump);
		}
	}

	/**
	 * Item 60: assignment-time IPC send race. The child died between the pump
	 * scan and child.send(), so send() threw ERR_IPC_CHANNEL_CLOSED
	 * synchronously. This handles it exactly like a worker exit — clean
	 * FS_EXECUTOR_WORKER_LOST rejection plus respawn — with one deliberate
	 * difference: the failure is NOT attributed to the action family, because
	 * the crash predates this job's execution (it may have been caused by the
	 * previous job or by a spontaneous idle death). The worker is marked
	 * retiring so the real "exit" event arriving later is treated as planned.
	 */
	function workerLost(worker, error) {
		worker.retiring = true;
		const job = Jobs.release(state, worker);
		Capacity.remove(state, worker);
		if (job) {
			clearTimeout(job.cancelTimer);
			job.cancelTimer = null;
			markTerminal(job, "executor_failed", {
				code: "FS_EXECUTOR_WORKER_LOST",
				durationMs: jobDurationMs(job),
				workerPid: pidOf(worker)
			});
			job.reject(State.failure(
				"FS_EXECUTOR_WORKER_LOST",
				`fs_executor_worker_lost:${(error && error.code) || "ipc_send_failed"}`
			));
		}
		if (needsCapacity()) Capacity.schedulePump(state, 0, pump);
	}

	function bootExpired(worker) {
		if (worker.ready || !state.workers.includes(worker)) return;
		worker.bootTimedOut = true;
		Capacity.recordBootFailure(state, worker);
		Capacity.stop(worker);
	}

	function expireRunning(worker) {
		if (!worker.job) return;
		const job = worker.job;
		Circuit.recordFailure(state, job.payload, "FS_EXECUTOR_TIMEOUT", policy);
		worker.retiring = true;
		const released = Jobs.release(state, worker);
		Capacity.remove(state, worker);
		if (!Retry.requeue(state, policy, released, "FS_EXECUTOR_TIMEOUT", retryHooks)) {
			markTerminal(released, "executor_failed", {
				code: "FS_EXECUTOR_TIMEOUT",
				durationMs: jobDurationMs(released),
				workerPid: pidOf(worker)
			});
			released.reject(State.failure(
				"FS_EXECUTOR_TIMEOUT",
				"fs_executor_action_timed_out"
			));
		}
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
		expireRunning,
		workerLost
	};
}

function markTerminal(job, phase, details) {
	Observer.mark(job.payload, phase, {
		consumerStarted: true,
		executorJobId: job.id,
		lane: job.lane,
		queued: false,
		...details
	});
}

function jobDurationMs(job) {
	const startedAt = job.assignedAt || job.queuedAt || Date.now();
	return Math.max(0, Date.now() - startedAt);
}

function pidOf(worker) {
	return Number(worker && worker.child && worker.child.pid ? worker.child.pid : 0);
}

function resultBytes(result) {
	try {
		const text = JSON.stringify(result);
		return text == null ? 0 : Buffer.byteLength(text);
	} catch {
		return 0;
	}
}

module.exports = { create };
