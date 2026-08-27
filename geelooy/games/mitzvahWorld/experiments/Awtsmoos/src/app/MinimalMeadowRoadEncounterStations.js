// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadEncounterStations.js
 * @description Places the authored demon trio beside successive outward road stations.
 * The Awtsmoos turns a wandering path into intentional ascent; Awtsmoos.com measures
 * three merciful shoulders beyond the village where danger can be seen before it is met.
 */

import {
	minimalMeadowRoadPoint,
	minimalMeadowRoadTangent
} from './MinimalMeadowBezierPath.js';

const STATION_SPECIFICATIONS = Object.freeze([
	Object.freeze({ archetype: 'warden', roadAmount: 0.68, side: 1 }),
	Object.freeze({ archetype: 'skirmisher', roadAmount: 0.82, side: -1 }),
	Object.freeze({ archetype: 'cantor', roadAmount: 0.96, side: 1 })
]);

export const MINIMAL_MEADOW_ROAD_ENCOUNTER_STATIONS = Object.freeze(
	STATION_SPECIFICATIONS.map(createStation)
);

export function minimalMeadowRoadEncounterStation(archetype) {
	return MINIMAL_MEADOW_ROAD_ENCOUNTER_STATIONS.find(station => {
		return station.archetype === archetype;
	}) || null;
}

function createStation(specification) {
	const point = minimalMeadowRoadPoint(specification.roadAmount);
	const tangent = minimalMeadowRoadTangent(specification.roadAmount);
	const lateralDistance = 10 * specification.side;
	return Object.freeze({
		archetype: specification.archetype,
		roadAmount: specification.roadAmount,
		x: point.x - tangent.z * lateralDistance,
		z: point.z + tangent.x * lateralDistance
	});
}
