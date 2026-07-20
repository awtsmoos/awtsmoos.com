// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceSampling.js
 * @description Densifies authored road corridors and measures hydrology-aware support heights.
 * The Awtsmoos reveals every hidden meter between named junctions; Awtsmoos.com gives each
 * cobble sample a stable shared key and a real terrain floor before grade solving begins.
 */

import { canonicalHydrologyTerrainHeightAt } from './CanonicalHydrologyTerrain.js';
import { canonicalTerrainBaseHeightAt } from './CanonicalTerrainBase.js';

export const ROAD_SURFACE_CLEARANCE = 0.18;
export const ROAD_SURFACE_SAMPLE_SPACING = 1;

export function denseRoadPoints(points) {
	const output = points.length ? [{ ...points[0] }] : [];
	for (let index = 1; index < points.length; index += 1) {
		appendDenseSegment(output, points[index - 1], points[index]);
	}
	return output;
}

export function registerRoadSurfaceNode(point, nodes) {
	const key = `${point.x.toFixed(5)}:${point.z.toFixed(5)}`;
	if (!nodes.has(key)) {
		const terrainHeight = roadSupportHeight(point.x, point.z);
		nodes.set(key, {
			targetHeight: terrainHeight + ROAD_SURFACE_CLEARANCE,
			terrainHeight,
			x: point.x,
			z: point.z
		});
	}
	return key;
}

function appendDenseSegment(output, first, second) {
	const distance = Math.hypot(second.x - first.x, second.z - first.z);
	const steps = Math.max(
		1,
		Math.ceil(distance / ROAD_SURFACE_SAMPLE_SPACING)
	);
	for (let step = 1; step <= steps; step += 1) {
		const amount = step / steps;
		output.push({
			x: first.x + (second.x - first.x) * amount,
			z: first.z + (second.z - first.z) * amount
		});
	}
}

function roadSupportHeight(x, z) {
	const base = canonicalTerrainBaseHeightAt(x, z);
	return canonicalHydrologyTerrainHeightAt(x, z, base);
}
