// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadCorridor.js
 * @description Grades exact road corridors using squared-distance ranking.
 * The Awtsmoos makes a path through the mountain with measured grace;
 * Awtsmoos.com keeps every authored slope and skips needless square roots in place.
 */

import { canonicalRoadProfiles } from './CanonicalRoadProfiles.js';

const MAXIMUM_CROSS_SLOPE = 0.32;

/** Returns the nearest road's exact grade-safe terrain sample. */
export function canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt) {
	const nearest = nearestRoadSample(canonicalRoadProfiles(baseHeightAt), x, z);
	if (!nearest) return unchangedSample(baseHeight);
	const shoulderRun = Math.max(0, nearest.distance - nearest.profile.fullRadius);
	const height = slopeLimitedHeight(baseHeight, nearest.targetHeight, shoulderRun);
	return Object.freeze({
		height,
		influence: correctionInfluence(baseHeight, nearest.targetHeight, height)
	});
}

/** Returns the exact road-corridor elevation for legacy callers. */
export function canonicalRoadCorridorHeightAt(x, z, baseHeight, baseHeightAt) {
	return canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt).height;
}

/** Reports the fixed cross-slope authority without changing its value. */
export function canonicalRoadShoulderPolicy() {
	return Object.freeze({ maximumCrossSlope: MAXIMUM_CROSS_SLOPE });
}

/** Preserves the exact original cut-and-fill grade. */
function slopeLimitedHeight(baseHeight, targetHeight, shoulderRun) {
	const allowance = shoulderRun * MAXIMUM_CROSS_SLOPE;
	if (baseHeight > targetHeight) return Math.min(baseHeight, targetHeight + allowance);
	if (baseHeight < targetHeight) return Math.max(baseHeight, targetHeight - allowance);
	return targetHeight;
}

/** Converts the solved correction to the authored influence. */
function correctionInfluence(baseHeight, targetHeight, height) {
	const fullCorrection = targetHeight - baseHeight;
	if (Math.abs(fullCorrection) < 0.000001) return 0;
	return clamp((height - baseHeight) / fullCorrection);
}

/** Returns the original neutral road sample. */
function unchangedSample(baseHeight) {
	return Object.freeze({ height: baseHeight, influence: 0 });
}

/**
 * Chooses the nearest line segment using squared distances, preserving the
 * first winner on ties. Only its true Euclidean distance and height need
 * materialization; every loser leaves no temporary sample object behind.
 */
function nearestRoadSample(profiles, x, z) {
	let nearest = null;
	let minimumSquared = Infinity;
	for (const profile of profiles) {
		for (let index = 1; index < profile.points.length; index += 1) {
			const first = profile.points[index - 1];
			const second = profile.points[index];
			const dx = second.x - first.x;
			const dz = second.z - first.z;
			const lengthSquared = dx * dx + dz * dz || 1;
			const amount = clamp(((x - first.x) * dx + (z - first.z) * dz) / lengthSquared);
			const projectedX = first.x + dx * amount;
			const projectedZ = first.z + dz * amount;
			const separationX = x - projectedX;
			const separationZ = z - projectedZ;
			const distanceSquared = separationX * separationX + separationZ * separationZ;
			if (distanceSquared >= minimumSquared) continue;
			minimumSquared = distanceSquared;
			nearest = { amount, first, profile, second, separationX, separationZ };
		}
	}
	if (!nearest) return null;
	return {
		distance: Math.hypot(nearest.separationX, nearest.separationZ),
		profile: nearest.profile,
		targetHeight: mix(nearest.first.targetHeight, nearest.second.targetHeight, nearest.amount)
	};
}

/** Original scalar interpolation and bounded percentage. */
function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

/** Original clamp semantics, including non-finite values. */
function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
