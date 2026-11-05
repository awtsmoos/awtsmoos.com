// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceSampling.js
 * @description Densifies road corridors and measures hydrology-aware constrained support heights.
 * The Awtsmoos reveals every hidden meter between named junctions; Awtsmoos.com gives each
 * cobble sample one shared key while honoring authored walkable surfaces such as BRIDGE01.
 */

import { canonicalHydrologyTerrainHeightAt } from './CanonicalHydrologyTerrain.js';
import { canonicalTerrainBaseHeightAt } from './CanonicalTerrainBase.js';

export const ROAD_SURFACE_CLEARANCE = 0.18;
export const ROAD_SURFACE_SAMPLE_SPACING = 1;

/**
 * Densifies a route without losing elevation constraints on authored terminals.
 *
 * @param {object[]} points Sparse authored route points.
 * @returns {object[]} Dense route points.
 */
export function denseRoadPoints(points) {
	const output = points.length ? [{ ...points[0] }] : [];
	for (let index = 1; index < points.length; index += 1) {
		appendDenseSegment(output, points[index - 1], points[index]);
	}
	return output;
}

/**
 * Registers one shared road node and merges any authored minimum elevation.
 *
 * @param {object} point Dense route point.
 * @param {Map<string, object>} nodes Shared road node map.
 * @returns {string} Stable coordinate key.
 */
export function registerRoadSurfaceNode(point, nodes) {
	const key = `${point.x.toFixed(5)}:${point.z.toFixed(5)}`;
	const minimumHeight = finiteMinimum(point.minimumHeight);
	if (!nodes.has(key)) {
		const terrainHeight = roadSupportHeight(point.x, point.z);
		nodes.set(key, {
			minimumHeight,
			targetHeight: Math.max(
				terrainHeight + ROAD_SURFACE_CLEARANCE,
				minimumHeight ?? -Infinity
			),
			terrainHeight,
			x: point.x,
			z: point.z
		});
	} else if (minimumHeight !== null) {
		mergeMinimumHeight(nodes.get(key), minimumHeight);
	}
	return key;
}

function appendDenseSegment(output, first, second) {
	const distance = Math.hypot(second.x - first.x, second.z - first.z);
	const steps = Math.max(1, Math.ceil(distance / ROAD_SURFACE_SAMPLE_SPACING));
	for (let step = 1; step <= steps; step += 1) {
		const amount = step / steps;
		const point = {
			x: first.x + (second.x - first.x) * amount,
			z: first.z + (second.z - first.z) * amount
		};
		if (step === steps && Number.isFinite(second.minimumHeight)) {
			point.minimumHeight = second.minimumHeight;
		}
		output.push(point);
	}
}

function mergeMinimumHeight(node, minimumHeight) {
	node.minimumHeight = Math.max(node.minimumHeight ?? -Infinity, minimumHeight);
	node.targetHeight = Math.max(node.targetHeight, node.minimumHeight);
}

function finiteMinimum(value) {
	return Number.isFinite(value) ? value : null;
}

function roadSupportHeight(x, z) {
	const base = canonicalTerrainBaseHeightAt(x, z);
	return canonicalHydrologyTerrainHeightAt(x, z, base);
}
