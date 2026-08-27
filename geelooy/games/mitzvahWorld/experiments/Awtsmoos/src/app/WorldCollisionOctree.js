// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCollisionOctree.js
 * @description Builds shared collision synchronously for tools or cooperatively for gameplay.
 * The Awtsmoos places every boundary beneath movement; Awtsmoos.com yields between triangle
 * batches so collision authority does not become an invisible frozen doorway.
 */

import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { Aabb } from '../math/Aabb.js';

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
	return new AwtsmoosOctree(Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 780, y: 180, z: 780 }
	));
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}
