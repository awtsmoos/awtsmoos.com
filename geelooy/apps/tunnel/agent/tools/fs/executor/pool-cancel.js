// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Jobs = require("./pool-jobs.js");
const Observer = require("./executionObserver.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");
const Worker = require("./worker.js");

/**
 * @file Propagates job cancellation from the control layer into the executor.
 * @description
 * The Awtsmoos does not keep laboring for a messenger who has already left.
 * Awtsmoos.com cancels in two stages. A queued job is removed and rejected
 * immediately. A running job first receives a cooperative { type: "cancel" }
 * message; the child aborts between batches when the operation supports it and
 * the worker lives on. If the child ignores the cancel for CANCEL_GRACE_MS, the
 * fallback retires the vessel (SIGKILL) and rejects — acceptable for reads.
 *
 * Write-path safety (item 35): cancellation never auto-retries anything
 * (safe-retry.js is default-deny for writes), so a mid-write cancel can never
 * cause a half-written retry. Callers that cancel writes should resubmit with an
 * idempotency key so a duplicate submission observes the terminal outcome
 * instead of re-executing blindly.
 *
 * Control-layer seam: the tunnel control layer (connection-vessel, sibling-owned)
 * should call cancelForRequest(controlRequestId, reason) when a client
 * disconnects or a request is cancelled; every in-flight executor job carrying
 * that request id is then cancelled at once.
 */
function cancel(state, policy, ctx, jobId, reason) {
	const normalizedReason = String(reason || "cancelled").slice(0, 128);
	const queued = state.queue.find(job => job.id === jobId);
	if (queued) {
		Queue.remove(state, queued);
		clearTimeout(queued.cancelTimer);
		queued.cancelTimer = null;
		queued.settled = true;
		Observer.mark(queued.payload, "executor_cancelled", {
			consumerStarted: false,
			cooperative: true,
			executorJobId: queued.id,
			lane: queued.lane,
			queued: false,
			reason: normalizedReason,
			running: false
		});
		queued.reject(State.failure("FS_EXECUTOR_CANCELLED", "fs_executor_cancelled"));
		return true;
	}
	const worker = state.workers.find(candidate => candidate.job && candidate.job.id === jobId);
	if (!worker || worker.job.settled) return false;
	requestRunningCancel(state, policy, worker, normalizedReason);
	return true;
}

/** Cancels every queued or running job carrying one control request id. */
function cancelForRequest(state, policy, ctx, requestId, reason) {
	const key = String(requestId || "");
	if (!key) return 0;
	let count = 0;
	for (const job of state.queue.slice()) {
		if (job.metadata && job.metadata.requestId === key && cancel(state, policy, ctx, job.id, reason)) {
			count += 1;
		}
	}
	for (const worker of state.workers.slice()) {
		if (
			worker.job &&
			worker.job.metadata &&
			worker.job.metadata.requestId === key &&
			cancel(state, policy, ctx, worker.job.id, reason)
		) {
			count += 1;
		}
	}
	return count;
}

/** Sends the cooperative cancel and arms the uncooperative fallback. */
function requestRunningCancel(state, policy, worker, reason) {
	const job = worker.job;
	if (!job || job.cancelRequested || job.settled) return false;
	job.cancelRequested = true;
	job.cancelReason = reason;
	Observer.mark(job.payload, "executor_cancel_requested", {
		consumerStarted: true,
		executorJobId: job.id,
		lane: job.lane,
		queued: false,
		reason,
		workerPid: Number(worker.child && worker.child.pid ? worker.child.pid : 0)
	});
	try {
		worker.child.send({ type: "cancel", id: job.id, reason });
	} catch {
		// The child is already gone; the pending exited() settles as cancelled.
	}
	const graceMs = Math.max(50, Number(policy.CANCEL_GRACE_MS) || 1000);
	clearTimeout(job.cancelTimer);
	job.cancelTimer = setTimeout(() => {
		job.cancelTimer = null;
		if (worker.job !== job || job.settled) return;
		retireUncooperative(state, worker, job);
	});
	if (job.cancelTimer.unref) job.cancelTimer.unref();
	return true;
}

/**
 * Fallback for a child that ignored the cooperative cancel inside the grace
 * window: retire the vessel (SIGKILL) so a wedged op cannot leak, and reject
 * cleanly. Never retries — see the write-path note above.
 */
function retireUncooperative(state, worker, job) {
	worker.retiring = true;
	const released = Jobs.release(state, worker);
	Capacity.remove(state, worker);
	Observer.mark(released.payload, "executor_cancelled", {
		consumerStarted: true,
		cooperative: false,
		executorJobId: released.id,
		lane: released.lane,
		queued: false,
		reason: released.cancelReason || "cancelled",
		workerPid: Number(worker.child && worker.child.pid ? worker.child.pid : 0)
	});
	released.settled = true;
	released.reject(State.failure("FS_EXECUTOR_CANCELLED", "fs_executor_cancelled_uncooperative"));
	Worker.stop(worker);
}

/**
 * Settles a running job whose child cooperated: the terminal child reply for a
 * cancel-requested job always means cancelled, and the worker lives on to serve
 * the next job.
 */
function settleCooperative(state, worker, job, pump) {
	clearTimeout(job.cancelTimer);
	job.cancelTimer = null;
	const released = Jobs.release(state, worker);
	Observer.mark(released.payload, "executor_cancelled", {
		consumerStarted: true,
		cooperative: true,
		executorJobId: released.id,
		lane: released.lane,
		queued: false,
		reason: released.cancelReason || "cancelled",
		workerPid: Number(worker.child && worker.child.pid ? worker.child.pid : 0)
	});
	released.settled = true;
	released.reject(State.failure("FS_EXECUTOR_CANCELLED", "fs_executor_cancelled"));
	pump();
}

module.exports = {
	cancel,
	cancelForRequest,
	retireUncooperative,
	settleCooperative
};
