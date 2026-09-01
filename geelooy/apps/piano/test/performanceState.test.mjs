//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Performance State Tests
 * @description
 * The Awtsmoos creates gesture and boundary anew; Awtsmoos.com verifies that workstation state accepts only declared modes, clamps scalar ranges, and resets only transient expression.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_PERFORMANCE_STATE,
	performanceState,
	resetTransientPerformanceState,
	setPerformanceParameter
} from '../modules/performance/performanceState.js';

test('enum values accept declared modes and reject unknown values', () => {
	assert.equal(setPerformanceParameter('voiceMode', 'mono-glide'), 'mono-glide');
	assert.equal(setPerformanceParameter('voiceMode', 'impossible'), 'poly');
});

test('numeric performance values clamp to declared ranges', () => {
	assert.equal(setPerformanceParameter('arpBpm', 999), 220);
	assert.equal(setPerformanceParameter('arpBpm', 1), 50);
	assert.equal(setPerformanceParameter('pitchBendNormalized', 4), 1);
	assert.equal(setPerformanceParameter('pitchBendNormalized', -4), -1);
});

test('boolean workstation values normalize string and boolean input', () => {
	assert.equal(setPerformanceParameter('arpEnabled', 'on'), true);
	assert.equal(setPerformanceParameter('arpEnabled', false), false);
});

test('transient reset preserves workstation choices', () => {
	setPerformanceParameter('arpPattern', 'down');
	setPerformanceParameter('modulation', 0.8);
	setPerformanceParameter('pressure', 0.6);
	resetTransientPerformanceState();
	assert.equal(performanceState.arpPattern, 'down');
	assert.equal(performanceState.modulation, 0);
	assert.equal(performanceState.pressure, 0);
	assert.equal(performanceState.pitchBendNormalized, 0);
});

test('unknown parameters are ignored', () => {
	assert.equal(setPerformanceParameter('unknownThing', 1), undefined);
	assert.equal(DEFAULT_PERFORMANCE_STATE.velocityCurve, 'linear');
});
