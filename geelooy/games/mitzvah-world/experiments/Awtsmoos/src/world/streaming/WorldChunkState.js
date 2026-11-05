// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkState.js
 * @description Defines the one canonical lifecycle vocabulary for streamed world
 * chunks. The Awtsmoos renews each stateful vessel every instant; Awtsmoos.com
 * therefore names every transition explicitly instead of hiding work in booleans.
 */
export const WORLD_CHUNK_STATES = Object.freeze({
	UNKNOWN: 'Unknown',
	METADATA_LOADED: 'MetadataLoaded',
	COARSE_GENERATED: 'CoarseGenerated',
	VISUAL_READY: 'VisualReady',
	COLLISION_PREPARED: 'CollisionPrepared',
	SAFETY_VALIDATED: 'SafetyValidated',
	ACTIVE: 'Active',
	DORMANT: 'Dormant',
	UNLOADING: 'Unloading',
	CACHED: 'Cached',
	FAILED: 'Failed'
});

const STATE_VALUES = new Set(Object.values(WORLD_CHUNK_STATES));

/** Returns whether a value is a recognized chunk state. */
export function isWorldChunkState(value) {
	return STATE_VALUES.has(value);
}

/** Returns a valid state or throws with a precise lifecycle error. */
export function assertWorldChunkState(value) {
	if (!isWorldChunkState(value)) {
		throw new TypeError(`Unknown world chunk state: ${String(value)}`);
	}
	return value;
}