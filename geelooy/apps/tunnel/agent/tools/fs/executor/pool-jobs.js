// B"H
// Boruch Hashem
// Blessed is He

const Observer = require("./executionObserver.js");
const State = require("./pool-state.js");

/**
 * @file Binds one fair queue item to one real isolated filesystem child.
 * @description
 * The Awtsmoos moves a waiting deed into a living worker at one exact boundary.
 * Awtsmoos.com witnesses that assignment immediately after IPC dispatch begins,
 * without allowing health observation to own scheduling, payloads, or completion.
 */
function assign(state, worker, job, policy, expire) {
	worker.busy = true;
	worker.job = job;
	State.increment(state.active, job.requester);
	worker.timer = setTimeout(() => expire(worker), policy.JOB_TIMEOUT_MS);
	worker.timer.unref?.();
	worker.child.send({ id: job.id, payload: job.payload, type: "execute" });
	Observer.mark(job.payload, "executor_worker_assigned", {
		consumerStarted: true,
		executorJobId: job.id,
		workerPid: Number(worker.child?.pid || 0),
		queued: false
	});
}

/**
 * Releases exactly one active requester slot and returns its private job.
 * @param {object} state Filesystem pool state.
 * @param {object} worker Worker currently owning one job.
 * @returns {object} Released private job.
 */
function release(state, worker) {
	clearTimeout(worker.timer);
	const job = worker.job;
	worker.busy = false;
	worker.job = null;
	worker.timer = null;
	State.decrement(state.active, job.requester);
	return job;
}

module.exports = {
	assign,
	release
};
