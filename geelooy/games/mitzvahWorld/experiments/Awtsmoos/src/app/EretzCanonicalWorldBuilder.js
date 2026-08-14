// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldBuilder.js
 * @description Builds canonical terrain and collision off-scene while bootstrap gameplay remains responsive.
 * The Awtsmoos prepares mountain, cottages, river, grass, and collision beyond the visible threshold;
 * Awtsmoos.com withholds the swap until every ground authority is ready, so no half-world interrupts the traveler below.
 */

import { loadCanonicalWorldAssets } from './EretzCanonicalWorldAssets.js';
import {
	loadTerrainConstructionModules,
	loadWorldFinalizationModules
} from './EretzWorldModuleLoader.js';

/** Builds the canonical world package without adding it to the live scene. */
export async function buildCanonicalWorldPromotion(context) {
	const { environment, options, qualityProfile } = context;
	const [assets, terrainModules, finalModules] = await Promise.all([
		loadCanonicalWorldAssets(options.worldAssets || {}),
		loadTerrainConstructionModules(),
		loadWorldFinalizationModules()
	]);
	const phaseOneGround = terrainModules.createGroundSampler({
		terrainHeightAt: terrainModules.heightAt
	});
	const obstacles = terrainModules.createObstacleField(
		assets.assets,
		phaseOneGround,
		{ legacyHouses: false }
	);
	const terrain = await terrainModules.createTerrainPackage(
		obstacles,
		assets.grassImage,
		assets.dirtImage,
		phaseOneGround,
		{
			environment,
			onProgress: options.onProgress,
			quality: qualityProfile.quality
		}
	);
	const mainOctree = await finalModules.buildWorldCollisionOctreeAsync(
		terrain.colliders,
		{ onProgress: options.onProgress }
	);
	const chunkRuntime = finalModules.createWorldChunkRuntime({ mainOctree, terrain });
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new finalModules.WorldGround({
		octree: collisionQuery,
		terrainHeightAt: terrain.heightAt
	});
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	return {
		assets: assets.assets,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		mainOctree,
		obstacles,
		sky: finalModules.createSky3D(qualityProfile.quality),
		terrain
	};
}
