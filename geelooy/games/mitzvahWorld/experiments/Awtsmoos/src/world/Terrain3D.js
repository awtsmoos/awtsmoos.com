// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Terrain3D.js
 * @description Builds the movement-ready valley before optional forest and landmark enrichment.
 * The Awtsmoos renews terrain, river, bridge, road, and inhabited stone first; Awtsmoos.com
 * lets the shliach move while distant trees and carved letters enter through truthful vessels.
 */

import { highestResolutionSurface } from '../assets/HighestResolutionSurfaceCatalog.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { primitiveColliders } from './Box3D.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import {
	createDeferredForestState,
	createDeferredTextLandmarkState
} from './streaming/DeferredTerrainFeatureState.js';
import { createTerrainGroup } from './TerrainGroupAssembly.js';
import {
	createTerrainGeometryAsync,
	terrainHeightAt
} from './TerrainGeometry.js';
import { createTerrainPackageStats } from './TerrainPackageStatistics.js';
import { preloadVillageSignTextures } from './village/VillageSignTexture.js';
import {
	createVillageWorldDefinitions
} from './village/VillageWorldSystem.js?v=20260720-canonical-valley-pass-04';

export const GRASS_URLS = Object.freeze([
	highestResolutionSurface('baseGrass'),
	TEXTURE_URLS.terrain.grass4,
	TEXTURE_URLS.terrain.grass5
]);
export const DIRT_URLS = Object.freeze([
	highestResolutionSurface('dirt'),
	TEXTURE_URLS.terrain.dirt1,
	TEXTURE_URLS.terrain.dirt5
]);
export const REAL_GRASS_URL = GRASS_URLS[0];
export const heightAt = terrainHeightAt;

export async function createTerrainPackage(
	obstacles,
	grassImage,
	dirtImage,
	groundSampler,
	options = {}
) {
	const quality = options.quality || 'medium';
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.progress('terrain-grid', 0, 1, 'Sampling canonical valley collision and surface');
	const terrain = await createTerrainGeometryAsync(undefined, undefined, {
		onProgress(current, total) {
			boot?.progress(
				'terrain-grid',
				current,
				total,
				'Building exact terrain; interface remains responsive'
			);
		},
		yieldEvery: options.terrainYieldEvery
	});
	const road = houseRoadSystem(obstacles.assets || {}, groundSampler, obstacles);
	const roadColliders = primitiveColliders(road.visual);
	const obstacleColliders = obstacles.flatMap(primitiveColliders);
	const signTextures = await preloadVillageSignTextures();
	const village = createVillageWorldDefinitions(groundSampler, quality);
	const villageColliders = village.definitions.flatMap(primitiveColliders);
	const forest = createDeferredForestState();
	const textLandmark = createDeferredTextLandmarkState();
	const occupiedColliders = [...obstacleColliders, ...villageColliders];
	const assembly = {
		dirtImage,
		forest,
		grassImage,
		groundSampler,
		obstacles,
		occupiedColliders,
		quality,
		road,
		roadColliders,
		signTextures,
		terrain,
		textLandmark,
		village
	};
	const group = createTerrainGroup(assembly, REAL_GRASS_URL);
	const stats = createTerrainPackageStats(assembly);
	const colliders = [
		...terrain.colliders,
		...roadColliders,
		...occupiedColliders
	];
	stats.deferredTerrainEnrichment = 'forest-and-landmark-after-movement';
	stats.quality = quality;
	stats.signTextures = signTextures;
	stats.terrainPreparation = { ...terrain.preparation };
	return {
		colliders,
		deferredTerrainContext: {
			colliderStore: colliders,
			forest,
			groundSampler,
			halfSize: terrain.size / 2 - 20,
			obstacleTriangles: occupiedColliders,
			quality,
			roadTriangles: roadColliders,
			textLandmark
		},
		forest,
		group,
		heightAt,
		roadStats: road.stats,
		stats,
		textLandmark,
		village,
		worldMetadata: {
			...(obstacles.userData || {}),
			deferredTerrainEnrichment: true,
			forest: forest.stats,
			quality,
			signTextures,
			terrainPreparation: { ...terrain.preparation },
			textLandmark: textLandmark.stats,
			village: village.stats
		}
	};
}
