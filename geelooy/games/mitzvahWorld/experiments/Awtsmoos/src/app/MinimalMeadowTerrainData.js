// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainData.js
 * @description Samples hills, carved valley, river bed, lake basin, zones, and Bézier road mask.
 * The Awtsmoos joins every vertex to one grounded truth; Awtsmoos.com gives water and road
 * enough resolution while visual height, collision, houses, trees, and flowers remain identical.
 */

import { v } from '../math/Geometry3D.js';
import { buildTerrainColliders, buildTerrainIndices } from '../world/TerrainGeometryIndices.js';
import { buildTerrainNormals } from '../world/TerrainGeometryNormals.js';
import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-11';
import { minimalMeadowHeightAt, minimalMeadowZoneAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';

export const MINIMAL_MEADOW_SIZE = 220;
export const MINIMAL_MEADOW_STEPS = 72;

export function createMinimalMeadowTerrainData(size = MINIMAL_MEADOW_SIZE, steps = MINIMAL_MEADOW_STEPS) {
	const vertices = [];
	const uvs = [];
	const zones = [];
	const roadMasks = [];
	const half = size / 2;
	for (let row = 0; row <= steps; row += 1) {
		for (let column = 0; column <= steps; column += 1) {
			const x = column / steps * size - half;
			const z = row / steps * size - half;
			const y = minimalMeadowHeightAt(x, z);
			vertices.push(v(x, y, z));
			uvs.push(column / steps, row / steps);
			zones.push(minimalMeadowZoneAt(x, z, y));
			roadMasks.push(minimalMeadowRoadMask(x, z));
		}
	}
	const indices = buildTerrainIndices(steps);
	return {
		AwtsmoosTerrainValley: evidence(size, steps, vertices, indices, roadMasks, zones),
		colliders: buildTerrainColliders(vertices, indices),
		indices,
		normals: buildTerrainNormals(vertices, indices),
		roadMasks,
		size,
		steps,
		uvs,
		vertices,
		zones
	};
}

function evidence(size, steps, vertices, indices, roadMasks, zones) {
	const heights = vertices.map(point => point.y);
	return {
		colliderTriangles: indices.length / 3,
		grid: `${steps}x${steps}`,
		heightMaximum: Math.max(...heights),
		heightMinimum: Math.min(...heights),
		lakeVertices: zones.filter(zone => zone === 'lake-basin').length,
		riverVertices: zones.filter(zone => zone === 'river-bank').length,
		roadMaskMaximum: Math.max(...roadMasks),
		roadSystem: 'continuous-cubic-bezier-zone-weight',
		sampling: 'high-density-river-valley-meadow',
		size,
		vertexCount: vertices.length
	};
}
