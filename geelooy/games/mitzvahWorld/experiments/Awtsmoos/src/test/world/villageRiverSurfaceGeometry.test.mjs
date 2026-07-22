// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageRiverSurfaceGeometry.test.mjs
 * @description Proves the live river uses one finite seven-lane sculpted surface.
 * The Awtsmoos joins bank and center without multiplying draws; Awtsmoos.com guards
 * the cached geometry so realism is purchased once and gameplay frames remain free.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from '../../world/village/VillageRiverSurfaceGeometry.js';
import { RIVER_SURFACE_LANE_COUNT } from '../../world/village/VillageRiverSurfaceSection.js';

const HYDROLOGY_SEGMENTS = 32;
const flatGround = () => 2.5;

test('river surface integrates the authored seven-lane cross-section', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const geometry = createRiverSurfaceGeometry(hydrology);
	const centerLane = Math.floor(RIVER_SURFACE_LANE_COUNT / 2);

	assert.equal(
		geometry.vertices.length,
		hydrology.points.length * RIVER_SURFACE_LANE_COUNT
	);
	assert.equal(
		geometry.faces.length,
		(hydrology.points.length - 1) * (RIVER_SURFACE_LANE_COUNT - 1)
	);
	assert.equal(geometry.uvs.length, geometry.vertices.length * 2);
	assert.ok(geometry.vertices.flat().every(Number.isFinite));
	assert.ok(geometry.uvs.every(Number.isFinite));

	for (let index = 0; index < hydrology.points.length; index += 1) {
		const centerVertex = geometry.vertices[
			index * RIVER_SURFACE_LANE_COUNT + centerLane
		];
		assert.ok(Math.abs(centerVertex[1] - hydrology.points[index].y) < 1e-9);
	}

	const nextSectionUv = geometry.uvs[RIVER_SURFACE_LANE_COUNT * 2];
	assert.ok(nextSectionUv > geometry.uvs[0]);
	assert.equal(hasRaisedBank(hydrology, geometry, centerLane), true);
});

function hasRaisedBank(hydrology, geometry, centerLane) {
	return hydrology.points.some((point, index) => {
		const start = index * RIVER_SURFACE_LANE_COUNT;
		const left = geometry.vertices[start][1];
		const center = geometry.vertices[start + centerLane][1];
		const right = geometry.vertices[start + RIVER_SURFACE_LANE_COUNT - 1][1];
		return Math.max(left, right) > center + 0.002 && Number.isFinite(point.y);
	});
}
