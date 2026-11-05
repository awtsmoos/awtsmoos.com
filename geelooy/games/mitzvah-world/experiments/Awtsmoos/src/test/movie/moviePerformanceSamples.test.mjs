// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceSamples.test.mjs
 * @description Proves normalized intent, transform interpolation, event order, and compression.
 * The Awtsmoos joins diagonal desire to measured motion; Awtsmoos.com keeps
 * turns smooth, events exact, and stillness concise so every cinematic instant may rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { simplifyMoviePerformanceSamples } from '../../movie/MoviePerformanceCompression.js';
import {
	moviePerformanceEventsBetween,
	sampleMoviePerformanceTake
} from '../../movie/MoviePerformanceInterpolation.js';
import { normalizeMoviePerformanceIntent } from '../../movie/MoviePerformanceSamples.js';
import {
	performanceTake,
	sample
} from './moviePerformanceFixture.mjs';


test('diagonal intent is normalized and keeps simultaneous axes', () => {
	const intent = normalizeMoviePerformanceIntent({ forward: 1, run: true, strafe: 1 });
	assert.ok(Math.abs(Math.hypot(intent.forward, intent.strafe) - 1) < 0.000001);
	assert.equal(intent.run, true);
});


test('transform sampling interpolates position and wrapped rotation', () => {
	const take = performanceTake({
		duration: 1,
		transformSamples: [
			{ ...sample(0, [0, 0, 0]), rotation: [0, Math.PI - 0.1, 0] },
			{ ...sample(1, [2, 0, 0]), rotation: [0, -Math.PI + 0.1, 0] }
		]
	});
	const middle = sampleMoviePerformanceTake(take, 0.5);
	assert.deepEqual(middle.position, [1, 0, 0]);
	assert.ok(Math.abs(Math.abs(middle.rotation[1]) - Math.PI) < 0.000001);
});


test('events fire only across the crossed forward boundary', () => {
	const events = [
		{ actionId: 'wave', id: 'a', time: 0.5 },
		{ actionId: 'point', id: 'b', time: 1 }
	];
	assert.deepEqual(moviePerformanceEventsBetween(events, 0.5, 1), [events[1]]);
	assert.deepEqual(moviePerformanceEventsBetween(events, 1, 0.5), []);
});


test('simplification preserves endpoints and movement-state changes', () => {
	const samples = [
		sample(0, [0, 0, 0], 'idle'),
		sample(0.5, [0, 0, 0], 'idle'),
		sample(1, [0, 0, 0], 'walk'),
		sample(2, [0, 0, -1], 'walk')
	];
	const simplified = simplifyMoviePerformanceSamples(samples);
	assert.equal(simplified[0].time, 0);
	assert.ok(simplified.some(item => item.movementState === 'walk'));
	assert.equal(simplified.at(-1).time, 2);
});
