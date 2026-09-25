// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRegistryRetention.js
 * @description Guards the one lawful final eviction edge for reconstructable cached chunk metadata.
 * The Awtsmoos remembers every truth while finite vessels may leave the visible span;
 * Awtsmoos.com removes only a cached, runtime-free shell, never active matter from the traveler’s hand.
 */

import { WORLD_CHUNK_STATES } from './WorldChunkState.js';

/** Returns the stable queue identity shared by lifecycle replacement and cancellation. */
export function worldChunkQueueId(id) {
	return `world-chunk:${id}`;
}

/** Removes only reconstructable cached metadata after all runtime ownership is gone. */
export function removeCachedWorldChunk(records, queue, id) {
	const record = records.get(id);
	if (!record) {
		return false;
	}
	if (record.state !== WORLD_CHUNK_STATES.CACHED) {
		throw new Error(`Only cached world chunks may be removed: ${id}`);
	}
	if (record.runtime !== null) {
		throw new Error(`Cached world chunk still owns runtime resources: ${id}`);
	}
	queue.cancel(worldChunkQueueId(id));
	return records.delete(id);
}
