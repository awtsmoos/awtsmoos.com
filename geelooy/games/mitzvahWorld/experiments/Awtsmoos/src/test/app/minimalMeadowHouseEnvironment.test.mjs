// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos.com test keeps fortyfold houses clear of road, river, lake, and spawn. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalMeadowRoadMask } from '../../app/MinimalMeadowBezierPath.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from '../../app/MinimalMeadowRiverPath.js';

const GRID = 24;
const ROAD_LIMIT = 0.12;
const RIVER_MARGIN = 3;
const LAKE_MARGIN = 1.5;

test('every expanded footprint and entry approach avoids occupied terrain', () => {
	for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
		for (const point of footprintPoints(profile)) {
			assert.ok(minimalMeadowRoadMask(point.x, point.z) <= ROAD_LIMIT, evidence(profile, point, 'road'));
			assert.ok(riverMargin(point) >= RIVER_MARGIN, evidence(profile, point, 'river'));
			assert.ok(minimalMeadowLakeDistance(point.x, point.z) >= LAKE_MARGIN, evidence(profile, point, 'lake'));
		}
		for (const point of approachPoints(profile)) {
			assert.ok(minimalMeadowRoadMask(point.x, point.z) <= ROAD_LIMIT, evidence(profile, point, 'approach-road'));
			assert.ok(riverMargin(point) >= RIVER_MARGIN, evidence(profile, point, 'approach-river'));
			assert.ok(minimalMeadowLakeDistance(point.x, point.z) >= LAKE_MARGIN, evidence(profile, point, 'approach-lake'));
		}
	}
});

function footprintPoints(profile) {
	const points = [];
	for (let row = 0; row <= GRID; row += 1) {
		for (let column = 0; column <= GRID; column += 1) {
			points.push({
				x: profile.x + (column / GRID - 0.5) * profile.width,
				z: profile.z + (row / GRID - 0.5) * profile.depth
			});
		}
	}
	return points;
}

function approachPoints(profile) {
	return Array.from({ length: 33 }, (_, index) => ({
		x: profile.x,
		z: profile.z + profile.depth / 2 + index / 2
	}));
}

function riverMargin(point) {
	const river = minimalMeadowRiverNearest(point.x, point.z, 64);
	return river.distance - river.width;
}

function evidence(profile, point, surface) {
	return { house: profile.id, point, surface };
}
