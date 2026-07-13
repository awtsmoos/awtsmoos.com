// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalProgress.js
 * @description Serializes bounded progress and releases transient generation vessels.
 * The Awtsmoos remains whole while finite phases appear and depart; Awtsmoos.com
 * records only measured truth, then clears each temporary vessel without residue.
 */
import { WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES as P } from './WorldChunkCollisionIncrementalPhases.js';

/** Returns immutable progress without exposing source triangles or live octrees. */
export function createCollisionIncrementalProgress(generator) {
	return Object.freeze({
		phase: generator.phase,
		completed: generator.phase === P.COMPLETE,
		stepCount: generator.stepCount,
		totalUnits: generator.totalUnits,
		sortRunSize: generator.options.sortRunSize,
		disposedReason: generator.disposedReason,
		sources: generator.sources?.diagnostics(generator.options.triangles.length) || null,
		merge: generator.merge?.diagnostics() || null,
		assignment: generator.assignmentBuilder?.diagnostics() || null,
		octrees: generator.octrees?.diagnostics() || null
	});
}

/** Returns one immutable bounded-step receipt. */
export function createCollisionIncrementalReceipt(
	generator,
	units,
	previousPhase = generator.phase
) {
	return Object.freeze({
		previousPhase,
		phase: generator.phase,
		units,
		completed: generator.phase === P.COMPLETE,
		progress: createCollisionIncrementalProgress(generator)
	});
}

/** Releases every runtime-only structure held by an incomplete generator. */
export function releaseCollisionIncrementalStructures(generator) {
	generator.sources = null;
	generator.merge = null;
	generator.orderedSources = null;
	generator.assignmentBuilder = null;
	generator.runtimeAssignment = null;
	generator.assignment = null;
	generator.octrees = null;
}
