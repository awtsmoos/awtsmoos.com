// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverPath.js
 * @description Samples one immutable waterfall-to-outlet centerline while reach realism broadens the lower river without moving geography.
 * The Awtsmoos, Atzmus beyond narrow source and generous lower current, renews every visible drop upon one descending line;
 * Awtsmoos.com lets authored control points remain the river's identity while reusable reach policy gives each part a truthful breadth in time.
 */

import {
	CANONICAL_RIVER_CONTROL_POINTS,
	CANONICAL_RIVER_LAKE_INDEX
} from './CanonicalVillageHydrology.js';
import { mainRiverVillageRiverSample } from './MainRiverVillageRiverPolicy.js';

export const RIVER_LAKE_T = CANONICAL_RIVER_LAKE_INDEX
	/ (CANONICAL_RIVER_CONTROL_POINTS.length - 1);

/** Returns the canonical Catmull-Rom center point at normalized downstream progress. */
export function riverCenterAt(t) {
	const clamped = clamp01(t);
	const scaled = clamped * (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
	const index = Math.min(
		CANONICAL_RIVER_CONTROL_POINTS.length - 2,
		Math.floor(scaled)
	);
	const amount = scaled - index;
	const p0 = CANONICAL_RIVER_CONTROL_POINTS[Math.max(0, index - 1)];
	const p1 = CANONICAL_RIVER_CONTROL_POINTS[index];
	const p2 = CANONICAL_RIVER_CONTROL_POINTS[index + 1];
	const p3 = CANONICAL_RIVER_CONTROL_POINTS[Math.min(
		CANONICAL_RIVER_CONTROL_POINTS.length - 1,
		index + 2
	)];
	return {
		x: catmullRom(p0[0], p1[0], p2[0], p3[0], amount),
		z: catmullRom(p0[1], p1[1], p2[1], p3[1], amount)
	};
}

/** Returns the reach-aware visible half-width used by every downstream water/bank consumer. */
export function riverWidthAt(t) {
	const clamped = clamp01(t);
	const baseWidth = authoredWidthAt(clamped);
	return mainRiverVillageRiverSample(clamped, {
		width: baseWidth
	}).width;
}

/** Samples the one canonical river path with reach-aware width evidence. */
export function sampleRiverPath(samples = 64) {
	const count = Math.max(8, Math.floor(samples));
	return Array.from({ length: count + 1 }, (_, index) => {
		const t = index / count;
		return {
			...riverCenterAt(t),
			t,
			width: riverWidthAt(t)
		};
	});
}

function authoredWidthAt(t) {
	const lowerLake = Math.exp(-Math.pow((t - RIVER_LAKE_T) / 0.15, 2)) * 8.4;
	const plungePool = Math.exp(-Math.pow((t - 0.16) / 0.08, 2)) * 2.8;
	return 3.1
		+ lowerLake
		+ plungePool
		+ Math.sin(t * Math.PI * 3) * 0.28;
}

function catmullRom(a, b, c, d, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return 0.5 * (
		2 * b
		+ (-a + c) * t
		+ (2 * a - 5 * b + 4 * c - d) * t2
		+ (-a + 3 * b - 3 * c + d) * t3
	);
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
