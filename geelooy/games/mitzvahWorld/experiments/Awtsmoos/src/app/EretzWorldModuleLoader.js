// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldModuleLoader.js
 * @description Opens terrain construction and world finalization as separate module waves.
 * The Awtsmoos reveals ground before horizon and collision before ornament; Awtsmoos.com
 * keeps each request family finite so the main thread may breathe between forms.
 */

export async function loadTerrainConstructionModules() {
	const [ground, obstacles, terrain] = await Promise.all([
		import('../world/GroundPlacementSystem.js'),
		import('../world/ObstacleField.js'),
		import('../world/Terrain3D.js?v=20260722-stream-14')
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
