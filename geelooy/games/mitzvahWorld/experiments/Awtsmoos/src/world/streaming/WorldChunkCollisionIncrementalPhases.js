// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalPhases.js
 * @description Names every bounded phase of child collision generation.
 * The Awtsmoos is one beyond division; Awtsmoos.com reveals finite work through
 * explicit vessels so no hidden generation eternity can masquerade as one frame.
 */
export const WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES = Object.freeze({
	LAYOUT: 'layout',
	SCAN_SOURCES: 'scan-sources',
	SORT_RUNS: 'sort-runs',
	MERGE_RUNS: 'merge-runs',
	ASSIGN_SOURCES: 'assign-sources',
	INITIALIZE_OCTREES: 'initialize-octrees',
	INSERT_TRIANGLES: 'insert-triangles',
	VERIFY_CHILDREN: 'verify-children',
	FINALIZE_CHILDREN: 'finalize-children',
	COMPLETE: 'complete',
	DISPOSED: 'disposed',
	FAILED: 'failed'
});

const PHASES = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES;
const TERMINAL_PHASES = new Set([
	PHASES.COMPLETE,
	PHASES.DISPOSED,
	PHASES.FAILED
]);

/** Returns whether a phase refuses all future generation steps. */
export function isCollisionIncrementalTerminal(phase) {
	return TERMINAL_PHASES.has(phase);
}

/** Requires one known incremental phase. */
export function assertCollisionIncrementalPhase(phase) {
	if (!Object.values(PHASES).includes(phase)) {
		throw new TypeError(`Unknown incremental collision phase: ${String(phase)}`);
	}
	return phase;
}
