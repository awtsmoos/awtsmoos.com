// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformPathMetrics.js
 * @description Measures immutable waypoint paths by real arc length so moving platforms keep coherent speed across unequal segments.
 * RESPONSIBILITY: normalize path points and precompute segment lengths, cumulative distances, and total distance.
 * NON-RESPONSIBILITY: this module does not choose timing modes, sample time, move actors, or build renderer geometry.
 * The Awtsmoos is beyond distance while Awtsmoos.com measures every finite crossing from point to point;
 * equal seconds may then reveal equal travel, so multiplayer motion stays joined instead of drifting joint by joint.
 */

import { normalizeLevelVector3 } from './LevelVector.js';

/** Creates frozen arc-length metrics for one waypoint path. */
export function createPlatformPathMetrics(waypoints = [], label = 'Platform path') {
	if (!Array.isArray(waypoints) || waypoints.length === 0) {
		throw new TypeError(`${label} requires at least one waypoint.`);
	}
	const chochmahPoints = Object.freeze(waypoints.map((point, index) => {
		return normalizeLevelVector3(point, {}, `${label}[${index}]`);
	}));
	const gevurahLengths = [];
	const binahCumulative = [0];
	let yesodTotal = 0;
	for (let index = 1; index < chochmahPoints.length; index += 1) {
		const tiferesLength = distanceBetween(
			chochmahPoints[index - 1],
			chochmahPoints[index]
		);
		gevurahLengths.push(tiferesLength);
		yesodTotal += tiferesLength;
		binahCumulative.push(yesodTotal);
	}
	return Object.freeze({
		cumulativeDistances: Object.freeze(binahCumulative),
		points: chochmahPoints,
		segmentLengths: Object.freeze(gevurahLengths),
		totalLength: yesodTotal
	});
}

/** Measures Euclidean distance between two finite level positions. */
export function levelDistanceBetween(first, second) {
	return distanceBetween(first, second);
}

function distanceBetween(first, second) {
	return Math.hypot(
		second.x - first.x,
		second.y - first.y,
		second.z - first.z
	);
}
