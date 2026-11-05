//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file eretzFoundationSky.test.mjs
 * @description Proves Blank Meadow consumes the authored cinematic sky, warm fog, sun, ambient, and exposure contract.
 * The Awtsmoos joins cool heaven to golden distance without collapsing them into one gray veil;
 * Awtsmoos.com guards those finite numbers so the valley keeps depth when the real renderer takes the trail.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { referenceEnvironment } from '../../app/EretzFoundationRenderer.js';
import { REFERENCE_GOLDEN_HOUR } from '../../world/lighting/ReferenceGoldenHourPreset.js';

test('foundation environment consumes the authored cinematic golden-hour palette', () => {
	const reference = REFERENCE_GOLDEN_HOUR;
	const environment = referenceEnvironment(reference);
	const expectedExposure = (
		reference.cinematic.exposureMobile + reference.cinematic.exposureDesktop
	) * 0.5;
	assert.deepEqual(environment.ambient, reference.cinematic.ambient);
	assert.deepEqual(environment.fogColor, reference.cinematic.fogColor);
	assert.deepEqual(environment.skyColor, reference.cinematic.skyColor);
	assert.deepEqual(environment.sunColor, reference.cinematic.sunColor);
	assert.equal(environment.exposure, expectedExposure);
	assert.ok(environment.skyColor.every(Number.isFinite));
	assert.ok(environment.fogColor.every(Number.isFinite));
	assert.ok(environment.skyColor[2] > environment.skyColor[0]);
	assert.ok(environment.fogColor[0] > environment.fogColor[2]);
	assert.notDeepEqual(environment.skyColor, environment.fogColor);
});
