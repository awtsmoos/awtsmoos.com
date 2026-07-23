// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapWorldFoundation.js
 * @description Joins flat terrain, open collision, ground, chunks, and scene for first control.
 * The Awtsmoos gathers only what movement needs; Awtsmoos.com returns truthful diagnostics and
 * leaves village geometry, octrees, sky, materials, and authored chunks outside the critical path.
 */

import { createBootstrapChunkRuntime } from './BootstrapChunkRuntime.js';
import { createBootstrapCollisionWorld } from './BootstrapCollisionWorld.js';
import { createBootstrapFlatGround } from './BootstrapFlatGround.js';
import { createBootstrapTerrainPackage } from './BootstrapTerrainPackage.js';

export function createBootstrapWorldFoundation(services) {
	const terrain = createBootstrapTerrainPackage();
	const mainOctree = createBootstrapCollisionWorld();
	const collisionQuery = mainOctree;
	const groundContracts = createBootstrapFlatGround(collisionQuery);
	const chunkRuntime = createBootstrapChunkRuntime();
	chunkRuntime.collisionQuery = collisionQuery;
	terrain.deferredTerrainContext.groundSampler = groundContracts.groundSampler;
	services.scene.add(terrain.group);
	const initialLodRegistrations = services.sceneLod.refresh();
	return {
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground: groundContracts.ground,
		groundSampler: groundContracts.groundSampler,
		initialLodRegistrations,
		mainOctree,
		materialCanonicalization: {
			canonicalized: 0,
			mode: 'bootstrap-dormant'
		},
		obstacles: {
			assets: {},
			userData: { bootstrap: true }
		},
		phaseOneGround: groundContracts.groundSampler,
		terrain
	};
}
