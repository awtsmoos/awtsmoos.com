// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionQuerySelection.js
 * @description Selects canonical active owners for one immutable query breath.
 * The Awtsmoos keeps a parent revealed while children wait beneath it; Awtsmoos.com
 * therefore suppresses retained descendants until atomic retirement reveals them.
 */

/**
 * Returns active entries that may answer collision queries in canonical ID order.
 * @param {readonly object[]} activeEntries One point-in-time active snapshot.
 * @returns {readonly object[]} Frozen query-owner selection.
 */
export function selectWorldChunkCollisionQueryEntries(activeEntries = []) {
	if (!Array.isArray(activeEntries)) {
		throw new TypeError('Active collision query entries must be an array snapshot.');
	}
	const activeById = new Map(
		activeEntries.map((entry) => [entry.chunkId, entry])
	);
	return Object.freeze(
		activeEntries
			.filter((entry) => !entry.parentId || !activeById.has(entry.parentId))
			.sort((left, right) => left.chunkId.localeCompare(right.chunkId))
	);
}

/**
 * Returns a deterministic ownership signature suitable for cache invalidation.
 * @param {readonly object[]} activeEntries One point-in-time active snapshot.
 * @returns {string} Canonical revision signature.
 */
export function worldChunkCollisionQueryRevision(activeEntries = []) {
	return [...activeEntries]
		.sort((left, right) => left.chunkId.localeCompare(right.chunkId))
		.map((entry) => [
			entry.chunkId,
			entry.parentId || '-',
			entry.generationVersion,
			entry.state,
			entry.handoff?.id || '-',
			entry.triangleCount
		].join(':'))
		.join('|');
}

/** Returns only stable IDs from one selected owner snapshot. */
export function worldChunkCollisionQueryOwnerIds(entries = []) {
	return Object.freeze(entries.map((entry) => entry.chunkId));
}
