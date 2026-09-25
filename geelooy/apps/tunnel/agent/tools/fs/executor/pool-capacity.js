// B"H
// Boruch Hashem
// Blessed is He

const Circuit = require("./family-circuit.js");
const Queue = require("./pool-queue.js");
const Worker = require("./worker.js");
const State = require("./pool-state.js");

/**
 * @file Expands and retires filesystem workers within the machine-safe envelope.
 * @description
 * The Awtsmoos expands only under pressure and retreats without losing fairness.
 *
 * Item 33 — runtime cap tuning: the pool keeps an adaptive effective cap
 * state.dynamicCap inside [MIN_WORKERS, boot WORKERS]. Saturation (queue > 0
 * while every ready worker is busy for SATURATION_PUMPS consecutive pumps, or
 * the oldest queued job waiting past half its queue-start timeout) grows the
 * cap by one and spawns eagerly instead of waiting for queue-start timeouts to
 * bite. Growth is gated on the saturating family's circuit being closed, so a
 * poisoned workload that freezes workers cannot churn processes. Idle decay
 * back toward MIN_WORKERS reuses the pool-lifecycle trim path. The boot
 * WORKERS value (machine-derived) is never exceeded: this tunes within the
 * safe envelope, never beyond it.
 */
function wanted(state, policy, requested) {
	const ceiling = effectiveCeiling(state, policy);
	if (Number.isFinite(requested)) {
		return Math.max(policy.MIN_WORKERS, Math.min(ceiling, requested));
	}
	const busy = state.workers.filter(worker => worker.busy).length;
	return Math.min(
		ceiling,
		Math.max(policy.MIN_WORKERS, busy + state.queue.length)
	);
}

/** The adaptive effective cap; falls back to the boot ceiling when unset. */
function effectiveCeiling(state, policy) {
	const cap = Number(state.dynamicCap) || 0;
	if (cap > 0) return Math.max(policy.MIN_WORKERS, Math.min(policy.WORKERS, cap));
	return policy.WORKERS;
}

/**
 * Observes one pump for saturation and grows the effective cap when the
 * signal sustains. Returns true when the cap grew (the caller should re-pump
 * soon so eager growth continues while the queue still waits).
 */
function noteSaturation(state, policy, repump) {
	if (state.stopped) return false;
	const busy = state.workers.filter(worker => worker.busy && !worker.retiring).length;
	const idleReady = state.workers.filter(
		worker => worker.ready && !worker.busy && !worker.retiring
	).length;
	const queued = state.queue.length;
	let saturated = queued > 0 && idleReady === 0 && busy > 0;
	if (!saturated && queued > 0) {
		const oldest = oldestQueued(state);
		if (oldest) {
			const timeoutMs = Queue.timeoutFor(oldest, policy);
			saturated = Date.now() - oldest.queuedAt > timeoutMs / 2;
		}
	}
	if (!saturated) {
		state.saturatedPumps = 0;
		return false;
	}
	state.saturatedPumps = Number(state.saturatedPumps || 0) + 1;
	const pumpsNeeded = Math.max(1, Number(policy.SATURATION_PUMPS) || 3);
	if (state.saturatedPumps < pumpsNeeded) return false;
	const grew = growCap(state, policy);
	if (grew && typeof repump === "function") repump();
	return grew;
}

function growCap(state, policy) {
	const ceiling = policy.WORKERS;
	const floor = policy.MIN_WORKERS;
	const cap = effectiveCeiling(state, policy);
	if (cap >= ceiling) {
		state.saturatedPumps = 0;
		return false;
	}
	// Never expand into a poisoned workload: the saturating family's circuit
	// must be closed, otherwise new vessels would just freeze again.
	const oldest = oldestQueued(state);
	if (oldest && !Circuit.gate(state, oldest.payload, policy).ok) {
		state.saturatedPumps = 0;
		return false;
	}
	state.dynamicCap = Math.min(ceiling, Math.max(floor, cap + 1));
	state.saturatedPumps = 0;
	state.eagerGrowth = true;
	return true;
}

/** Idle decay: the effective cap follows the trim target back toward MIN_WORKERS. */
function decayCap(state, policy) {
	state.dynamicCap = policy.MIN_WORKERS;
	state.eagerGrowth = false;
	state.saturatedPumps = 0;
}

function oldestQueued(state) {
	let oldest = null;
	for (const job of state.queue) {
		if (!oldest || job.queuedAt < oldest.queuedAt) oldest = job;
	}
	return oldest;
}

function spawn(state, policy, callbacks) {
	const worker = Worker.spawn(callbacks.complete, callbacks.exited, {
		maxOldSpaceMb: policy.CHILD_MAX_OLD_SPACE_MB
	});
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
	decayCap,
	effectiveCeiling,
	growCap,
	markReady,
	noteSaturation,
	recordBootFailure,
	remove,
	retryDelay,
	schedulePump,
	spawn,
	stop,
	wanted
};
