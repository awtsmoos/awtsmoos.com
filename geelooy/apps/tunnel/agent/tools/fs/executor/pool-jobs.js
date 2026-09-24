// B"H
// Boruch Hashem
// Blessed is He

const Observer = require("./executionObserver.js");
const Policy = require("./policy.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");

/**
 * @file Marks the exact boundary where a queued filesystem deed becomes worker custody.
 * @description
 * The Awtsmoos ends the waiting clock at assignment and begins the long execution
 * clock only then; Awtsmoos.com counts requester service by lane class, not one global chain.
 *
 * Item 60 — guarded assignment send: if the child's IPC channel died between the
 * pump scan and child.send() (a spontaneous idle crash whose "exit" event has not
 * been processed yet), send() throws ERR_IPC_CHANNEL_CLOSED synchronously. Without
 * the guard that throw escapes pump() — which runs inside the execute() Promise
 * executor — so the caller receives a raw IPC error, the job is already dequeued,
 * and the "busy" worker lingers until its running timer fires. With the guard the
 * failure is routed to onSendFailure, which treats it exactly like a worker exit:
 * the job is rejected with a clean FS_EXECUTOR_WORKER_LOST and the pool respawns.
 */
function assign(state, worker, job, policy, expire, onSendFailure) {
	Queue.clear(job);
	worker.busy = true;
	worker.job = job;
	job.assignedAt = Date.now();
	State.increment(state.active, job.activeKey);
	worker.timer = setTimeout(() => expire(worker), Policy.runningTimeoutMs(policy, job.lane));
	worker.timer.unref?.();
	try {
		worker.child.send({ id: job.id, payload: job.payload, type: "execute" });
	} catch (error) {
		if (typeof onSendFailure === "function") {
			onSendFailure(worker, error);
		} else {
			// Defensive fallback (pool.js always wires onSendFailure): retire
			// the worker and reject cleanly rather than mislabeling this as
			// a running timeout.
			worker.retiring = true;
			const failed = release(state, worker);
			if (failed) {
				failed.reject(State.failure(
					"FS_EXECUTOR_WORKER_LOST",
					"fs_executor_worker_lost"
				));
			}
		}
		return false;
	}
	Observer.mark(job.payload, "executor_worker_assigned", {
		consumerStarted: true,
		executorJobId: job.id,
		lane: job.lane,
		queued: false,
		workerPid: Number(worker.child?.pid || 0)
	});
	return true;
}

/** Releases exactly one lane-class requester slot and returns its private job. */
function release(state, worker) {
	clearTimeout(worker.timer);
	const job = worker.job;
	worker.busy = false;
	worker.job = null;
	worker.timer = null;
	if (job) State.decrement(state.active, job.activeKey);
	return job;
}

module.exports = {
	assign,
	release
};
