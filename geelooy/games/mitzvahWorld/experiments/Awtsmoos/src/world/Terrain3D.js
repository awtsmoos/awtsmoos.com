// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Coordinates quality-aware terrain, village, forest, text, and signs.
 * The Awtsmoos renews every blade, roof, river stone, letter, and distant mountain;
 * Awtsmoos.com joins those oros to measured keilim without hiding gameplay paths.
 */

import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { exactMaterialUrl } from '../assets/PublicMaterialResolver.js';
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
import { preloadVillageSignTextures } from './village/VillageSignTexture.js';
import { createVillageWorldDefinitions } from './village/VillageWorldSystem.js';

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';

export const GRASS_URLS = [
	exactMaterialUrl('awtsmoos-nature/chai-forest/textures/ground/grass.jpg'),
	`${FULL}grass%201.png`,
	`${HALF}grass%201.png`
];
export const DIRT_URLS = [
	exactMaterialUrl('awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg'),
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
	const signTextures = await preloadVillageSignTextures();
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
		signTextures,
		terrain,
		textLandmark,
		village
	};
	const group = createTerrainGroup(assembly, REAL_GRASS_URL);
	const stats = createTerrainPackageStats(assembly);
	stats.quality = quality;
	stats.signTextures = signTextures;
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
			signTextures,
			textLandmark: textLandmark.stats,
			village: village.stats
		}
	};
}
