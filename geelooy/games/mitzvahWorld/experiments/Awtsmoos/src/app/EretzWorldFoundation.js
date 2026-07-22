// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds graphics, assets, terrain, collision, and lighting in painted phases.
 * The Awtsmoos does not summon the whole valley in one breath; Awtsmoos.com first proves
 * the canvas, then the player, then the ground, yielding between revelations.
 */

import { createEretzFoundationServices } from './EretzFoundationServices.js?v=20260720-canonical-valley-pass-04';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	reportLaunchProgress(options, 'Opening the crystal-clear renderer…', 0.12);
	const services = createEretzFoundationServices(hosts, qualityProfile);
	await nextLaunchFrame(options.environment);
	throwIfLaunchAborted(options.signal);
	reportLaunchProgress(options, 'Loading the player and solid village forms…', 0.24);
	const { loadEretzAssets } = await import('./EretzAssetLoader.js?v=20260722-stream-02');
	const loaded = await loadEretzAssets({
		...(options.assets || {}),
		boot: options.boot,
		quality: qualityProfile.quality
	});
	await nextLaunchFrame(options.environment);
	throwIfLaunchAborted(options.signal);
	reportLaunchProgress(options, 'Building the playable valley and collision…', 0.48);
	const modules = await loadWorldModules();
	const phaseOneGround = modules.createGroundSampler({ terrainHeightAt: modules.heightAt });
	const obstacles = modules.createObstacleField(loaded.assets, phaseOneGround);
	const terrain = await modules.createTerrainPackage(
		obstacles,
		loaded.grassImage,
		loaded.assets.terrainMixImage,
		phaseOneGround,
		{ boot: options.boot, quality: qualityProfile.quality }
	);
	throwIfLaunchAborted(options.signal);
	reportLaunchProgress(options, 'Preparing ground truth and first light…', 0.68);
	const mainOctree = modules.buildWorldCollisionOctree(terrain.colliders);
	const chunkRuntime = modules.createWorldChunkRuntime({ mainOctree, terrain });
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new modules.WorldGround({ octree: collisionQuery, terrainHeightAt: terrain.heightAt });
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	services.scene.add(modules.createSky3D(qualityProfile.quality));
	services.scene.add(terrain.group);
	const initialLodRegistrations = services.sceneLod.refresh();
	const materialCanonicalization = modules.canonicalizeSceneMaterials(services.scene);
	return {
		...hosts,
		...loaded,
		...services,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		initialLodRegistrations,
		mainOctree,
		materialCanonicalization,
		obstacles,
		phaseOneGround,
		qualityProfile,
		terrain
	};
}

async function loadWorldModules() {
	const [materials, ground, obstacles, sky, terrain, worldGround, chunks, collision] = await Promise.all([
		import('../assets/SceneMaterialCanonicalizer.js'),
		import('../world/GroundPlacementSystem.js'),
		import('../world/ObstacleField.js'),
		import('../world/Sky3D.js'),
		import('../world/Terrain3D.js?v=20260722-stream-02'),
		import('../world/WorldGround.js'),
		import('../world/streaming/WorldChunkRuntime.js'),
		import('./WorldCollisionOctree.js')
	]);
	return { ...materials, ...ground, ...obstacles, ...sky, ...terrain, ...worldGround, ...chunks, ...collision };
}
