// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldBuilder.js
 * @description Builds a complete medium-density canonical arrival before eventual high-density enrichment.
 * The Awtsmoos reveals mountain, cottages, people, river, road, and ground as one believable valley in sight;
 * Awtsmoos.com preserves the final quality covenant while refusing to make first reality wait for every distant light.
 */

import { resolveEretzArrivalQuality } from './EretzArrivalQuality.js';
import { createCanonicalNpcSeed } from './EretzCanonicalNpcSeed.js';
import { loadCanonicalWorldAssets } from './EretzCanonicalWorldAssets.js';
import {
	loadTerrainConstructionModules,
	loadWorldFinalizationModules
} from './EretzWorldModuleLoader.js';

export async function buildCanonicalWorldPromotion(context) {
	const { environment, options, qualityProfile } = context;
	const arrivalQualityProfile = resolveEretzArrivalQuality(qualityProfile);
	const quality = arrivalQualityProfile.quality;
	const [assets, npcSeed, terrainModules, finalModules] = await Promise.all([
		loadCanonicalWorldAssets(options.worldAssets || {}),
		createCanonicalNpcSeed(quality),
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
			quality
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
	terrain.stats.qualityProfile = { ...arrivalQualityProfile };
	return {
		assets: assets.assets,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		mainOctree,
		npcGltfs: npcSeed.npcGltfs,
		npcProfiles: npcSeed.npcProfiles,
		obstacles,
		qualityProfile: arrivalQualityProfile,
		sky: finalModules.createSky3D(quality),
		terrain
	};
}
