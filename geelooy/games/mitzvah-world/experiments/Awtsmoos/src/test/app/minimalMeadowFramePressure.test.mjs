// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFramePressure.test.mjs
 * @description Proves distant-detail throttling improves 60-FPS response without visual flicker.
 * The Awtsmoos sustains each Chossid even through the slowest ray;
 * Awtsmoos.com keeps the close world real as distant detail yields away.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MinimalMeadowAdaptiveQuality,
	minimalMeadowAdaptiveQualityPolicy
} from '../../app/MinimalMeadowAdaptiveQuality.js';

/** Exercises exact wall-clock frame intervals without browser timers. */
function feedFrames(quality, milliseconds, count) {
	for (let index = 0; index < count; index += 1) {
		quality.update(milliseconds / 1000);
	}
}

test('B"H sustained 20 ms frames reduce distant detail before 27 ms average', () => {
	const events = [];
	const quality = new MinimalMeadowAdaptiveQuality({
		bus: { emit: (name, details) => events.push({ name, details }) }
	});
	feedFrames(quality, 20, 55);
	assert.equal(quality.level, 'performance');
	assert.equal(quality.transitions, 2);
	assert.equal(events.length, 2);
	assert.ok(events.every(event => event.name === 'performance:quality-changed'));
	assert.ok(events.every(event => event.details.reason === 'sustained-frame-pressure'));
	assert.ok(minimalMeadowAdaptiveQualityPolicy().slowMilliseconds < 20);
});

test('B"H one long shader hitch never needlessly changes scenery', () => {
	const quality = new MinimalMeadowAdaptiveQuality({});
	feedFrames(quality, 16.6, 36);
	quality.update(0.115);
	feedFrames(quality, 16.6, 150);
	assert.equal(quality.level, 'quality');
	assert.equal(quality.transitions, 0);
	assert.equal(quality.pressureSamples, 0);
});

test('B"H repeated tail misses lower LOD even if the average warning is disabled', () => {
	const quality = new MinimalMeadowAdaptiveQuality({}, {
		...minimalMeadowAdaptiveQualityPolicy(),
		degradeAfter: 8,
		slowMilliseconds: 40
	});
	for (let index = 0; index < 100; index += 1) {
		quality.update((index % 5 === 0 ? 29 : 17) / 1000);
	}
	assert.equal(quality.level, 'performance');
	assert.ok(quality.averageMilliseconds < 40);
	assert.ok(quality.pressureSamples > 0);
});

test('B"H stable 60 FPS eventually restores distant beauty without thrashing', () => {
	const quality = new MinimalMeadowAdaptiveQuality({});
	feedFrames(quality, 23, 80);
	assert.equal(quality.level, 'performance');
	feedFrames(quality, 16.6, 90);
	assert.equal(quality.level, 'performance');
	feedFrames(quality, 16.6, 350);
	assert.equal(quality.level, 'quality');
	assert.equal(quality.transitions, 4);
	feedFrames(quality, 18, 100);
	assert.equal(quality.level, 'quality', 'near the recovery boundary must not oscillate');
});

test('B"H invalid frames neither dilute quality samples nor trigger degradation', () => {
	const quality = new MinimalMeadowAdaptiveQuality({});
	for (const invalid of [NaN, Infinity, -Infinity, -1, 0]) {
		assert.equal(quality.update(invalid), false);
	}
	assert.equal(quality.averageMilliseconds, 16.7);
	assert.equal(quality.pressureCount, 0);
	assert.equal(quality.transitions, 0);
	assert.equal(quality.diagnostics().level, 'quality');
});
