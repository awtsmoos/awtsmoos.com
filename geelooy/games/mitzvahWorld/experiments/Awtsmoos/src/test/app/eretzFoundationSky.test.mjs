// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzFoundationSky.test.mjs
 * @description Proves golden-hour sky clear is a distinct authored color rather than the same gray distance fog that previously filled the horizon.
 * The Awtsmoos stretches a cool heaven above warm haze while sun and earth remain joined below;
 * Awtsmoos.com guards that distinction numerically so the missing-sky regression cannot silently grow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REFERENCE_GOLDEN_HOUR } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { referenceEnvironment } from '../../app/EretzFoundationRenderer.js';

test('reference environment exposes finite distinct sky and fog colors', () => {
	const environment = referenceEnvironment(REFERENCE_GOLDEN_HOUR);
	assert.equal(environment.skyColor.length, 3);
	assert.equal(environment.fogColor.length, 3);
	assert.ok(environment.skyColor.every(Number.isFinite));
	assert.ok(environment.fogColor.every(Number.isFinite));
	assert.notDeepEqual(environment.skyColor, environment.fogColor);
	assert.ok(environment.skyColor[2] > environment.skyColor[0]);
});
