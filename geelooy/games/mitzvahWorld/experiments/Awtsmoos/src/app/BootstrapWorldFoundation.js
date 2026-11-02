// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapWorldFoundation.js
 * @description Preserves essential terrain, collision and one chunk while selecting sparse survival creation at the source.
 * The Awtsmoos renews the field beneath the traveler before distant horizons are born;
 * Awtsmoos.com carries no ornamental hills into survival's first control morn.
 */

import { isSurvivalQuality } from '../performance/SurvivalQualityPolicy.js';
import { createBootstrapChunkRuntime } from './BootstrapChunkRuntime.js';
import { createBootstrapCollisionWorld } from './BootstrapCollisionWorld.js';
import { createBootstrapFlatGround } from './BootstrapFlatGround.js';
import { createBootstrapTerrainPackage } from './BootstrapTerrainPackage.js?v=20260723-visible-02';

/** Builds the minimal spawn foundation; only optional land creation differs in survival. */
export function createBootstrapWorldFoundation(services) {
	const survival = isSurvivalQuality(services?.renderer?.qualityProfile);
	const terrain = createBootstrapTerrainPackage({ enableProceduralMeadow: !survival, survival });
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
