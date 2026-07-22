// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Terrain3D.js
 * @description Builds a movement-ready valley cooperatively, then streams sign garments.
 * The Awtsmoos reveals exact ground before distant decoration; Awtsmoos.com keeps terrain,
 * collision, and scene assembly responsive while preserving canonical world coordinates.
 */

import { primitiveColliders } from './Box3D.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import {
	createDeferredForestState,
	createDeferredTextLandmarkState
} from './streaming/DeferredTerrainFeatureState.js';
import { createTerrainGroupAsync } from './TerrainGroupAssembly.js';
import { createTerrainGeometryAsync, terrainHeightAt } from './TerrainGeometry.js';
import { createTerrainPackageStats } from './TerrainPackageStatistics.js';
import { collectPrimitiveColliders } from './TerrainPackageColliders.js';
import { terrainStepsForQuality } from './TerrainQualitySteps.js';
import { DIRT_URLS, GRASS_URLS, REAL_GRASS_URL } from './TerrainTextureCatalog.js';
import { startVillageSignTextureStreaming } from './TerrainSignTextureStreaming.js';
import { createVillageWorldDefinitions } from './village/VillageWorldSystem.js?v=20260720-canonical-valley-pass-04';

export { DIRT_URLS, GRASS_URLS, REAL_GRASS_URL };
export const heightAt = terrainHeightAt;

export async function createTerrainPackage(obstacles, grassImage, dirtImage, groundSampler, options = {}) {
	const quality = options.quality || 'medium';
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const onProgress = options.onProgress;
	const yieldWork = options.yieldWork || browserYield;
	const steps = options.steps || terrainStepsForQuality(quality);
	report(onProgress, boot, 'Sampling the canonical valley…', 0.52);
	const terrain = await createTerrainGeometryAsync(undefined, steps, {
		onPhase: (message, progress) => report(onProgress, boot, message, progress),
		onProgress: (current, total) => boot?.progress(
			'terrain-grid', current, total, 'Building exact terrain while the interface remains responsive'
		),
		yieldEvery: options.terrainYieldEvery,
		yieldWork
	});
	report(onProgress, boot, 'Laying the road and inhabited stone…', 0.85);
	const road = houseRoadSystem(obstacles.assets || {}, groundSampler, obstacles);
	const village = createVillageWorldDefinitions(groundSampler, quality);
	await yieldWork();
	const roadColliders = primitiveColliders(road.visual);
	const obstacleColliders = await collectPrimitiveColliders(obstacles, {
		onProgress,
		progress: 0.87,
		yieldWork
	});
	const villageColliders = await collectPrimitiveColliders(village.definitions, {
		onProgress,
		progress: 0.89,
		yieldWork
	});
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
		signTextures: { status: 'streaming-after-playable-frame' },
		terrain,
		textLandmark,
		village
	};
	const group = await createTerrainGroupAsync(assembly, REAL_GRASS_URL, {
		onProgress,
		yieldWork
	});
	const stats = createTerrainPackageStats(assembly);
	const colliders = [...terrain.colliders, ...roadColliders, ...occupiedColliders];
	stats.deferredTerrainEnrichment = 'forest-landmark-and-signs-after-movement';
	stats.quality = quality;
	stats.terrainPreparation = { ...terrain.preparation };
	const signTexturePromise = startVillageSignTextureStreaming({ environment: options.environment });
	signTexturePromise.then(value => { stats.signTextures = value; });
	return createTerrainPackageResult({
		assembly,
		colliders,
		group,
		quality,
		signTexturePromise,
		stats,
		steps,
		terrain
	});
}

function createTerrainPackageResult(context) {
	const { assembly, colliders, group, quality, signTexturePromise, stats, steps, terrain } = context;
	return {
		colliders,
		deferredTerrainContext: {
			colliderStore: colliders,
			forest: assembly.forest,
			groundSampler: assembly.groundSampler,
			halfSize: terrain.size / 2 - 20,
			obstacleTriangles: assembly.occupiedColliders,
			quality,
			roadTriangles: assembly.roadColliders,
			textLandmark: assembly.textLandmark
		},
		forest: assembly.forest,
		group,
		heightAt,
		roadStats: assembly.road.stats,
		signTexturePromise,
		stats,
		textLandmark: assembly.textLandmark,
		village: assembly.village,
		worldMetadata: {
			...(assembly.obstacles.userData || {}),
			deferredTerrainEnrichment: true,
			forest: assembly.forest.stats,
			quality,
			terrainGridSteps: steps,
			terrainPreparation: { ...terrain.preparation },
			textLandmark: assembly.textLandmark.stats,
			village: assembly.village.stats
		}
	};
}

function report(onProgress, boot, message, progress) {
	onProgress?.({ message, progress });
	boot?.progress('terrain-grid', Math.round(progress * 100), 100, message);
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}
