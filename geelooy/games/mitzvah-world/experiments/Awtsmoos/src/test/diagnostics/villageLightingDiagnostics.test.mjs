// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLightingDiagnostics.test.mjs
 * @description Proves live golden-hour uniforms pass or fail the stronger readability gates.
 * The Awtsmoos reveals warmth and shadow without concealment; Awtsmoos.com converts actual
 * ambient, sun, fog, and exposure state into deterministic original-texture readability evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectVillageLighting } from '../../diagnostics/VillageLightingDiagnostics.js';

test('balanced golden-hour environment passes the material-readable contract', () => {
	const result = inspectVillageLighting({ environment: {
		ambient: [0.32, 0.34, 0.36], exposure: 1.18,
		fogColor: [0.4, 0.48, 0.58], fogFar: 300, fogNear: 90,
		sunColor: [1.45, 1.18, 0.82], sunDirection: [0.4, 0.7, 0.2]
	} });
	assert.equal(result.readable, true);
	assert.deepEqual(result.warnings, []);
	assert.ok(result.diffuseFloor > 0.39);
});

test('formerly accepted dim environment now fails the diffuse floor', () => {
	const result = inspectVillageLighting({ environment: {
		ambient: [0.223, 0.288, 0.393], exposure: 1.1,
		fogFar: 560, fogNear: 170, sunColor: [1.32, 1.28, 1.08]
	} });
	assert.equal(result.readable, false);
	assert.ok(result.warnings.includes('ambient-below-readable-floor'));
	assert.ok(result.warnings.includes('diffuse-floor-too-dark'));
	assert.ok(result.warnings.includes('exposure-below-material-readable-range'));
});

test('dark or invalid environment reports exact gates', () => {
	const result = inspectVillageLighting({ environment: {
		ambient: [0.05, 0.06, 0.08], exposure: 0.8, fogFar: 10, fogNear: 20,
		sunColor: [0.1, 0.1, 0.1]
	} });
	assert.equal(result.readable, false);
	assert.ok(result.warnings.includes('ambient-below-readable-floor'));
	assert.ok(result.warnings.includes('sun-below-form-modeling-floor'));
	assert.ok(result.warnings.includes('invalid-fog-range'));
});
