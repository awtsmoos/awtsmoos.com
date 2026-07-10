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

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';

export const GRASS_URLS = [`${FULL}grass%201.png`, `${HALF}grass%201.png`];
export const DIRT_URLS = [TEXTURE_URLS.terrain.dirtGrass3, TEXTURE_URLS.terrain.dirt1];
export const REAL_GRASS_URL = GRASS_URLS[0];
export const heightAt = terrainHeightAt;

/** Builds terrain, roads, and static obstacles exactly once. */
export function createTerrainPackage(obstacles, grassImage, _unusedDirtImage, groundSampler) {
	const terrain = createTerrainGeometry();
	const road = houseRoadSystem(obstacles.assets || {}, groundSampler);
	const roadColliders = road.colliders.flatMap(primitiveColliders);
	const obstacleColliders = obstacles.flatMap(primitiveColliders);
	const group = new Group();
	group.name = 'Awtsmoos_Eretz_single_full_resolution_grass';
	group.add(createTerrainMesh(terrain, grassImage, REAL_GRASS_URL));
	group.add(createPrimitiveMesh(road.visual));
	for (const definition of obstacles) {
		group.add(createPrimitiveMesh(definition));
		if (!definition.noEdge) {
			group.add(createEdgeOverlay(definition));
		}
	}
	const stats = createTerrainStats({
		terrain,
		road,
		roadColliders,
		obstacleColliders,
		obstacles,
		grassImage,
		sampler: groundSampler
	});
	return {
		group,
		colliders: [...terrain.colliders, ...roadColliders, ...obstacleColliders],
		heightAt,
		stats,
		roadStats: road.stats,
		worldMetadata: obstacles.userData || {}
	};
}
