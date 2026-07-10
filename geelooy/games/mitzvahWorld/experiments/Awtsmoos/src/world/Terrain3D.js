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

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';

export const GRASS_URLS = [`${FULL}grass%201.png`, `${HALF}grass%201.png`];
export const DIRT_URLS = [TEXTURE_URLS.terrain.dirtGrass3, TEXTURE_URLS.terrain.dirt1];
export const REAL_GRASS_URL = GRASS_URLS[0];
export const heightAt = terrainHeightAt;

/** Builds terrain, one solid road network, production architecture, and forest. */
export function createTerrainPackage(obstacles, grassImage, dirtImage, groundSampler) {
	const terrain = createTerrainGeometry();
	const road = houseRoadSystem(obstacles.assets || {}, groundSampler, obstacles);
	const roadColliders = primitiveColliders(road.visual);
	const obstacleColliders = obstacles.flatMap(primitiveColliders);
	const forest = createProceduralForest({
		groundSampler,
		roadTriangles: roadColliders,
		obstacleTriangles: obstacleColliders,
		halfSize: terrain.size / 2 - 20
	});
	const group = new Group();
	group.name = 'Awtsmoos_Eretz_grass_dirt_yards_houses_and_forest';
	group.add(createTerrainMesh(terrain, grassImage, dirtImage, REAL_GRASS_URL));
	group.add(createPrimitiveMesh(road.visual));
	for (const definition of obstacles) {
		group.add(createPrimitiveMesh(definition));
		if (!definition.noEdge) group.add(createEdgeOverlay(definition));
	}
	group.add(forest.group);
	const stats = createTerrainStats({
		terrain,
		road,
		roadColliders,
		obstacleColliders,
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
	return {
		group,
		colliders: [
			...terrain.colliders,
			...roadColliders,
			...obstacleColliders,
			...forest.colliders
		],
		heightAt,
		stats,
		roadStats: road.stats,
		forest,
		worldMetadata: {
			...(obstacles.userData || {}),
			forest: forest.stats
		}
	};
}
