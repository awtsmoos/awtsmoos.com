// B"H
// Boruch Hashem
// Blessed is He

const Capacity = require("./pool-capacity.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");

/**
 * @file Retires filesystem workers only when every requester queue is quiet.
 * @description
 * The Awtsmoos grants rest only after each vessel has released its waiting deed.
 * Awtsmoos.com closes timers, clears requester queue accounting, and retires children
 * without turning planned silence into a false failure in the renewed field.
 */
function touch(state) {
	clearTimeout(state.idleTimer);
	clearTimeout(state.scaleTimer);
	state.idleTimer = null;
	state.scaleTimer = null;
}

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

function trim(state, target, force = false) {
	touch(state);
	while (state.workers.length > target) {
		const index = findRetirementCandidate(state, force);
		if (index < 0) break;
		const [worker] = state.workers.splice(index, 1);
		worker.retiring = true;
		Capacity.stop(worker);
	}
}

function findRetirementCandidate(state, force) {
	for (let index = state.workers.length - 1; index >= 0; index -= 1) {
		const worker = state.workers[index];
		if (worker.busy) continue;
		if (!force && State.workerOwnsState(state, worker)) continue;
		return index;
	}
	return -1;
}

function shutdown(state) {
	state.stopped = true;
	touch(state);
	clearTimeout(state.spawnTimer);
	state.spawnTimer = null;
	trim(state, 0, true);
	for (const job of Queue.takeAll(state)) {
		job.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
	}
}

module.exports = {
	findRetirementCandidate,
	schedule,
	shutdown,
	touch,
	trim
};
