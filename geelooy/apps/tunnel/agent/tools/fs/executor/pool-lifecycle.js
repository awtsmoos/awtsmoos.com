// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const State = require("./pool-state.js");

/** Cancels retirement clocks whenever new work reveals itself. */
function touch(state) {
	clearTimeout(state.idleTimer);
	clearTimeout(state.scaleTimer);
	state.idleTimer = null;
	state.scaleTimer = null;
}

/** Schedules memory release only after the queue and all workers are quiet. */
function schedule(state, policy) {
	if (state.queue.length || state.workers.some(worker => worker.busy)) return;
	if (state.workers.length > policy.MIN_WORKERS) {
		state.scaleTimer = setTimeout(
			() => trim(state, policy.MIN_WORKERS),
			policy.SCALE_DOWN_MS
		);
		state.scaleTimer.unref?.();
	}
	if (policy.IDLE_SHUTDOWN_MS <= 0) return;
	state.idleTimer = setTimeout(() => trim(state, 0), policy.IDLE_SHUTDOWN_MS);
	state.idleTimer.unref?.();
}

/** Retires excess children without treating planned exits as failures. */
function trim(state, target) {
	touch(state);
	while (state.workers.length > target) {
		const worker = state.workers.pop();
		worker.retiring = true;
		Capacity.stop(worker);
	}
}

/** Closes the pool permanently and rejects work that never began. */
function shutdown(state) {
	state.stopped = true;
	touch(state);
	clearTimeout(state.spawnTimer);
	state.spawnTimer = null;
	trim(state, 0);
	for (const job of state.queue.splice(0)) {
		job.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
	}
}

module.exports = {
	schedule,
	shutdown,
	touch,
	trim
};
