// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadCorridor.js
 * @description Grades canonical roads into steep terrain with a slope-limited cut-and-fill shoulder.
 * The Awtsmoos lets the road hold its measured grade without becoming a narrow trench or earthen blade;
 * Awtsmoos.com gives every cut and fill enough horizontal breath for the surrounding hillside to fade.
 */

import { canonicalRoadProfiles } from './CanonicalRoadProfiles.js';

const MAXIMUM_CROSS_SLOPE = 0.32;

/**
 * Returns the nearest road's grade-safe terrain sample.
 * The solved road elevation is exact inside the road edge; outside it, terrain returns at bounded cross-slope.
 */
export function canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt) {
	const nearest = nearestRoadSample(
		canonicalRoadProfiles(baseHeightAt),
		x,
		z
	);
	if (!nearest) return unchangedSample(baseHeight);
	const shoulderRun = Math.max(
		0,
		nearest.distance - nearest.profile.fullRadius
	);
	const height = slopeLimitedHeight(
		baseHeight,
		nearest.targetHeight,
		shoulderRun
	);
	return Object.freeze({
		height,
		influence: correctionInfluence(baseHeight, nearest.targetHeight, height)
	});
}

/** Returns only the adjusted road-corridor elevation for legacy callers. */
export function canonicalRoadCorridorHeightAt(x, z, baseHeight, baseHeightAt) {
	return canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		baseHeightAt
	).height;
}

export function canonicalRoadShoulderPolicy() {
	return Object.freeze({ maximumCrossSlope: MAXIMUM_CROSS_SLOPE });
}

function slopeLimitedHeight(baseHeight, targetHeight, shoulderRun) {
	const allowance = shoulderRun * MAXIMUM_CROSS_SLOPE;
	if (baseHeight > targetHeight) {
		return Math.min(baseHeight, targetHeight + allowance);
	}
	if (baseHeight < targetHeight) {
		return Math.max(baseHeight, targetHeight - allowance);
	}
	return targetHeight;
}

function correctionInfluence(baseHeight, targetHeight, height) {
	const fullCorrection = targetHeight - baseHeight;
	if (Math.abs(fullCorrection) < 0.000001) return 0;
	return clamp((height - baseHeight) / fullCorrection);
}

function unchangedSample(baseHeight) {
	return Object.freeze({ height: baseHeight, influence: 0 });
}

function nearestRoadSample(profiles, x, z) {
	let nearest = null;
	for (const profile of profiles) {
		for (let index = 1; index < profile.points.length; index += 1) {
			const sample = segmentSample(
				profile.points[index - 1],
				profile.points[index],
				x,
				z
			);
			if (!nearest || sample.distance < nearest.distance) {
				nearest = { ...sample, profile };
			}
		}
	}
	return nearest;
}

function segmentSample(first, second, x, z) {
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = clamp(
		((x - first.x) * dx + (z - first.z) * dz) / lengthSquared
	);
	const projectedX = first.x + dx * amount;
	const projectedZ = first.z + dz * amount;
	return {
		distance: Math.hypot(x - projectedX, z - projectedZ),
		targetHeight: mix(first.targetHeight, second.targetHeight, amount)
	};
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
