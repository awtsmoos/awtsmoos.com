// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadJourney.js
 * @description Measures and samples cached journeys over the canonical pedestrian graph.
 * The Awtsmoos reveals a living line between home and duty; Awtsmoos.com lets the route
 * be solved once, then sampled without transient objects inside the animation frame.
 */

import {
	nearestNpcRoadNode,
	shortestNpcRoadNodePath
} from './NpcRoadNetwork.js';

const JOURNEY_CACHE = new Map();

/** Returns one immutable, length-measured journey between canonical life anchors. */
export function npcRoadJourney(from, to) {
	const key = journeyKey(from, to);
	if (JOURNEY_CACHE.has(key)) return JOURNEY_CACHE.get(key);
	const points = samePoint(from, to)
		? [pointFrom(from)]
		: journeyPoints(from, to);
	const journey = measureJourney(points);
	JOURNEY_CACHE.set(key, journey);
	return journey;
}

/** Samples a journey into actor route fields without allocating a position object. */
export function sampleNpcRoadJourney(journey, progress, actor, laneOffset = 0) {
	if (journey.points.length < 2 || journey.totalLength <= 0.001) {
		applyStationaryJourney(journey.points[0], actor);
		return;
	}
	const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
	const distance = journey.totalLength * clamped;
	const index = segmentForDistance(journey, distance);
	const from = journey.points[index - 1];
	const to = journey.points[index];
	const start = journey.cumulativeLength[index - 1];
	const length = Math.max(0.000001, journey.cumulativeLength[index] - start);
	const local = Math.max(0, Math.min(1, (distance - start) / length));
	const directionX = (to.x - from.x) / length;
	const directionZ = (to.z - from.z) / length;
	const offset = laneOffset * Math.sin(Math.PI * clamped);
	actor.routeCenterX = from.x + (to.x - from.x) * local - directionZ * offset;
	actor.routeCenterZ = from.z + (to.z - from.z) * local + directionX * offset;
	actor.routeDirectionX = directionX;
	actor.routeDirectionZ = directionZ;
}

function journeyPoints(from, to) {
	const nodes = shortestNpcRoadNodePath(
		nearestNpcRoadNode(from),
		nearestNpcRoadNode(to)
	);
	return deduplicatePoints([
		pointFrom(from),
		...nodes.map(pointFrom),
		pointFrom(to)
	]);
}

function applyStationaryJourney(point, actor) {
	actor.routeCenterX = Number(point?.x) || 0;
	actor.routeCenterZ = Number(point?.z) || 0;
	actor.routeDirectionX = 0;
	actor.routeDirectionZ = 1;
}

function measureJourney(points) {
	const cumulativeLength = [0];
	for (let index = 1; index < points.length; index += 1) {
		cumulativeLength.push(
			cumulativeLength[index - 1] + pointDistance(points[index - 1], points[index])
		);
	}
	return Object.freeze({
		cumulativeLength: Object.freeze(cumulativeLength),
		points: Object.freeze(points.map(point => Object.freeze(point))),
		totalLength: cumulativeLength.at(-1) || 0
	});
}

function segmentForDistance(journey, distance) {
	for (let index = 1; index < journey.cumulativeLength.length; index += 1) {
		if (distance <= journey.cumulativeLength[index]) return index;
	}
	return journey.points.length - 1;
}

function deduplicatePoints(points) {
	return points.filter((point, index) => {
		return index === 0 || pointDistance(point, points[index - 1]) > 0.001;
	});
}

function samePoint(first, second) {
	return pointDistance(first, second) <= 0.001;
}

function journeyKey(from, to) {
	return `${coordinateKey(from)}>${coordinateKey(to)}`;
}

function coordinateKey(point) {
	return `${Number(point.x).toFixed(3)}:${Number(point.z).toFixed(3)}`;
}

function pointFrom(point) {
	return { x: Number(point.x) || 0, z: Number(point.z) || 0 };
}

function pointDistance(first, second) {
	return Math.hypot(
		Number(second.x) - Number(first.x),
		Number(second.z) - Number(first.z)
	);
}
