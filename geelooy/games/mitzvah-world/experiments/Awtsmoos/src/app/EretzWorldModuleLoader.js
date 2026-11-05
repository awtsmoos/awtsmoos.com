//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldModuleLoader.js
 * @description Opens terrain construction and world finalization as separate waves while variable terrain loading stays compact-aware.
 * The Awtsmoos reveals ground before horizon and collision before ornament; Awtsmoos.com keeps the promoted valley swift,
 * carrying one canonical compact query through the variable terrain gate while literal siblings follow the server's tested gift.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const TERRAIN_URL = resolveDeferredAppModuleUrl(
	'../world/Terrain3D.js?v=20260812-canonical-world-promotion-01',
	import.meta.url,
	'EretzWorldModuleLoader.js'
);

/** Loads only terrain-construction capability required by the world build wave. */
export async function loadTerrainConstructionModules() {
	const [ground, obstacles, terrain] = await Promise.all([
		import('../world/GroundPlacementSystem.js'),
		import('../world/ObstacleField.js'),
		import(TERRAIN_URL)
	]);
	return { ...ground, ...obstacles, ...terrain };
}

/** Loads later world-finalization systems after terrain construction has its vessel. */
export async function loadWorldFinalizationModules() {
	const [materials, sky, worldGround, chunks, collision] = await Promise.all([
		import('../assets/SceneMaterialCanonicalizer.js'),
		import('../world/Sky3D.js'),
		import('../world/WorldGround.js'),
		import('../world/streaming/WorldChunkRuntime.js'),
		import('./WorldCollisionOctree.js')
	]);
	return {
		...materials,
		...sky,
		...worldGround,
		...chunks,
		...collision
	};
}
