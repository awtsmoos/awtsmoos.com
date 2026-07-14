// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Coordinates quality-aware terrain, village, forest, and text geometry.
 * The Awtsmoos renews every blade, roof, river stone, and mountain beyond device limits;
 * Awtsmoos.com joins those oros to a measured quality keili without hiding gameplay paths.
 */

import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { primitiveColliders } from './Box3D.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import { createProceduralTextLandmark } from './proceduralText/ProceduralTextLandmarkSystem.js';
import { createTerrainGroup } from './TerrainGroupAssembly.js';
import {
	createTerrainGeometry,
	terrainHeightAt
} from './TerrainGeometry.js';
import { createTerrainPackageStats } from './TerrainPackageStatistics.js';
import { createProceduralForest } from './trees/ProceduralForestSystem.js';
import { createVillageWorldDefinitions } from './village/VillageWorldSystem.js';

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';

export const GRASS_URLS = [
	`${FULL}grass%201.png`,
	`${HALF}grass%201.png`
];
export const DIRT_URLS = [
	TEXTURE_URLS.terrain.dirtGrass3,
	TEXTURE_URLS.terrain.dirt1
];
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
	const terrain = createTerrainGeometry();
	const road = houseRoadSystem(
		obstacles.assets || {},
		groundSampler,
		obstacles
	);
	const roadColliders = primitiveColliders(road.visual);
	const obstacleColliders = obstacles.flatMap(primitiveColliders);
	const village = createVillageWorldDefinitions(groundSampler, quality);
	const villageColliders = village.definitions.flatMap(primitiveColliders);
	const textLandmark = await createProceduralTextLandmark(groundSampler);
	const occupiedColliders = [
		...obstacleColliders,
		...villageColliders,
		...textLandmark.colliders
	];
	const forest = createProceduralForest({
		groundSampler,
		halfSize: terrain.size / 2 - 20,
		obstacleTriangles: occupiedColliders,
		quality,
		roadTriangles: roadColliders
	});
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
		terrain,
		textLandmark,
		village
	};
	const group = createTerrainGroup(assembly, REAL_GRASS_URL);
	const stats = createTerrainPackageStats(assembly);
	stats.quality = quality;
	return {
		colliders: [
			...terrain.colliders,
			...roadColliders,
			...occupiedColliders,
			...forest.colliders
		],
		forest,
		group,
		heightAt,
		roadStats: road.stats,
		stats,
		textLandmark,
		village,
		worldMetadata: {
			...(obstacles.userData || {}),
			forest: forest.stats,
			quality,
			textLandmark: textLandmark.stats,
			village: village.stats
		}
	};
}
