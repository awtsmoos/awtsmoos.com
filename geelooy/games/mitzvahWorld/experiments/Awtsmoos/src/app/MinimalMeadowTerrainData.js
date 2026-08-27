// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainData.js
 * @description Builds full-quality visual terrain with a bounded analytic collision lattice.
 * The Awtsmoos renews every visible vertex while Awtsmoos.com removes redundant collision
 * triangles, preserving exact height truth, textures, roads, zones, and the enlarged 360-unit field.
 */

import { v } from '../math/Geometry3D.js';
import { buildTerrainIndices } from '../world/TerrainGeometryIndices.js';
import { buildTerrainNormals } from '../world/TerrainGeometryNormals.js';
import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-11';
import {
	createMinimalMeadowTerrainCollisionData
} from './MinimalMeadowTerrainCollisionData.js';
import {
	createMinimalMeadowTerrainEvidence,
	normalizeMinimalMeadowDimensions
} from './MinimalMeadowTerrainDataSupport.js';
import {
	minimalMeadowHeightAt,
	minimalMeadowZoneAt
} from './MinimalMeadowTerrainShape.js?v=20260727-expanded-world-1';
import { MINIMAL_MEADOW_WORLD } from './MinimalMeadowWorldBounds.js';

export const MINIMAL_MEADOW_SIZE = MINIMAL_MEADOW_WORLD.size;
export const MINIMAL_MEADOW_STEPS = MINIMAL_MEADOW_WORLD.steps;

export function buildMinimalMeadowTerrainData(options = {}) {
	const terrainData = createMinimalMeadowTerrainData(
		options.size,
		options.steps,
		options.collisionSteps
	);
	return {
		...terrainData,
		collider: terrainData.colliders,
		heightAt: minimalMeadowHeightAt,
		stats: terrainData.AwtsmoosTerrainValley
	};
}

export function createMinimalMeadowTerrainData(
	size = MINIMAL_MEADOW_SIZE,
	steps = MINIMAL_MEADOW_STEPS,
	collisionSteps = null
) {
	const dimensions = normalizeMinimalMeadowDimensions(
		size,
		steps,
		MINIMAL_MEADOW_SIZE,
		MINIMAL_MEADOW_STEPS
	);
	const visual = createVisualTerrain(dimensions);
	const indices = buildTerrainIndices(dimensions.steps);
	const collision = createMinimalMeadowTerrainCollisionData(
		dimensions.size,
		dimensions.steps,
		collisionSteps
	);
	const terrainEvidence = createMinimalMeadowTerrainEvidence({
		indices,
		roadMasks: visual.roadMasks,
		size: dimensions.size,
		steps: dimensions.steps,
		vertices: visual.vertices,
		zones: visual.zones
	});
	return {
		AwtsmoosTerrainValley: Object.freeze({
			...terrainEvidence,
			cellWidth: dimensions.size / dimensions.steps,
			colliderTriangles: collision.triangleCount,
			collisionCellWidth: collision.cellWidth,
			collisionGrid: `${collision.steps}x${collision.steps}`,
			collisionSampling: 'bounded-analytic-height-lattice',
			collisionSteps: collision.steps,
			visualTriangles: indices.length / 3,
			worldContract: MINIMAL_MEADOW_WORLD
		}),
		colliders: collision.colliders,
		indices,
		normals: buildTerrainNormals(visual.vertices, indices),
		roadMasks: visual.roadMasks,
		size: dimensions.size,
		steps: dimensions.steps,
		uvs: visual.uvs,
		vertices: visual.vertices,
		zones: visual.zones
	};
}

function createVisualTerrain(dimensions) {
	const vertices = [];
	const uvs = [];
	const zones = [];
	const roadMasks = [];
	const half = dimensions.size / 2;
	for (let row = 0; row <= dimensions.steps; row += 1) {
		for (let column = 0; column <= dimensions.steps; column += 1) {
			const x = column / dimensions.steps * dimensions.size - half;
			const z = row / dimensions.steps * dimensions.size - half;
			const y = minimalMeadowHeightAt(x, z);
			vertices.push(v(x, y, z));
			uvs.push(column / dimensions.steps, row / dimensions.steps);
			zones.push(minimalMeadowZoneAt(x, z, y));
			roadMasks.push(minimalMeadowRoadMask(x, z));
		}
	}
	return { roadMasks, uvs, vertices, zones };
}
