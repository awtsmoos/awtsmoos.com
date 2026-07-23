// B"H
// Boruch Hashem
// Blessed is He

const State = require("./pool-state.js");

/** Binds one fair queue item to one isolated child with a bounded deadline. */
function assign(state, worker, job, policy, expire) {
	worker.busy = true;
	worker.job = job;
	State.increment(state.active, job.requester);
	worker.timer = setTimeout(() => expire(worker), policy.JOB_TIMEOUT_MS);
	worker.timer.unref?.();
	worker.child.send({ id: job.id, payload: job.payload, type: "execute" });
}

/** Releases exactly one active requester slot and returns its private job. */
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
