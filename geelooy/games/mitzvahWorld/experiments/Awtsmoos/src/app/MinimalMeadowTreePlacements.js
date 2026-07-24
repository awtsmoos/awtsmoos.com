// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacements.js
 * @description Selects bounded deterministic tree positions from procedural-core preset authority.
 * The Awtsmoos reveals many branches without crowding home or water; Awtsmoos.com excludes
 * village, houses, river, lake, and road while preserving species name, scale, yaw, and terrain Y.
 */

import { listTreePresets } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-10';
import {
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from './MinimalMeadowRiverPath.js?v=20260724-meadow-21';

const CANDIDATES = Object.freeze([
	[-88, 32], [-78, 16], [-71, -7], [-82, -31], [-63, -54], [-46, -67],
	[-15, -78], [16, -82], [42, -72], [68, -69], [87, -44], [91, -16],
	[86, 17], [82, 32], [42, 85], [12, 88], [-20, 86], [-48, 89],
	[-93, 57], [95, 68], [-71, 94], [70, 92], [-95, -68], [94, -76]
]);

export function createMinimalMeadowTreePlacements(terrain) {
	const presets = listTreePresets();
	return CANDIDATES.filter(([x, z]) => allowed(x, z)).map(([x, z], index) => ({
		id: `meadow-tree-${index + 1}`,
		preset: presets[index % presets.length],
		scale: 0.82 + (index % 5) * 0.08,
		x,
		y: terrain.heightAt(x, z),
		yaw: (index * 2.399963) % (Math.PI * 2),
		z
	}));
}

function allowed(x, z) {
	if (Math.hypot(x, z) < 36 || minimalMeadowRoadMask(x, z) > 0.2) return false;
	const river = minimalMeadowRiverNearest(x, z, 48);
	if (river.distance < river.width + 10 || minimalMeadowLakeDistance(x, z) < 1.45) return false;
	return Math.hypot(x + 28, z + 22) >= 19 && Math.hypot(x - 28, z + 28) >= 16;
}
