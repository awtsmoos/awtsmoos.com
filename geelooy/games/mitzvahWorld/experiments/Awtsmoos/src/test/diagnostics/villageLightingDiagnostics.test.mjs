// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLightingDiagnostics.test.mjs
 * @description Proves effective environment uniforms pass or fail named readability gates.
 * The Awtsmoos reveals warmth and shadow without concealment; Awtsmoos.com converts the
 * actual ambient, sun, fog, and exposure state into deterministic evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectVillageLighting } from '../../diagnostics/VillageLightingDiagnostics.js';

test('balanced golden-hour environment passes the readability contract', () => {
	const result = inspectVillageLighting({
		environment: {
			ambient: [0.32, 0.34, 0.36],
			exposure: 1.18,
			fogColor: [0.4, 0.48, 0.58],
			fogFar: 300,
			fogNear: 90,
			sunColor: [1.45, 1.18, 0.82],
			sunDirection: [0.4, 0.7, 0.2]
		}
	});
	assert.equal(result.readable, true);
	assert.deepEqual(result.warnings, []);
	assert.ok(result.diffuseFloor > 0.3);
});

test('dark or invalid environment reports exact gates', () => {
	const result = inspectVillageLighting({
		environment: {
			ambient: [0.05, 0.06, 0.08],
			exposure: 0.8,
			fogFar: 10,
			fogNear: 20,
			sunColor: [0.1, 0.1, 0.1]
		}
	});
	assert.equal(result.readable, false);
	assert.ok(result.warnings.includes('ambient-below-readable-floor'));
	assert.ok(result.warnings.includes('sun-below-form-modeling-floor'));
	assert.ok(result.warnings.includes('exposure-below-unity'));
	assert.ok(result.warnings.includes('invalid-fog-range'));
});
