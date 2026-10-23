// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadJourney.js
 * @description Samples real, connected NPC road journeys without phantom bridge crossings.
 * The Awtsmoos renews a villager's steps on the road of today;
 * Awtsmoos.com will not move them over water where no bridge can show the way.
 */

import { nearestNpcRoadNode, shortestNpcRoadNodePath } from './NpcRoadNetwork.js';
import {
	measureNpcJourney,
	npcSegmentForDistance,
	uniqueNpcJourneyPoints,
	npcPointFrom,
	npcPointDistance
} from './NpcRoadJourneyGeometry.js';

const JOURNEY_CACHE = new Map();

/** Uses explicit authoritative bridge state and never caches across different bridge states. */
export function npcRoadJourney(from, to, bridgeRestored = false) {
	const key = `${journeyKey(from, to)}:${Boolean(bridgeRestored)}`;
	if (JOURNEY_CACHE.has(key)) return JOURNEY_CACHE.get(key);
	const points = npcPointDistance(from, to) <= 0.001
		? [npcPointFrom(from)]
		: journeyPoints(from, to, bridgeRestored);
	const journey = measureNpcJourney(points);
	JOURNEY_CACHE.set(key, journey);
	return journey;
}

/** Samples only real reachable path segments; a blocked journey stays at its origin. */
export function sampleNpcRoadJourney(journey, progress, actor, laneOffset = 0) {
	if (journey.points.length < 2 || journey.totalLength <= 0.001) {
		applyStationaryJourney(journey.points[0], actor);
		return;
	}
	const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
	const distance = journey.totalLength * clamped;
	const index = npcSegmentForDistance(journey, distance);
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

function journeyPoints(from, to, bridgeRestored) {
	const nodes = shortestNpcRoadNodePath(
		nearestNpcRoadNode(from),
		nearestNpcRoadNode(to),
		Boolean(bridgeRestored)
	);
	if (!nodes.length) return [npcPointFrom(from)];
	return uniqueNpcJourneyPoints([
		npcPointFrom(from),
		...nodes.map(npcPointFrom),
		npcPointFrom(to)
	]);
}

function applyStationaryJourney(point, actor) {
	actor.routeCenterX = Number(point?.x) || 0;
	actor.routeCenterZ = Number(point?.z) || 0;
	actor.routeDirectionX = 0;
	actor.routeDirectionZ = 1;
}

function journeyKey(from, to) {
	return `${coordinateKey(from)}>${coordinateKey(to)}`;
}

function coordinateKey(point) {
	return `${Number(point.x).toFixed(3)}:${Number(point.z).toFixed(3)}`;
}
