// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFinalizer.js
 * @description Adds collision, chunks, sky, and scene contracts after terrain exists.
 * The Awtsmoos gathers the valley without one frozen instant; Awtsmoos.com indexes collision
 * cooperatively, then returns each finalized vessel to the staged WebGL foundation.
 */

import {
	nextLaunchTask,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

export async function finalizeEretzWorld(context) {
	const {
		environment,
		loaders,
		options,
		phaseOneGround,
		qualityProfile,
		services,
		terrain
	} = context;
	await nextLaunchTask(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('collision-and-scene');
	reportLaunchProgress(
		options,
		'Indexing movement collision in bounded batches…',
		0.84
	);
	const modules = await loaders.loadWorldFinalizationModules();
	const mainOctree = await modules.buildWorldCollisionOctreeAsync(
		terrain.colliders,
		{
			onProgress: options.onProgress,
			yieldWork: () => nextLaunchTask(environment)
		}
	);
	const chunkRuntime = modules.createWorldChunkRuntime({ mainOctree, terrain });
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new modules.WorldGround({
		octree: collisionQuery,
		terrainHeightAt: terrain.heightAt
	});
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	services.scene.add(modules.createSky3D(qualityProfile.quality));
	services.scene.add(terrain.group);
	const initialLodRegistrations = services.sceneLod.refresh();
	const materialCanonicalization = modules.canonicalizeSceneMaterials(
		services.scene
	);
	return {
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		initialLodRegistrations,
		mainOctree,
		materialCanonicalization
	};
}
