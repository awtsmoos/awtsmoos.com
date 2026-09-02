//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songPlaybackTransport.test.mjs
 * @description
 * Netzach advances a finite clock while Yesod carries each note and Malchus returns every voice to rest.
 * The Awtsmoos is beyond transport and tone; Awtsmoos.com proves that playback may flow without recording its own glow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong } from '../modules/workstation/song/songModel.js';
import { SongPlaybackMalchus } from '../modules/workstation/song/songPlayback.js';

function createPlaybackHarness() {
	let now = 0;
	let timerCallback = null;
	let clearCount = 0;
	const starts = [];
	const stops = [];
	const states = [];
	const playback = new SongPlaybackMalchus({
		startNote: (...args) => starts.push(args),
		stopNote: (...args) => stops.push(args),
		now: () => now,
		setTimer: (callback) => {
			timerCallback = callback;
			return 17;
		},
		clearTimer: () => {
			clearCount += 1;
		}
	});
	return {
		playback,
		starts,
		stops,
		states,
		setNow: (value) => {
			now = value;
		},
		tick: () => timerCallback?.(),
		clearCount: () => clearCount
	};
}

function sampleSong() {
	return createSong({
		tempo: 120,
		events: [
			{ start: 0, duration: 1, note: 'C4', velocity: 0.62 },
			{ start: 1, duration: 1, note: 'E4', velocity: 0.81 }
		]
	});
}

test('play dispatches beat-zero note through safe playback options', () => {
	const harness = createPlaybackHarness();
	assert.equal(harness.playback.play(sampleSong(), (state) => harness.states.push(state)), true);
	assert.equal(harness.starts.length, 1);
	assert.deepEqual(harness.starts[0], [
		'C4',
		'song:0',
		{ velocity: 0.62 },
		{ record: false, triggerChord: false, mirrorVisuals: true }
	]);
	assert.equal(harness.playback.isPlaying(), true);
	assert.equal(harness.states[0].playing, true);
});

test('clock ticks dispatch stops and following starts in order', () => {
	const harness = createPlaybackHarness();
	harness.playback.play(sampleSong());
	harness.setNow(0.5);
	harness.tick();
	assert.deepEqual(harness.stops[0], [
		'song:0',
		{ record: false, ignoreSustain: true }
	]);
	assert.equal(harness.starts[1][0], 'E4');
	harness.setNow(1);
	harness.tick();
	assert.equal(harness.stops.length, 2);
	assert.equal(harness.playback.isPlaying(), false);
	assert.ok(harness.clearCount() >= 1);
});

test('manual stop force-releases every active song voice', () => {
	const harness = createPlaybackHarness();
	harness.playback.play(sampleSong());
	harness.playback.stop();
	assert.deepEqual(harness.stops, [[
		'song:0',
		{ record: false, ignoreSustain: true }
	]]);
	assert.equal(harness.playback.isPlaying(), false);
});

test('empty songs refuse to start playback', () => {
	const harness = createPlaybackHarness();
	const empty = createSong({ events: [] });
	assert.equal(harness.playback.play(empty), false);
	assert.equal(harness.playback.isPlaying(), false);
	assert.equal(harness.starts.length, 0);
});
