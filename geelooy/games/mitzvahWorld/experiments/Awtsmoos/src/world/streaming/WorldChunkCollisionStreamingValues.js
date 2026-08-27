// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingValues.js
 * @description Freezes deterministic request, update, and handoff values.
 * The Awtsmoos speaks each measured vessel into being; Awtsmoos.com accepts no
 * anonymous request, invented time, mutable source, or unbounded generation work.
 */
import { parseWorldChunkId } from './WorldChunkId.js';
import {
	DEFAULT_COLLISION_GENERATION_UNITS,
	DEFAULT_COLLISION_SORT_RUN_SIZE,
	requireCollisionGenerationUnits,
	requirePositiveInteger
} from './WorldChunkCollisionIncrementalValues.js';

/** Returns one immutable production subdivision request. */
export function createCollisionStreamingRequest(options, parentRecord, sourceTriangles) {
	const requestId = requireText(options?.requestId, 'Collision request ID');
	const requestedAt = requireTime(options?.at, 'Collision request time');
	parseWorldChunkId(parentRecord?.id);
	const triangles = requireTriangles(sourceTriangles);
	return Object.freeze({
		requestId,
		requestedAt,
		parentId: parentRecord.id,
		parentBounds: parentRecord.bounds,
		parentSeed: requireSafeInteger(
			options?.parentSeed ?? parentRecord.deterministicSeed,
			'Collision parent seed'
		),
		generationVersion: requirePositiveInteger(
			options?.generationVersion ?? parentRecord.generationVersion,
			'Collision generation version'
		),
		minimumObservationFrames: requirePositiveInteger(
			options?.minimumObservationFrames ?? 1,
			'Minimum observation frames'
		),
		maximumGenerationUnits: requirePositiveInteger(
			options?.maximumGenerationUnits ?? DEFAULT_COLLISION_GENERATION_UNITS,
			'Maximum generation units'
		),
		sortRunSize: requirePositiveInteger(
			options?.sortRunSize ?? DEFAULT_COLLISION_SORT_RUN_SIZE,
			'Collision sort run size'
		),
		triangles: Object.freeze([...triangles])
	});
}

/** Returns explicit deterministic scheduler update values. */
export function createCollisionStreamingUpdate(options, requiresTime) {
	const maximumOperations = options?.maximumOperations ?? 1;
	if (!Number.isSafeInteger(maximumOperations) || maximumOperations < 0) {
		throw new TypeError('Collision operation budget must be nonnegative.');
	}
	return Object.freeze({
		at: requiresTime
			? requireTime(options?.at, 'Collision update time')
			: options?.at ?? null,
		maximumOperations: Math.min(1, maximumOperations),
		maximumGenerationUnits: options?.maximumGenerationUnits === undefined
			? null
			: requireCollisionGenerationUnits(options.maximumGenerationUnits)
	});
}

/** Returns stable handoff IDs derived only from the request identity. */
export function collisionStreamingHandoffIds(requestId) {
	const stableId = requireText(requestId, 'Collision request ID');
	return Object.freeze({
		activation: `${stableId}:retained-active`,
		retirement: `${stableId}:parent-retired`
	});
}

export function requireCollisionStreamingTime(value, label) {
	return requireTime(value, label);
}

export function requireCollisionStreamingText(value, label) {
	return requireText(value, label);
}

function requireTriangles(value) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new TypeError('Collision source triangles are required.');
	}
	return value;
}

function requireTime(value, label) {
	if (!Number.isFinite(value)) {
		throw new TypeError(`${label} must be finite.`);
	}
	return value;
}

function requireText(value, label) {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new TypeError(`${label} must be nonempty text.`);
	}
	return value.trim();
}

function requireSafeInteger(value, label) {
	if (!Number.isSafeInteger(value)) {
		throw new TypeError(`${label} must be a safe integer.`);
	}
	return value;
}
