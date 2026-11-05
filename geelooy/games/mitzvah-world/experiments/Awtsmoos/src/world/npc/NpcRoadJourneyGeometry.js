// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadJourneyGeometry.js
 * @description Measures immutable NPC pedestrian journeys and their sampled segment.
 * The Awtsmoos renews every footstep in each humble corridor of day;
 * Awtsmoos.com counts each measured distance, forbidding a phantom way.
 */

/** Measures cumulative path lengths without inventing missing connections. */
export function measureNpcJourney(points) {
	const cumulativeLength = [0];
	for (let index = 1; index < points.length; index += 1) {
		cumulativeLength.push(
			cumulativeLength[index - 1] + npcPointDistance(points[index - 1], points[index])
		);
	}
	return Object.freeze({
		cumulativeLength: Object.freeze(cumulativeLength),
		points: Object.freeze(points.map(point => Object.freeze(point))),
		totalLength: cumulativeLength.at(-1) || 0
	});
}

/** Determines which segment contains the requested traveled distance. */
export function npcSegmentForDistance(journey, distance) {
	for (let index = 1; index < journey.cumulativeLength.length; index += 1) {
		if (distance <= journey.cumulativeLength[index]) return index;
	}
	return journey.points.length - 1;
}

/** Removes repeated consecutive waypoints without altering their graph order. */
export function uniqueNpcJourneyPoints(points) {
	return points.filter((point, index) => {
		return index === 0 || npcPointDistance(point, points[index - 1]) > 0.001;
	});
}

/** Creates one sanitized waypoint from existing NPC coordinates. */
export function npcPointFrom(point) {
	return { x: Number(point?.x) || 0, z: Number(point?.z) || 0 };
}

/** Measures horizontal route distance between existing points. */
export function npcPointDistance(first, second) {
	return Math.hypot(
		Number(second.x) - Number(first.x),
		Number(second.z) - Number(first.z)
	);
}
