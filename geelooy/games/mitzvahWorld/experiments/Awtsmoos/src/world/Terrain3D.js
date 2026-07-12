// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import {
	createTerrainGeometry,
	terrainHeightAt
} from './TerrainGeometry.js';
import { createTerrainMesh } from './TerrainMesh.js';
import { createTerrainStats } from './TerrainStats.js';
import { createProceduralForest } from './trees/ProceduralForestSystem.js';
import { createVillageWorldDefinitions } from './village/VillageWorldSystem.js';

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';

export const GRASS_URLS = [`${FULL}grass%201.png`, `${HALF}grass%201.png`];
export const DIRT_URLS = [TEXTURE_URLS.terrain.dirtGrass3, TEXTURE_URLS.terrain.dirt1];
export const REAL_GRASS_URL = GRASS_URLS[0];
export const heightAt = terrainHeightAt;

/** Builds terrain, road, houses, forest, water, and an authored procedural village. */
export function createTerrainPackage(obstacles, grassImage, dirtImage, groundSampler) {
	const terrain = createTerrainGeometry();
	const road = houseRoadSystem(obstacles.assets || {}, groundSampler, obstacles);
	const roadColliders = primitiveColliders(road.visual);
	const obstacleColliders = obstacles.flatMap(primitiveColliders);
	const village = createVillageWorldDefinitions(groundSampler);
	const villageColliders = village.definitions.flatMap(primitiveColliders);
	const forest = createProceduralForest({
		groundSampler,
		roadTriangles: roadColliders,
		obstacleTriangles: [...obstacleColliders, ...villageColliders],
		halfSize: terrain.size / 2 - 20
	});
	const group = new Group();
	group.name = 'Awtsmoos_Eretz_full_village_water_forest_houses';
	group.add(createTerrainMesh(terrain, grassImage, dirtImage, REAL_GRASS_URL));
	group.add(createPrimitiveMesh(road.visual));
	for (const definition of obstacles) addDefinition(group, definition);
	for (const definition of village.definitions) addDefinition(group, definition);
	group.add(forest.group);
	const stats = createTerrainStats({
		terrain,
		road,
		roadColliders,
		obstacleColliders: [...obstacleColliders, ...villageColliders],
		obstacles,
		grassImage,
		sampler: groundSampler
	});
	stats.terrainMix = {
		grassAndDirt: !!grassImage && !!dirtImage,
		sameRepeat: true,
		patchShader: 'world-space-mix()'
	};
	stats.forestStats = forest.stats;
	stats.village = village.stats;
	return {
		group,
		colliders: [
			...terrain.colliders,
			...roadColliders,
			...obstacleColliders,
			...villageColliders,
			...forest.colliders
		],
		heightAt,
		stats,
		roadStats: road.stats,
		forest,
		village,
		worldMetadata: {
			...(obstacles.userData || {}),
			forest: forest.stats,
			village: village.stats
		}
	};
}

function addDefinition(group, definition) {
	group.add(createPrimitiveMesh(definition));
	if (!definition.noEdge) group.add(createEdgeOverlay(definition));
}
