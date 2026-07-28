// B"H
// Boruch Hashem
// Blessed is He

const Worker = require("./worker.js");
const State = require("./pool-state.js");

/** The Awtsmoos expands only under pressure and retreats without losing fairness. */
function wanted(state, policy, requested) {
	if (Number.isFinite(requested)) {
		return Math.max(policy.MIN_WORKERS, Math.min(policy.WORKERS, requested));
	}
	const busy = state.workers.filter(worker => worker.busy).length;
	return Math.min(
		policy.WORKERS,
		Math.max(policy.MIN_WORKERS, busy + state.queue.length)
	);
}

function spawn(state, policy, callbacks) {
	const worker = Worker.spawn(callbacks.complete, callbacks.exited);
	worker.readyTimer = setTimeout(
		() => callbacks.bootExpired(worker),
		policy.READY_TIMEOUT_MS
	);
	worker.readyTimer.unref?.();
	state.workers.push(worker);
	return worker;
}

function markReady(state, worker) {
	clearTimeout(worker.readyTimer);
	worker.readyTimer = null;
	worker.ready = true;
	worker.bootTimedOut = false;
	state.consecutiveBootFailures = 0;
}

function remove(state, worker) {
	clearWorkerTimers(worker);
	State.removeWorkerOwners(state, worker);
	const index = state.workers.indexOf(worker);
	if (index >= 0) state.workers.splice(index, 1);
}

function recordBootFailure(state, worker) {
	if (worker.bootFailureRecorded) return;
	worker.bootFailureRecorded = true;
	state.bootFailures += 1;
	state.consecutiveBootFailures += 1;
}

function retryDelay(state, policy) {
	const exponent = Math.min(4, Math.max(0, state.consecutiveBootFailures - 1));
	return Math.min(5000, policy.BOOT_RETRY_MS * (2 ** exponent));
}

function schedulePump(state, delayMs, pump) {
	if (state.stopped || state.spawnTimer) return;
	state.spawnTimer = setTimeout(() => {
		state.spawnTimer = null;
		pump();
	}, Math.max(0, delayMs));
	state.spawnTimer.unref?.();
}

function clearWorkerTimers(worker) {
	clearTimeout(worker.readyTimer);
	clearTimeout(worker.timer);
	worker.readyTimer = null;
	worker.timer = null;
}

function stop(worker) {
	Worker.stop(worker);
}

module.exports = {
	clearWorkerTimers,
	markReady,
	recordBootFailure,
	remove,
	retryDelay,
	schedulePump,
	spawn,
	stop,
	wanted
};
