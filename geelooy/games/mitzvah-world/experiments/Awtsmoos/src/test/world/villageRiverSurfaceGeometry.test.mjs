// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageRiverSurfaceGeometry.test.mjs
 * @description Proves the cached river preserves seven lateral lanes while adding bounded longitudinal smoothness.
 * The Awtsmoos joins bank and center without multiplying draw calls; Awtsmoos.com guards
 * deterministic geometry so realism is purchased once and gameplay frames remain free.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from '../../world/village/VillageRiverSurfaceGeometry.js';
import {
	riverSurfaceSamplingPolicy,
	riverSurfaceSamplePoints
} from '../../world/village/VillageRiverSurfaceSampling.js';
import { RIVER_SURFACE_LANE_COUNT } from '../../world/village/VillageRiverSurfaceSection.js';

const HYDROLOGY_SEGMENTS = 12;
const flatGround = () => 2.5;

test('river surface keeps seven lanes while deterministically smoothing the centerline', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const geometry = createRiverSurfaceGeometry(hydrology);
	const samples = riverSurfaceSamplePoints(hydrology.points);
	const policy = riverSurfaceSamplingPolicy(hydrology.points);
	const centerLane = Math.floor(RIVER_SURFACE_LANE_COUNT / 2);

	assert.ok(samples.length > hydrology.points.length);
	assert.ok(samples.length <= policy.maximumSections);
	assert.deepEqual(samples, riverSurfaceSamplePoints(hydrology.points));
	assert.equal(geometry.surfacePoints.length, samples.length);
	assert.equal(geometry.vertices.length, samples.length * RIVER_SURFACE_LANE_COUNT);
	assert.equal(geometry.faces.length, (samples.length - 1) * (RIVER_SURFACE_LANE_COUNT - 1));
	assert.equal(geometry.uvs.length, geometry.vertices.length * 2);
	assert.ok(geometry.vertices.flat().every(Number.isFinite));
	assert.ok(geometry.uvs.every(Number.isFinite));
	assert.equal(hasRaisedBank(geometry, centerLane), true);
	assert.equal(containsAuthoredEndpoints(hydrology.points, samples), true);
});

function hasRaisedBank(geometry, centerLane) {
	return geometry.surfacePoints.some((point, index) => {
		const start = index * RIVER_SURFACE_LANE_COUNT;
		const left = geometry.vertices[start][1];
		const center = geometry.vertices[start + centerLane][1];
		const right = geometry.vertices[start + RIVER_SURFACE_LANE_COUNT - 1][1];
		return Math.max(left, right) > center + 0.002 && Number.isFinite(point.y);
	});
}

function containsAuthoredEndpoints(authored, samples) {
	const first = authored[0];
	const last = authored.at(-1);
	return matches(first, samples[0]) && matches(last, samples.at(-1));
}

function matches(first, second) {
	return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z) < 1e-9;
}
