//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songRemix.test.mjs
 * @description
 * The Awtsmoos is beyond every alternate arrangement while Awtsmoos.com proves that drops, repeats, and accelerating ratchets can be derived reproducibly without harming the original take.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong } from '../modules/workstation/song/songModel.js';
import { buildSongRemix } from '../modules/workstation/song/songRemix.js';

function remixSource() {
	return createSong({
		title: 'Source Take',
		tempo: 128,
		beatsPerBar: 4,
		events: [
			{ start: 0, duration: 1, note: 'C4', velocity: 0.5 },
			{ start: 4, duration: 1, note: 'D4', velocity: 0.55 },
			{ start: 8, duration: 1, note: 'E4', velocity: 0.6 }
		]
	});
}

test('festival remix is deterministic for the same seed', () => {
	const source = remixSource();
	const first = buildSongRemix(source, { style: 'festival', sectionBars: 1, seed: 'same' });
	const second = buildSongRemix(source, { style: 'festival', sectionBars: 1, seed: 'same' });
	assert.deepEqual(first, second);
	assert.ok(first.markers.some((marker) => marker.label === 'DROP'));
	assert.ok(first.markers.some((marker) => marker.label === 'FINAL DROP'));
});

test('remixing never mutates the source song', () => {
	const source = remixSource();
	const snapshot = structuredClone(source);
	buildSongRemix(source, { style: 'ratchet-drop', sectionBars: 1, seed: 42 });
	assert.deepEqual(source, snapshot);
});

test('ratchet-drop places shortening repeats immediately before the drop', () => {
	const remix = buildSongRemix(remixSource(), {
		style: 'ratchet-drop',
		sectionBars: 1,
		seed: 3,
		ratchet: {
			sliceLength: 1,
			repetitions: 4,
			shortenRatio: 0.5,
			minimumSlice: 1 / 64,
			velocityRamp: 0.08,
			gate: 1,
			gapAfter: 0.25
		}
	});
	const ratchetBeat = remix.markers.find((marker) => marker.label === 'RATCHET BUILD')?.beat;
	const dropBeat = remix.markers.find((marker) => marker.label === 'DROP')?.beat;
	assert.equal(typeof ratchetBeat, 'number');
	assert.equal(typeof dropBeat, 'number');
	const ratchetStarts = remix.events
		.filter((event) => event.start >= ratchetBeat && event.start < dropBeat)
		.map((event) => Number((event.start - ratchetBeat).toFixed(4)));
	assert.deepEqual(ratchetStarts, [0, 1, 1.5, 1.75]);
	assert.equal(Number((dropBeat - ratchetBeat).toFixed(4)), 2.125);
});

test('every generated remix event remains playable', () => {
	for (const style of ['festival', 'echo-repeat', 'cut-stutter', 'ratchet-drop']) {
		const remix = buildSongRemix(remixSource(), { style, sectionBars: 1, seed: style });
		assert.ok(remix.events.length > 0, style);
		assert.ok(remix.events.every((event) => event.duration > 0), style);
		assert.ok(remix.events.every((event) => event.velocity >= 0 && event.velocity <= 1), style);
		assert.ok(remix.events.every((event) => event.start >= 0), style);
	}
});
