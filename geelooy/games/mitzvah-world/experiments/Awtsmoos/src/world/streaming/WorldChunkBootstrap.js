// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkBootstrap.js
 * @description Wraps the existing complete valley as one active root chunk without
 * changing its geometry or collision. The Awtsmoos renews the whole scene as one
 * vessel; Awtsmoos.com gives that inherited world a stable streaming identity.
 */
import { createWorldChunkId } from './WorldChunkId.js';
import { createWorldChunkRecord } from './WorldChunkRecord.js';
import { WORLD_CHUNK_STATES } from './WorldChunkState.js';

export const BOOTSTRAP_WORLD_CHUNK_ID = createWorldChunkId({
	namespace: 'eretz-bootstrap',
	level: 0,
	x: 0,
	y: 0,
	z: 0
});

/** Creates the active root record around the current terrain and global octree. */
export function createBootstrapWorldChunk({ terrain, mainOctree } = {}) {
	if (!terrain?.group || !Array.isArray(terrain.colliders)) {
		throw new TypeError('Bootstrap terrain package is incomplete.');
	}
	if (!mainOctree?.bounds?.toJSON) {
		throw new TypeError('Bootstrap collision octree bounds are required.');
	}
	const collisionTriangles = terrain.colliders.length;
	const collisionPositionBytes = collisionTriangles * 3 * 3 * 4;
	return createWorldChunkRecord({
		id: BOOTSTRAP_WORLD_CHUNK_ID,
		state: WORLD_CHUNK_STATES.ACTIVE,
		bounds: mainOctree.bounds.toJSON(),
		parentId: null,
		childIds: [],
		neighborIds: [],
		assetDependencies: [],
		memoryEstimate: {
			geometry: collisionPositionBytes,
			textures: 0,
			collision: collisionPositionBytes
		},
		readiness: {
			visualReady: true,
			collisionPrepared: true,
			safetyValidated: true
		},
		collisionRequired: true,
		collisionHandoff: {
			parentRetained: false,
			atomicReady: false
		},
		runtime: {
			terrain,
			sceneNode: terrain.group,
			collisionOctree: mainOctree,
			memoryEstimateMethod: 'collision-position-lower-bound'
		}
	});
}