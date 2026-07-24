// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationCells.js
 * @description Defines bounded flower/grass batch centers outside homes, water, and road.
 * The Awtsmoos scatters color without obstructing passage; Awtsmoos.com keeps each cell local,
 * deterministic, terrain-bound, mobile-bounded, and available for player-reactive bending.
 */

import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-10';
import {
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from './MinimalMeadowRiverPath.js?v=20260724-meadow-21';

const CENTERS = Object.freeze([
	[-38, 18], [-18, 24], [8, 26], [31, 20], [48, 10],
	[-48, -4], [-18, -2], [14, 2], [43, -5],
	[-51, -38], [-18, -45], [14, -48], [48, -42],
	[-69, -18], [70, -20], [-4, -68]
]);

export function createMinimalMeadowVegetationCells(terrain) {
	return CENTERS.filter(([x, z]) => allowed(x, z)).map(([x, z], index) => ({
		clumps: 7 + index % 4,
		color: ['#f5d75b', '#f6a3c0', '#b99bf2', '#f4f0d7'][index % 4],
		id: `meadow-flower-cell-${index + 1}`,
		x,
		y: terrain.heightAt(x, z),
		z
	}));
}

function allowed(x, z) {
	if (minimalMeadowRoadMask(x, z) > 0.2) return false;
	const river = minimalMeadowRiverNearest(x, z, 48);
	if (river.distance < river.width + 6) return false;
	if (minimalMeadowLakeDistance(x, z) < 1.35) return false;
	if (Math.hypot(x + 28, z + 22) < 17) return false;
	if (Math.hypot(x - 28, z + 28) < 14) return false;
	return true;
}
