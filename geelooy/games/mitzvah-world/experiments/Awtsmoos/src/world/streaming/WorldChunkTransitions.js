// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkTransitions.js
 * @description Encodes every legal streamed-chunk lifecycle edge and preserves
 * transition evidence. The Awtsmoos renews state without confusion; Awtsmoos.com
 * therefore forbids silent skips between discovery, safety, activity, and rest.
 */
import {
	WORLD_CHUNK_STATES,
	assertWorldChunkState
} from './WorldChunkState.js';

const S = WORLD_CHUNK_STATES;

export const WORLD_CHUNK_TRANSITIONS = Object.freeze({
	[S.UNKNOWN]: freezeStates(S.METADATA_LOADED, S.FAILED),
	[S.METADATA_LOADED]: freezeStates(S.COARSE_GENERATED, S.CACHED, S.FAILED),
	[S.COARSE_GENERATED]: freezeStates(S.VISUAL_READY, S.CACHED, S.FAILED),
	[S.VISUAL_READY]: freezeStates(
		S.COLLISION_PREPARED,
		S.SAFETY_VALIDATED,
		S.DORMANT,
		S.FAILED
	),
	[S.COLLISION_PREPARED]: freezeStates(S.SAFETY_VALIDATED, S.DORMANT, S.FAILED),
	[S.SAFETY_VALIDATED]: freezeStates(S.ACTIVE, S.DORMANT, S.FAILED),
	[S.ACTIVE]: freezeStates(S.DORMANT, S.UNLOADING, S.FAILED),
	[S.DORMANT]: freezeStates(S.ACTIVE, S.UNLOADING, S.CACHED, S.FAILED),
	[S.UNLOADING]: freezeStates(S.CACHED, S.FAILED),
	[S.CACHED]: freezeStates(S.METADATA_LOADED, S.COARSE_GENERATED, S.FAILED),
	[S.FAILED]: freezeStates(S.METADATA_LOADED, S.CACHED)
});

/** Returns whether one explicit lifecycle edge is legal. */
export function canTransitionWorldChunk(fromState, toState) {
	assertWorldChunkState(fromState);
	assertWorldChunkState(toState);
	return WORLD_CHUNK_TRANSITIONS[fromState].includes(toState);
}

/** Returns a new chunk snapshot carrying immutable transition evidence. */
export function transitionWorldChunk(record, toState, evidence = {}) {
	if (!record || typeof record !== 'object') {
		throw new TypeError('World chunk record is required.');
	}
	const fromState = assertWorldChunkState(record.state);
	assertWorldChunkState(toState);
	if (!canTransitionWorldChunk(fromState, toState)) {
		throw new Error(`Illegal world chunk transition: ${fromState} -> ${toState}`);
	}
	const at = normalizeTimestamp(evidence.at);
	const transition = Object.freeze({
		from: fromState,
		to: toState,
		at,
		reason: normalizeReason(evidence.reason),
		retryCount: normalizeRetryCount(evidence.retryCount)
	});
	return Object.freeze({
		...record,
		state: toState,
		previousState: fromState,
		stateChangedAt: at,
		lastTransition: transition
	});
}

function freezeStates(...states) {
	return Object.freeze(states);
}

function normalizeTimestamp(value) {
	const timestamp = value ?? Date.now();
	if (!Number.isFinite(timestamp) || timestamp < 0) {
		throw new TypeError('Transition timestamp must be a nonnegative number.');
	}
	return timestamp;
}

function normalizeReason(value) {
	if (value === undefined) {
		return '';
	}
	if (typeof value !== 'string') {
		throw new TypeError('Transition reason must be a string.');
	}
	return value;
}

function normalizeRetryCount(value) {
	const retryCount = value ?? 0;
	if (!Number.isSafeInteger(retryCount) || retryCount < 0) {
		throw new TypeError('Transition retry count must be a nonnegative integer.');
	}
	return retryCount;
}