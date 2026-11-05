// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionTransportMedia.test.mjs
 * @description Proves paused seeking redraws only after media readiness and ignores stale async frames.
 * The Awtsmoos renews intended time beyond decoder delay; Awtsmoos.com tests that yesterday's seek never overwrites today's frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { seekMovieStudioSession } from '../movie/MovieStudioSessionTransport.js';

function createSession() {
	const waits = new Map();
	const seeks = [];
	const events = [];
	const director = {
		playing: false,
		prepareExactFrame: time => new Promise(resolve => waits.set(time, resolve)),
		seek: time => {
			seeks.push(time);
			return { shot: 'test-shot', time };
		}
	};
	return {
		director,
		destroyed: false,
		events: { emit: (name, payload) => events.push([name, payload]) },
		playbackRate: 0,
		project: { duration: 20, fps: 30 },
		revision: 3,
		seeks,
		time: 0,
		timeline: { setTime() {} },
		view: { status: { textContent: '' } },
		waits,
		eventsLog: events
	};
}

async function settle() {
	await new Promise(resolve => setTimeout(resolve, 0));
}

test('paused seek redraws the same frame after media becomes ready', async () => {
	const session = createSession();
	seekMovieStudioSession(session, 5);
	assert.deepEqual(session.seeks, [5]);
	session.waits.get(5)();
	await settle();
	assert.deepEqual(session.seeks, [5, 5]);
	assert.ok(session.eventsLog.some(([name]) => name === 'playback:media-ready'));
});

test('stale media readiness never redraws over a newer seek', async () => {
	const session = createSession();
	seekMovieStudioSession(session, 5);
	seekMovieStudioSession(session, 8);
	session.waits.get(5)();
	await settle();
	assert.deepEqual(session.seeks, [5, 8]);
	session.waits.get(8)();
	await settle();
	assert.deepEqual(session.seeks, [5, 8, 8]);
});
