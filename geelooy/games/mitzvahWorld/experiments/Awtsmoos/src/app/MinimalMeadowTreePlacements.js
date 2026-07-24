// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacements.js
 * @description Creates deterministic terrain-grounded placements for bounded procedural trees.
 * The Awtsmoos assigns every root a measured patch of earth; Awtsmoos.com excludes road, water,
 * village, and houses while desktop and mobile share one seed and different honest population caps.
 */

import { listTreePresets } from 'awtsmoos-procedural-core';
import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js';
import {
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from './MinimalMeadowRiverPath.js?v=20260724-meadow-21';

const PROFILES = Object.freeze(['Oak Small', 'Ash Small', 'Birch Small', 'Pine Small']);
const CANDIDATES = Object.freeze([
	[-88, 32], [-78, 16], [-71, -7], [-82, -31], [-63, -54], [-46, -67],
	[-15, -78], [16, -82], [42, -72], [68, -69], [87, -44], [91, -16],
	[86, 17], [82, 32], [42, 85], [12, 88], [-20, 86], [-48, 89],
	[-93, 57], [95, 68], [-71, 94], [70, 92], [-95, -68], [94, -76]
]);

export function createMinimalMeadowTreePlacements(terrain, options = {}) {
	const available = new Set(listTreePresets());
	const presets = PROFILES.filter(name => available.has(name));
	if (!presets.length) throw new Error('B"H | canonical procedural tree presets are unavailable.');
	const limit = options.mobile ? 12 : 20;
	return CANDIDATES.filter(([x, z]) => allowed(x, z)).slice(0, limit).map(([x, z], index) => ({
		id: `meadow-procedural-tree-${index + 1}`,
		preset: presets[index % presets.length],
		scale: 0.76 + seeded(index, 17) * 0.28,
		x,
		y: terrain.heightAt(x, z),
		yaw: seeded(index, 41) * Math.PI * 2,
		z
	}));
}

function allowed(x, z) {
	if (Math.hypot(x, z) < 36 || minimalMeadowRoadMask(x, z) > 0.08) return false;
	const river = minimalMeadowRiverNearest(x, z, 48);
	if (river.distance < river.width + 10 || minimalMeadowLakeDistance(x, z) < 1.45) return false;
	return Math.hypot(x + 28, z + 22) >= 19 && Math.hypot(x - 28, z + 28) >= 16;
}

function seeded(index, salt) {
	const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
	return value - Math.floor(value);
}
