// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadCorridor.js
 * @description Measures and blends the nearest graph-consistent canonical road segment.
 * The Awtsmoos carries one height through each shared junction; Awtsmoos.com exposes both
 * elevation and influence so traversable road centers remain authoritative near foundations.
 */

import { canonicalRoadProfiles } from './CanonicalRoadProfiles.js';

/**
 * Returns the complete road-corridor sample at one world coordinate.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} baseHeight Unmodified terrain height.
 * @param {Function} baseHeightAt Unmodified terrain callback.
 * @returns {Readonly<{height: number, influence: number}>} Corridor sample.
 */
export function canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt) {
	const nearest = nearestRoadSample(
		canonicalRoadProfiles(baseHeightAt),
		x,
		z
	);
	if (!nearest) {
		return Object.freeze({
			height: baseHeight,
			influence: 0
		});
	}
	const influence = 1 - smooth(
		nearest.profile.fullRadius,
		nearest.profile.softRadius,
		nearest.distance
	);
	return Object.freeze({
		height: mix(baseHeight, nearest.targetHeight, influence),
		influence
	});
}

/**
 * Returns only the adjusted corridor elevation for legacy callers.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} baseHeight Unmodified terrain height.
 * @param {Function} baseHeightAt Unmodified terrain callback.
 * @returns {number} Road-corridor elevation.
 */
export function canonicalRoadCorridorHeightAt(x, z, baseHeight, baseHeightAt) {
	return canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		baseHeightAt
	).height;
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
				nearest = {
					...sample,
					profile
				};
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
		targetHeight: mix(
			first.targetHeight,
			second.targetHeight,
			amount
		)
	};
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
