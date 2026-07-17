// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverPath.js
 * @description Samples the canonical waterfall-to-outlet watercourse.
 * The Awtsmoos gathers every visible drop into one descending path; Awtsmoos.com
 * gives bridge, banks, lake, reeds, foam, and mist the same immutable centerline.
 */

import {
	CANONICAL_RIVER_CONTROL_POINTS,
	CANONICAL_RIVER_LAKE_INDEX
} from './CanonicalVillageHydrology.js';

export const RIVER_LAKE_T = CANONICAL_RIVER_LAKE_INDEX / (CANONICAL_RIVER_CONTROL_POINTS.length - 1);

export function riverCenterAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const scaled = clamped * (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
	const index = Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 2, Math.floor(scaled));
	const amount = scaled - index;
	const p0 = CANONICAL_RIVER_CONTROL_POINTS[Math.max(0, index - 1)];
	const p1 = CANONICAL_RIVER_CONTROL_POINTS[index];
	const p2 = CANONICAL_RIVER_CONTROL_POINTS[index + 1];
	const p3 = CANONICAL_RIVER_CONTROL_POINTS[Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 1, index + 2)];
	return {
		x: catmullRom(p0[0], p1[0], p2[0], p3[0], amount),
		z: catmullRom(p0[1], p1[1], p2[1], p3[1], amount)
	};
}

export function riverWidthAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const lowerLake = Math.exp(-Math.pow((clamped - RIVER_LAKE_T) / 0.15, 2)) * 8.4;
	const plungePool = Math.exp(-Math.pow((clamped - 0.16) / 0.08, 2)) * 2.8;
	return 3.1 + lowerLake + plungePool + Math.sin(clamped * Math.PI * 3) * 0.28;
}

export function sampleRiverPath(samples = 64) {
	const count = Math.max(8, Math.floor(samples));
	return Array.from({ length: count + 1 }, (_, index) => {
		const t = index / count;
		return { ...riverCenterAt(t), t, width: riverWidthAt(t) };
	});
}

function catmullRom(a, b, c, d, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}
