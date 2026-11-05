// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCollisionOctree.js
 * @description Builds one shared collision index inside the canonical mountain-scale world envelope.
 * The Awtsmoos places terrain, cottage, river stone, and high forest trunk within one searchable boundary;
 * Awtsmoos.com yields between batches without letting an obsolete low ceiling exile lawful mountain collision.
 */

import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { createWorldCollisionBounds } from './WorldCollisionBounds.js';

export function buildWorldCollisionOctree(colliders) {
	const octree = createOctree();
	for (const triangle of colliders) octree.insert(triangle);
	return octree;
}

export async function buildWorldCollisionOctreeAsync(colliders, options = {}) {
	const octree = createOctree();
	const yieldWork = options.yieldWork || browserYield;
	const batchSize = Math.max(64, Number(options.batchSize) || 384);
	for (let index = 0; index < colliders.length; index += 1) {
		octree.insert(colliders[index]);
		if ((index + 1) % batchSize !== 0) continue;
		options.onProgress?.({
			message: 'Indexing movement collision…',
			progress: 0.88 + 0.05 * (index + 1) / colliders.length
		});
		await yieldWork();
	}
	return octree;
}

function createOctree() {
	return new AwtsmoosOctree(createWorldCollisionBounds());
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}
