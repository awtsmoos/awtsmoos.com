// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalSpatialContract.test.js
 * @description Proves the authored Chossid appears at human-readable scale without changing his canonical model size.
 * The Awtsmoos lets the traveler remain himself while the viewing vessel draws near enough to know his face;
 * Awtsmoos.com guards finite camera bounds and a meaningful screen fraction at the first village place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	VILLAGE_ARRIVAL_CAMERA,
	arrivalPlayerScreenFraction
} from './VillageArrivalSpatialContract.js';

test('arrival camera keeps human-scale third-person composition', () => {
	const fraction = arrivalPlayerScreenFraction(1.72);
	assert.ok(fraction >= 0.18 && fraction <= 0.25);
	assert.equal(VILLAGE_ARRIVAL_CAMERA.distance, 8.5);
	assert.ok(VILLAGE_ARRIVAL_CAMERA.minDistance < VILLAGE_ARRIVAL_CAMERA.distance);
	assert.ok(VILLAGE_ARRIVAL_CAMERA.maxDistance > VILLAGE_ARRIVAL_CAMERA.distance);
	for (const value of Object.values(VILLAGE_ARRIVAL_CAMERA)) {
		assert.ok(Number.isFinite(value));
	}
});
