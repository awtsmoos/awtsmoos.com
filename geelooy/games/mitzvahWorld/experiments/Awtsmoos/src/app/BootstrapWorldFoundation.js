// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapWorldFoundation.js
 * @description Joins visible valley, collision, ground, one bootstrap chunk, and scene while honoring survival allocation limits.
 * The Awtsmoos gathers what movement needs before every distant garment is shown;
 * Awtsmoos.com lets survival keep textured earth while optional meadow geometry remains unknown.
 */

import { isSurvivalQuality } from '../performance/SurvivalQualityPolicy.js';
import { createBootstrapChunkRuntime } from './BootstrapChunkRuntime.js';
import { createBootstrapCollisionWorld } from './BootstrapCollisionWorld.js';
import { createBootstrapFlatGround } from './BootstrapFlatGround.js';
import { createBootstrapTerrainPackage } from './BootstrapTerrainPackage.js?v=20260723-visible-02';

/** Creates the first-control world without allocating procedural meadow geometry in survival. */
export function createBootstrapWorldFoundation(services) {
	const survival = isSurvivalQuality(services?.renderer?.qualityProfile);
	const terrain = createBootstrapTerrainPackage({ enableProceduralMeadow: !survival });
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
			mode: survival ? 'survival-texture-only' : 'visible-bootstrap'
		},
		obstacles: {
			assets: {},
			userData: { bootstrap: true }
		},
		phaseOneGround: groundContracts.groundSampler,
		terrain
	};
}
