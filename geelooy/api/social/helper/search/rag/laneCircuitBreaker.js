// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LaneCircuitBreaker
 * @description
 * The Awtsmoos does not ask a known-broken vessel to pour again on every
 * question. A lane that just failed with a deterministic runtime error
 * (missing embedder runtime, worker death, un-clonable result) is skipped
 * for a cooldown and reported honestly in laneErrors as circuit-open;
 * transient failures must repeat before they open the circuit. After the
 * cooldown the lane is tried again, so healing is discovered automatically.
 */

const HARD_FAILURE_CODES = new Set([
	'BGE_MODEL_MISSING',
	'BGE_RUNTIME_MISSING',
	'BGE_WORKER_EXITED',
	'BGE_WORKER_FATAL',
	'EMBEDDER_UNAVAILABLE',
	'MULTILINGUAL_RUNTIME_MISSING',
	'MULTILINGUAL_WORKER_EXITED'
]);
const CLONE_FAILURE_PATTERN = /could not be cloned|DataCloneError/i;
const HARD_COOLDOWN_MS = 60000;
const SOFT_COOLDOWN_MS = 30000;
const SOFT_FAILURE_THRESHOLD = 3;

const lanes = new Map();

/** Classifies failures that cannot heal between two adjacent queries. */
function isHardFailure(error) {
	if (!error) return false;
	if (HARD_FAILURE_CODES.has(error.code)) return true;
	return CLONE_FAILURE_PATTERN.test(String(error.message || ''));
}

/** Returns the open-circuit testimony for a lane, or null when it may run. */
function laneBlock(laneId, now = Date.now()) {
	const state = lanes.get(laneId);
	if (!state) return null;
	const openUntil = Math.max(state.hardUntil || 0, state.softUntil || 0);
	if (openUntil <= now) return null;
	return {
		code: 'LANE_CIRCUIT_OPEN',
		message: `Lane ${laneId} is paused after a recent failure (${state.lastError?.code || 'error'}: ${state.lastError?.message || 'unknown'}). Retrying automatically after a short cooldown.`
	};
}

/** Records one lane failure and opens the circuit when the evidence warrants. */
function recordLaneFailure(laneId, error, now = Date.now()) {
	const state = lanes.get(laneId) || { softFailures: 0 };
	state.lastError = {
		code: error?.code || 'LANE_FAILED',
		message: String(error?.message || error || 'Lane search failed.')
	};
	if (isHardFailure(error)) {
		state.hardUntil = now + HARD_COOLDOWN_MS;
		state.softFailures = 0;
	} else {
		state.softFailures = (state.softFailures || 0) + 1;
		if (state.softFailures >= SOFT_FAILURE_THRESHOLD) {
			state.softUntil = now + SOFT_COOLDOWN_MS;
			state.softFailures = 0;
		}
	}
	lanes.set(laneId, state);
	return state;
}

/** A success fully closes the lane's circuit and clears its failure count. */
function recordLaneSuccess(laneId) {
	lanes.delete(laneId);
}

function clearLaneCircuitBreaker() {
	lanes.clear();
}

module.exports = {
	HARD_COOLDOWN_MS,
	HARD_FAILURE_CODES,
	SOFT_COOLDOWN_MS,
	SOFT_FAILURE_THRESHOLD,
	clearLaneCircuitBreaker,
	isHardFailure,
	laneBlock,
	recordLaneFailure,
	recordLaneSuccess
};
