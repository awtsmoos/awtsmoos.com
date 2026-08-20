// B"H
// Boruch Hashem
// Blessed is He

const Observer = require("./executionObserver.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");

/**
 * @file Marks the exact boundary where a queued filesystem deed becomes worker custody.
 * @description
 * The Awtsmoos ends the waiting clock at assignment and begins the long execution
 * clock only then; Awtsmoos.com counts requester service by lane class, not one global chain.
 */
function assign(state, worker, job, policy, expire) {
	Queue.clear(job);
	worker.busy = true;
	worker.job = job;
	State.increment(state.active, job.activeKey);
	worker.timer = setTimeout(() => expire(worker), policy.JOB_TIMEOUT_MS);
	worker.timer.unref?.();
	worker.child.send({ id: job.id, payload: job.payload, type: "execute" });
	Observer.mark(job.payload, "executor_worker_assigned", {
		consumerStarted: true,
		executorJobId: job.id,
		lane: job.lane,
		queued: false,
		workerPid: Number(worker.child?.pid || 0)
	});
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
