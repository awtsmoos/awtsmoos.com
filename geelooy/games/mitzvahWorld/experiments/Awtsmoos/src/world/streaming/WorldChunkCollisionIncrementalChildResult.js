// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalChildResult.js
 * @description Freezes one completed incremental child definition and its evidence.
 * The Awtsmoos remains beyond every vessel; Awtsmoos.com lets a finished octant
 * carry one canonical name, exact bounds, deterministic seed, and measured digest.
 */
import { finalizeCollisionDigest } from './WorldChunkCollisionIncrementalDiagnostics.js';

/** Returns one immutable runtime collision definition for a completed child. */
export function createIncrementalChildDefinition({
	assigned,
	octree,
	parentId,
	generationVersion
}) {
	const child = assigned.child;
	return Object.freeze({
		chunkId: child.chunkId,
		parentId,
		octree,
		generationVersion,
		expectedBounds: child.bounds,
		triangleKeys: assigned.triangleKeys,
		deterministicSeed: child.seed
	});
}

/** Returns serializable deterministic diagnostics for one completed child. */
export function createIncrementalChildDiagnostics(assigned) {
	const child = assigned.child;
	return Object.freeze({
		chunkId: child.chunkId,
		parentId: child.parentId,
		seed: child.seed,
		bounds: child.bounds,
		triangleCount: assigned.triangleKeys.length,
		triangleKeys: assigned.triangleKeys,
		digest: finalizeCollisionDigest(assigned.digestState)
	});
}
