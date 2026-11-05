// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingGenerationOperations.js
 * @description Starts, steps, completes, and disposes bounded generation sessions.
 * The Awtsmoos holds every unfinished child within the retained parent;
 * Awtsmoos.com measures each step without exposing an incomplete octree owner.
 */
import { WORLD_CHUNK_COLLISION_STREAMING_STATES as S } from './WorldChunkCollisionStreamingStates.js';

/** Creates one runtime-only generator and enters the explicit generating state. */
export function beginCollisionStreamingGeneration(job, dependencies, at) {
	job.generator = dependencies.createGenerator({
		parentId: job.request.parentId,
		parentBounds: job.request.parentBounds,
		parentSeed: job.request.parentSeed,
		generationVersion: job.request.generationVersion,
		triangles: job.request.triangles,
		defaultStepUnits: job.request.maximumGenerationUnits,
		sortRunSize: job.request.sortRunSize
	});
	job.transition(S.GENERATING, 'begin-generation', at, Object.freeze({
		maximumGenerationUnits: job.request.maximumGenerationUnits,
		sortRunSize: job.request.sortRunSize
	}));
	return 'begin-generation';
}

/** Advances one measured bounded generator step. */
export function stepCollisionStreamingGeneration(
	job,
	dependencies,
	at,
	maximumUnits
) {
	const measured = dependencies.measure(() => job.generator.step({ maximumUnits }));
	job.recordGenerationStep(measured.value, measured.durationMs, at);
	if (!measured.value.completed) {
		return 'generation-step';
	}
	job.setGenerated(job.generator.result());
	job.transition(S.GENERATED, 'complete-generation', at, Object.freeze({
		childCount: job.childIds.length,
		generationStepCount: job.generationTelemetry.stepCount,
		generationDurationMs: job.generationTelemetry.cumulativeDurationMs
	}));
	return 'complete-generation';
}

/** Disposes a pending generator without touching collision ownership. */
export function disposeCollisionStreamingGeneration(job, reason) {
	if (job.generator && !job.generator.diagnostics().completed) {
		job.generator.dispose(reason);
	}
}
