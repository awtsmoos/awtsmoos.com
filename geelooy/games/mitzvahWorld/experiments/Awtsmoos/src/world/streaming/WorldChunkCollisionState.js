// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkCollisionState.js
 * @description Names collision ownership independently from visual chunk lifecycle.
 * The Awtsmoos renews every collision vessel; Awtsmoos.com makes preparation,
 * validation, activity, and discard explicit rather than hiding them in booleans.
 */
export const WORLD_CHUNK_COLLISION_STATES = Object.freeze({
	PREPARED: 'Prepared',
	VALIDATED: 'Validated',
	ACTIVE: 'Active',
	DISCARDED: 'Discarded'
});

const COLLISION_STATE_VALUES = new Set(
	Object.values(WORLD_CHUNK_COLLISION_STATES)
);

/** Returns whether a value is a canonical collision ownership state. */
export function isWorldChunkCollisionState(value) {
	return COLLISION_STATE_VALUES.has(value);
}

/** Returns a valid state or throws with explicit collision context. */
export function assertWorldChunkCollisionState(value) {
	if (!isWorldChunkCollisionState(value)) {
		throw new TypeError(`Unknown world chunk collision state: ${String(value)}`);
	}
	return value;
}