// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionDiagnostics.js
 * @description Aggregates exact collision ownership without serializing octrees.
 * The Awtsmoos renews safe ground beneath every traveler; Awtsmoos.com exposes IDs,
 * bounds, triangles, parent coverage, and geometric handoff proof for direct audit.
 */
import { WORLD_CHUNK_COLLISION_STATES as C } from './WorldChunkCollisionState.js';

/** Returns one immutable point-in-time collision ownership snapshot. */
export function createWorldChunkCollisionDiagnostics(
	activeEntries,
	preparedEntries,
	lastHandoff,
	lastDiscard
) {
	const active = [...activeEntries];
	const prepared = [...preparedEntries];
	const validated = prepared.filter((entry) => entry.state === C.VALIDATED);
	return Object.freeze({
		active: active.length,
		prepared: prepared.length,
		validated: validated.length,
		activeTriangles: triangleTotal(active),
		preparedTriangles: triangleTotal(prepared),
		activeIds: freezeIds(active),
		preparedIds: freezeIds(prepared),
		validatedIds: freezeIds(validated),
		activeEntries: freezeEntrySummaries(active),
		preparedEntries: freezeEntrySummaries(prepared),
		parentCoverage: freezeParentCoverage(active),
		lastHandoff: compactHandoff(lastHandoff),
		lastDiscard: compactDiscard(lastDiscard)
	});
}

function triangleTotal(entries) {
	return entries.reduce((total, entry) => total + entry.triangleCount, 0);
}

function freezeIds(entries) {
	return Object.freeze(entries.map((entry) => entry.chunkId).sort());
}

function freezeEntrySummaries(entries) {
	return Object.freeze(entries.map((entry) => Object.freeze({
		chunkId: entry.chunkId,
		parentId: entry.parentId,
		state: entry.state,
		bounds: entry.bounds,
		triangleCount: entry.triangleCount
	})).sort((left, right) => left.chunkId.localeCompare(right.chunkId)));
}

function freezeParentCoverage(entries) {
	const coverage = {};
	for (const entry of entries) {
		if (!entry.parentId) {
			continue;
		}
		coverage[entry.parentId] ||= [];
		coverage[entry.parentId].push(entry.chunkId);
	}
	for (const [parentId, childIds] of Object.entries(coverage)) {
		coverage[parentId] = Object.freeze(childIds.sort());
	}
	return Object.freeze(coverage);
}

function compactHandoff(value) {
	if (!value) {
		return null;
	}
	return Object.freeze({
		id: value.id,
		parentId: value.parentId,
		childIds: Object.freeze([...value.childIds]),
		retainedParent: value.retainedParent,
		at: value.at,
		coverage: compactCoverage(value.coverage)
	});
}

function compactCoverage(value) {
	if (!value) {
		return null;
	}
	return Object.freeze({
		parentBounds: value.parentBounds,
		aggregateBounds: value.aggregateBounds,
		parentVolume: value.parentVolume,
		childVolume: value.childVolume,
		childCount: value.childCount,
		tolerance: value.tolerance
	});
}

function compactDiscard(value) {
	if (!value) {
		return null;
	}
	return Object.freeze({
		chunkId: value.chunkId,
		at: value.at,
		reason: value.reason
	});
}
