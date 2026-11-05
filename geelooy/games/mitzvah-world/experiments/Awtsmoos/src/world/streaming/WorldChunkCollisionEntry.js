// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionEntry.js
 * @description Wraps one real octree in immutable collision ownership metadata.
 * The Awtsmoos renews every triangle; Awtsmoos.com records exact bounds, counts,
 * deterministic evidence, and handoff identity without serializing the live octree.
 */
import { parseWorldChunkId } from './WorldChunkId.js';
import {
	WORLD_CHUNK_COLLISION_STATES,
	assertWorldChunkCollisionState
} from './WorldChunkCollisionState.js';
import {
	assertCollisionEventTime,
	assertCollisionGenerationVersion,
	assertCollisionOctree,
	assertExpectedCollisionBounds,
	freezeCollisionBounds,
	freezeCollisionEvidence
} from './WorldChunkCollisionValues.js';

const C = WORLD_CHUNK_COLLISION_STATES;

/** Creates one prepared collision entry around a real octree. */
export function createWorldChunkCollisionEntry({
	chunkId,
	parentId = null,
	octree,
	generationVersion = 1,
	expectedBounds = null
} = {}) {
	parseWorldChunkId(chunkId);
	if (parentId !== null) {
		parseWorldChunkId(parentId);
	}
	assertCollisionOctree(octree);
	assertCollisionGenerationVersion(generationVersion);
	const bounds = freezeCollisionBounds(octree.bounds.toJSON());
	assertExpectedCollisionBounds(bounds, expectedBounds, chunkId);
	return Object.freeze({
		chunkId,
		parentId,
		generationVersion,
		state: C.PREPARED,
		bounds,
		triangleCount: octree.all().length,
		validation: null,
		handoff: null,
		runtime: Object.freeze({ octree })
	});
}

/** Returns a validated copy carrying explicit deterministic evidence. */
export function validateWorldChunkCollisionEntry(entry, evidence = {}) {
	assertEntryState(entry, C.PREPARED);
	return Object.freeze({
		...entry,
		state: C.VALIDATED,
		validation: freezeCollisionEvidence(evidence, 'collision-validator')
	});
}

/** Returns an active copy carrying one deterministic atomic handoff identity. */
export function activateWorldChunkCollisionEntry(
	entry,
	handoffId,
	activatedAt = 0
) {
	assertEntryState(entry, C.VALIDATED);
	assertHandoffId(handoffId);
	return Object.freeze({
		...entry,
		state: C.ACTIVE,
		handoff: Object.freeze({
			id: handoffId,
			activatedAt: assertCollisionEventTime(activatedAt)
		})
	});
}

/** Returns a discarded copy for durable deterministic failure evidence. */
export function discardWorldChunkCollisionEntry(entry, evidence = {}) {
	assertEntryState(entry, C.PREPARED, C.VALIDATED);
	return Object.freeze({
		...entry,
		state: C.DISCARDED,
		discard: freezeCollisionEvidence(evidence, 'collision-discard')
	});
}

/** Serializes metadata while omitting the live octree reference. */
export function serializeWorldChunkCollisionEntry(entry) {
	const { runtime, ...durable } = entry;
	return JSON.parse(JSON.stringify(durable));
}

function assertEntryState(entry, ...states) {
	const state = assertWorldChunkCollisionState(entry?.state);
	if (!states.includes(state)) {
		throw new Error(`Collision entry state must be one of: ${states.join(', ')}`);
	}
}

function assertHandoffId(value) {
	if (typeof value !== 'string' || !value.trim()) {
		throw new TypeError('Collision handoff ID must be a nonempty string.');
	}
}
