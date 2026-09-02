//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songPlaybackClock.test.mjs
 * @description
 * The Awtsmoos is beyond clocks while Awtsmoos.com proves that finite beats become ordered seconds without ambiguity, even where one note ends exactly as another begins.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong } from '../modules/workstation/song/songModel.js';
import {
	beatsToSeconds,
	createPlaybackTimeline
} from '../modules/workstation/song/songPlaybackClock.js';

test('beatsToSeconds respects song tempo', () => {
	assert.equal(beatsToSeconds(1, 120), 0.5);
	assert.equal(beatsToSeconds(4, 60), 4);
	assert.equal(beatsToSeconds(2, 240), 0.5);
});

test('timeline creates paired start and stop events', () => {
	const song = createSong({
		tempo: 120,
		events: [
			{ start: 0, duration: 1, note: 'C4', velocity: 0.6 },
			{ start: 1, duration: 0.5, note: 'E4', velocity: 0.8 }
		]
	});
	const timeline = createPlaybackTimeline(song);
	assert.deepEqual(
		timeline.events.map((event) => [event.time, event.type, event.note]),
		[
			[0, 'start', 'C4'],
			[0.5, 'stop', 'C4'],
			[0.5, 'start', 'E4'],
			[0.75, 'stop', 'E4']
		]
	);
	assert.equal(timeline.durationSeconds, 0.75);
});

test('overlapping notes preserve independent input identities', () => {
	const song = createSong({
		tempo: 60,
		events: [
			{ start: 0, duration: 2, note: 'C4', velocity: 0.5 },
			{ start: 0.5, duration: 1, note: 'C4', velocity: 0.9 }
		]
	});
	const starts = createPlaybackTimeline(song).events.filter((event) => event.type === 'start');
	assert.equal(starts.length, 2);
	assert.notEqual(starts[0].inputId, starts[1].inputId);
	assert.equal(starts[0].note, starts[1].note);
});

test('empty songs create an empty zero-duration timeline', () => {
	const timeline = createPlaybackTimeline(createSong({ events: [] }));
	assert.deepEqual(timeline.events, []);
	assert.equal(timeline.durationSeconds, 0);
});
