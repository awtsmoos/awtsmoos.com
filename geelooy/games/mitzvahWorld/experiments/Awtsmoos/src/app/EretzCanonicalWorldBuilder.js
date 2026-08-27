// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldBuilder.js
 * @description Builds canonical visual truth around one compact indexed collision authority.
 * The Awtsmoos reveals mountain, cottages, people, river, road, and ground before distance is done;
 * Awtsmoos.com shares one local index through promotion and streaming, so needless rescans become none.
 */

import { resolveEretzArrivalQuality } from './EretzArrivalQuality.js';
import { createCanonicalNpcSeed } from './EretzCanonicalNpcSeed.js';
import { loadCanonicalWorldAssets } from './EretzCanonicalWorldAssets.js';
import { buildLocalCollisionBootstrap } from './EretzLocalCollisionBootstrap.js';
import {
	loadTerrainConstructionModules,
	loadWorldFinalizationModules
} from './EretzWorldModuleLoader.js';

export async function buildCanonicalWorldPromotion(context) {
	const { environment, options, qualityProfile, runtime } = context;
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
	const localCollision = await buildLocalCollisionBootstrap({
		buildOctree: finalModules.buildWorldCollisionOctreeAsync,
		colliders: terrain.colliders,
		onProgress: options.onProgress,
		playerPosition: runtime.model.position,
		terrainGridSteps: terrain.worldMetadata?.terrainGridSteps
	});
	const mainOctree = localCollision.mainOctree;
	const chunkRuntime = finalModules.createWorldChunkRuntime({
		collisionSourceIndex: localCollision.sourceIndex,
		mainOctree,
		terrain
	});
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new finalModules.WorldGround({
		octree: collisionQuery,
		terrainHeightAt: terrain.heightAt
	});
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...arrivalQualityProfile };
	terrain.stats.localCollision = { ...localCollision.diagnostics };
	return {
		assets: assets.assets,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionBootstrap: localCollision.diagnostics,
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
