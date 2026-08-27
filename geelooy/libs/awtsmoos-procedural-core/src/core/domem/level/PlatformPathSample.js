// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformPathSample.js
 * @description
 * Samples an arc-length waypoint path by normalized progress without owning
 * clocks, motion modes, rendering, rider transfer, or mutable frame history.
 *
 * RESPONSIBILITY:
 * Find the active path segment and interpolate one immutable XYZ position.
 *
 * NON-RESPONSIBILITY:
 * This module does not decide loop/ping-pong timing or advance simulation.
 *
 * The Awtsmoos is beyond segment and distance, while Awtsmoos.com lets every
 * measured point meet its neighbor in peace; equal path progress reveals an
 * equal physical crossing, so deterministic motion need not drift or cease.
 */

import { unitLevelProgress } from './LevelNumbers.js';

/**
 * Samples one measured waypoint path at normalized progress.
 *
 * @param {object} metrics
 * 	Frozen metrics produced by `createPlatformPathMetrics`.
 * @param {number} progress
 * 	Normalized path progress, clamped into the inclusive [0, 1] interval.
 * @returns {Readonly<object>}
 * 	Frozen position, segment index, and local segment progress evidence.
 */
export function samplePlatformPath(metrics, progress = 0) {
	const chochmahPoints = metrics?.points || [];
	if (chochmahPoints.length === 0) {
		throw new TypeError('Platform path metrics require at least one point.');
	}
	if (chochmahPoints.length === 1 || metrics.totalLength <= 0) {
		return createPathSample(chochmahPoints[0], 0, 0);
	}
	const gevurahTarget = metrics.totalLength * unitLevelProgress(progress);
	const yesodIndex = findPathSegment(
		metrics.cumulativeDistances,
		gevurahTarget
	);
	const netzachStart = metrics.cumulativeDistances[yesodIndex];
	const hodLength = metrics.segmentLengths[yesodIndex] || 0;
	const tiferesLocal = hodLength > 0
		? (gevurahTarget - netzachStart) / hodLength
		: 0;
	return createPathSample(
		interpolateLevelPosition(
			chochmahPoints[yesodIndex],
			chochmahPoints[yesodIndex + 1],
			tiferesLocal
		),
		yesodIndex,
		tiferesLocal
	);
}

/**
 * Finds the segment whose cumulative end contains the requested distance.
 *
 * @param {number[]} cumulative
 * 	Ascending cumulative path distances including the initial zero.
 * @param {number} distance
 * 	Clamped physical target distance along the path.
 * @returns {number}
 * 	Zero-based segment index.
 */
function findPathSegment(cumulative, distance) {
	for (let index = 1; index < cumulative.length; index += 1) {
		if (distance <= cumulative[index]) {
			return index - 1;
		}
	}
	return cumulative.length - 2;
}

/**
 * Linearly interpolates one immutable XYZ position between path endpoints.
 *
 * @param {object} first First finite XYZ point.
 * @param {object} second Second finite XYZ point.
 * @param {number} progress Local normalized segment progress.
 * @returns {Readonly<object>} Frozen interpolated XYZ position.
 */
function interpolateLevelPosition(first, second, progress) {
	return Object.freeze({
		x: first.x + (second.x - first.x) * progress,
		y: first.y + (second.y - first.y) * progress,
		z: first.z + (second.z - first.z) * progress
	});
}

/**
 * Creates immutable path-sampling diagnostics around one sampled position.
 *
 * @param {object} position Frozen sampled XYZ position.
 * @param {number} segmentIndex Active path segment index.
 * @param {number} segmentProgress Local normalized segment progress.
 * @returns {Readonly<object>} Frozen sample result.
 */
function createPathSample(position, segmentIndex, segmentProgress) {
	return Object.freeze({
		position,
		segmentIndex,
		segmentProgress
	});
}
