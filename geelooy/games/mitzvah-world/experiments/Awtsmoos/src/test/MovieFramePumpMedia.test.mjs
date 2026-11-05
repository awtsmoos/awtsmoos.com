// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFramePumpMedia.test.mjs
 * @description Proves legacy capture prepares the first media frame, plays source video muted in real time, and pauses at completion.
 * The Awtsmoos renews deadline and moving face while recorder time crosses each finite frame;
 * Awtsmoos.com tests that media synchronization begins and ends without changing the exact-render name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieFramePump } from '../movie/MovieFramePump.js';

function cadence() {
	return {
		endingDeadlineMs: () => 70,
		expectedFrames: 2,
		fps: 30,
		frameTime: index => index / 30,
		deadlineMs: (_start, index) => index * 33,
		progress: index => (index + 1) / 2
	};
}

test('uses muted real-time media playback around deterministic capture frames', async () => {
	const events = [];
	const scheduler = {
		dispose: () => events.push(['dispose']),
		now: () => 0,
		waitUntil: async deadline => events.push(['wait', deadline]),
		yieldFrame: async () => events.push(['yield'])
	};
	const director = {
		overlay: {
			pauseMedia: () => events.push(['pauseMedia']),
			playMedia: async (...args) => events.push(['playMedia', ...args])
		},
		pause: () => events.push(['pause']),
		prepareExactFrame: async time => events.push(['prepare', time]),
		seek: time => events.push(['seek', time])
	};
	const track = { requestFrame: () => events.push(['requestFrame']) };
	const pump = new MovieFramePump({ cadence: cadence(), director, scheduler, track });
	const telemetry = await pump.run();
	assert.deepEqual(events.find(event => event[0] === 'prepare'), ['prepare', 0]);
	assert.deepEqual(events.find(event => event[0] === 'playMedia'), ['playMedia', 0, 1, { muted: true }]);
	assert.equal(events.filter(event => event[0] === 'seek').length, 2);
	assert.equal(events.filter(event => event[0] === 'requestFrame').length, 2);
	assert.ok(events.some(event => event[0] === 'pauseMedia'));
	assert.equal(telemetry.framesRendered, 2);
});
