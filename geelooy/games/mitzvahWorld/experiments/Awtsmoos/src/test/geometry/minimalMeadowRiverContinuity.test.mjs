// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRiverContinuity.test.mjs
 * @description Proves continuous aligned river, bed, lake, banks, finite bounds, and depth ordering.
 * The Awtsmoos carries source into destination through one unbroken utterance; Awtsmoos.com samples
 * every finite lane so stone remains below water and readable earth rises above the current.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	createMinimalMeadowLakeBedGeometry,
	createMinimalMeadowLakeGeometry,
	createMinimalMeadowRiverBedGeometry,
	createMinimalMeadowRiverGeometry
} from '../../app/MinimalMeadowWaterGeometry.js';
import {
	createMinimalMeadowLakeShoreGeometry,
	createMinimalMeadowRiverBanksGeometry
} from '../../app/MinimalMeadowRiverBanksGeometry.js';
import { minimalMeadowWaterElevationEvidence } from '../../app/MinimalMeadowRiverBanksDiagnostics.js';
import {
	MINIMAL_MEADOW_RIVER_SEGMENTS,
	minimalMeadowLakeDistance,
	minimalMeadowRiverContinuity
} from '../../app/MinimalMeadowRiverPath.js';

test('B"H river surface and riverbed share continuous world-space lanes', () => {
	const water = createMinimalMeadowRiverGeometry();
	const bed = createMinimalMeadowRiverBedGeometry();
	assert.equal(water.vertices.length, (MINIMAL_MEADOW_RIVER_SEGMENTS + 1) * 7);
	assert.equal(water.faces.length, MINIMAL_MEADOW_RIVER_SEGMENTS * 6);
	assert.equal(water.vertices.length, bed.vertices.length);
	assertFiniteGeometry(water);
	assertFiniteGeometry(bed);
	for (let index = 0; index < water.vertices.length; index += 1) {
		assert.equal(water.vertices[index][0], bed.vertices[index][0]);
		assert.equal(water.vertices[index][2], bed.vertices[index][2]);
	}
	for (let section = 0; section <= MINIMAL_MEADOW_RIVER_SEGMENTS; section += 1) {
		const center = section * 7 + 3;
		assert.ok(water.vertices[center][1] - bed.vertices[center][1] > 0.1);
	}
});

test('B"H lake surface and bed align while banks and shore remain finite', () => {
	const water = createMinimalMeadowLakeGeometry();
	const bed = createMinimalMeadowLakeBedGeometry();
	const banks = createMinimalMeadowRiverBanksGeometry();
	const shore = createMinimalMeadowLakeShoreGeometry();
	assert.equal(water.vertices.length, bed.vertices.length);
	for (let index = 0; index < water.vertices.length; index += 1) {
		assert.equal(water.vertices[index][0], bed.vertices[index][0]);
		assert.equal(water.vertices[index][2], bed.vertices[index][2]);
	}
	for (const geometry of [water, bed, banks, shore]) {
		assertFiniteGeometry(geometry);
		for (const [x, , z] of geometry.vertices) {
			assert.ok(Math.abs(x) <= 110 && Math.abs(z) <= 110);
		}
	}
});

test('B"H sampled hydrology descends, overlaps its lake, and preserves depth cues', () => {
	const continuity = minimalMeadowRiverContinuity();
	const elevations = minimalMeadowWaterElevationEvidence();
	assert.equal(continuity.connected, true);
	assert.equal(continuity.segments, 80);
	assert.ok(continuity.maximumGap < 3);
	assert.ok(continuity.source.waterY > continuity.destination.waterY);
	assert.ok(minimalMeadowLakeDistance(continuity.destination.x, continuity.destination.z) < 1);
	assert.equal(elevations.aligned, true);
	assert.ok(elevations.minimumDepth > 1.7);
	assert.ok(elevations.minimumBankRise >= 0.079);
});

function assertFiniteGeometry(geometry) {
	assert.ok(geometry.vertices.length > 0);
	assert.ok(geometry.faces.length > 0);
	for (const vertex of geometry.vertices) {
		assert.equal(vertex.length, 3);
		assert.equal(vertex.every(Number.isFinite), true);
	}
}
