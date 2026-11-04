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
 * Iteration 7 scopes transient (soft) circuits per strategy: a lane whose
 * text surface is deterministically broken once tripped the shared circuit
 * and blocked its own healthy vector answers for the whole cooldown. Hard
 * failures stay lane-wide, because a dead embedder worker starves every
 * strategy alike. A shared embedder that is still warming is not a lane
 * failure at all — the lane is innocent, and counting warmup against it
 * kept every circuit open past the moment the worker became ready.
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
const NON_LANE_FAULT_CODES = new Set([
	'MULTILINGUAL_WORKER_WARMING'
]);
const CLONE_FAILURE_PATTERN = /could not be cloned|DataCloneError/i;
const HARD_COOLDOWN_MS = 60000;
const SOFT_COOLDOWN_MS = 30000;
const SOFT_FAILURE_THRESHOLD = 3;
const DEFAULT_SCOPE = 'default';

const lanes = new Map();

/** Classifies failures that cannot heal between two adjacent queries. */
function isHardFailure(error) {
	if (!error) return false;
	if (HARD_FAILURE_CODES.has(error.code)) return true;
	return CLONE_FAILURE_PATTERN.test(String(error.message || ''));
}

/** Classifies failures that belong to a shared service, never to the lane. */
function isNonLaneFault(error) {
	if (!error) return false;
	return NON_LANE_FAULT_CODES.has(error.code);
}

/** Returns or creates the mutable circuit state for one lane. */
function laneState(laneId) {
	let state = lanes.get(laneId);
	if (!state) {
		state = { softScopes: new Map() };
		lanes.set(laneId, state);
	}
	return state;
}

/** Builds the open-circuit testimony for a lane from its recorded failure. */
function blockFor(laneId, state) {
	return {
		code: 'LANE_CIRCUIT_OPEN',
		message: `Lane ${laneId} is paused after a recent failure (${state.lastError?.code || 'error'}: ${state.lastError?.message || 'unknown'}). Retrying automatically after a short cooldown.`
	};
}

/**
 * Returns the open-circuit testimony for a lane, or null when it may run.
 * A hard failure blocks every scope; a soft failure blocks only its own
 * strategy scope. Without a scope, any open circuit blocks (legacy callers).
 */
function laneBlock(laneId, scope, now = Date.now()) {
	const state = lanes.get(laneId);
	if (!state) return null;
	if ((state.hardUntil || 0) > now) return blockFor(laneId, state);
	const scopes = scope
		? [state.softScopes.get(scope)]
		: [...state.softScopes.values()];
	if (scopes.some(entry => (entry?.until || 0) > now)) return blockFor(laneId, state);
	return null;
}

/**
 * Records one lane failure and opens the circuit when the evidence warrants.
 * Hard failures open the lane-wide circuit and clear scoped counts; soft
 * failures count only inside their strategy scope. Shared-service warmup
 * is not recorded at all.
 */
function recordLaneFailure(laneId, error, now = Date.now(), scope = DEFAULT_SCOPE) {
	if (isNonLaneFault(error)) return lanes.get(laneId) || null;
	const state = laneState(laneId);
	state.lastError = {
		code: error?.code || 'LANE_FAILED',
		message: String(error?.message || error || 'Lane search failed.')
	};
	if (isHardFailure(error)) {
		state.hardUntil = now + HARD_COOLDOWN_MS;
		state.softScopes.clear();
	} else {
		const key = scope || DEFAULT_SCOPE;
		const entry = state.softScopes.get(key) || { failures: 0, until: 0 };
		entry.failures += 1;
		if (entry.failures >= SOFT_FAILURE_THRESHOLD) {
			entry.until = now + SOFT_COOLDOWN_MS;
			entry.failures = 0;
		}
		state.softScopes.set(key, entry);
	}
	return state;
}

/**
 * A success closes the circuit it proved healthy: with a scope, only that
 * scope's soft count clears (a hard circuit still needs its cooldown or a
 * scopeless success); without a scope, the lane's whole circuit clears.
 */
function recordLaneSuccess(laneId, scope) {
	if (!scope) {
		lanes.delete(laneId);
		return;
	}
	const state = lanes.get(laneId);
	if (!state) return;
	state.softScopes.delete(scope);
	if (!state.hardUntil && !state.softScopes.size) lanes.delete(laneId);
}

function clearLaneCircuitBreaker() {
	lanes.clear();
}

module.exports = {
	HARD_COOLDOWN_MS,
	HARD_FAILURE_CODES,
	NON_LANE_FAULT_CODES,
	SOFT_COOLDOWN_MS,
	SOFT_FAILURE_THRESHOLD,
	clearLaneCircuitBreaker,
	isHardFailure,
	isNonLaneFault,
	laneBlock,
	recordLaneFailure,
	recordLaneSuccess
};
