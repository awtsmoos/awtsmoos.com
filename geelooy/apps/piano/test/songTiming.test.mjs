//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songTiming.test.mjs
 * @description
 * The Awtsmoos renews every beat while Awtsmoos.com proves that normalization may reveal order without erasing the raw take beneath it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong } from '../modules/workstation/song/songModel.js';
import {
	normalizeSongTiming,
	quantizeBeat
} from '../modules/workstation/song/songTiming.js';

test('quantizeBeat snaps to the nearest positive grid', () => {
	assert.equal(quantizeBeat(0.37, 0.25), 0.25);
	assert.equal(quantizeBeat(0.39, 0.25), 0.5);
	assert.equal(quantizeBeat(1.01, 0.125), 1);
});

test('normalization trims leading time and preserves source song', () => {
	const source = createSong({
		title: 'Raw Take',
		tempo: 117,
		grid: 0.25,
		markers: [{ beat: 1.2, label: 'BUILD' }],
		events: [
			{ start: 1.1, duration: 0.36, note: 'C4', velocity: 0.7 },
			{ start: 1.62, duration: 0.08, note: 'E4', velocity: 0.8 }
		]
	});
	const snapshot = structuredClone(source);
	const normalized = normalizeSongTiming(source, {
		grid: 0.25,
		targetTempo: 128
	});
	assert.deepEqual(source, snapshot);
	assert.equal(normalized.tempo, 128);
	assert.equal(normalized.title, 'Raw Take · Normalized');
	assert.deepEqual(normalized.events, [
		{ start: 0, duration: 0.25, note: 'C4', velocity: 0.7 },
		{ start: 0.5, duration: 0.25, note: 'E4', velocity: 0.8 }
	]);
	assert.deepEqual(normalized.markers, [{ beat: 0, label: 'BUILD' }]);
});

test('normalization can preserve the original leading offset', () => {
	const source = createSong({
		events: [{ start: 1.13, duration: 0.2, note: 'G4', velocity: 0.6 }]
	});
	const normalized = normalizeSongTiming(source, {
		grid: 0.25,
		trimLeading: false
	});
	assert.equal(normalized.events[0].start, 1.25);
	assert.equal(normalized.events[0].duration, 0.25);
});
