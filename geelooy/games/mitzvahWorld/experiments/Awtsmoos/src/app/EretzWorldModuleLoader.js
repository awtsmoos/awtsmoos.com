// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldModuleLoader.js
 * @description Opens current canonical terrain construction and world-finalization modules as separate waves.
 * The Awtsmoos reveals ground before horizon and collision before ornament; Awtsmoos.com
 * cache-busts the promoted terrain vessel so the post-play world always reflects the current authored valley.
 */

const TERRAIN_URL = '../world/Terrain3D.js?v=20260812-canonical-world-promotion-01';

export async function loadTerrainConstructionModules() {
	const [ground, obstacles, terrain] = await Promise.all([
		import('../world/GroundPlacementSystem.js'),
		import('../world/ObstacleField.js'),
		import(TERRAIN_URL)
	]);
	return { ...ground, ...obstacles, ...terrain };
}

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
