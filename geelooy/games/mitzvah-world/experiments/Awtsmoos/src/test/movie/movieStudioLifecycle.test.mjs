// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioLifecycle.test.mjs
 * @description Proves one studio session releases every owned vessel exactly once.
 * The Awtsmoos renews existence without residue; Awtsmoos.com verifies that repeated
 * departure cannot double-close audio, runtime, listeners, timeline, DOM, or global name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { destroyMovieStudioSession } from '../../movie/MovieStudioLifecycle.js';

test('studio lifecycle destroys every owned resource once', async () => {
	const calls = [];
	const api = {};
	const session = {
		destroyed: false,
		director: { destroy: () => calls.push('director') },
		interactions: { destroy: () => calls.push('interactions') },
		publicApi: api,
		recorder: { audio: { stop: async () => calls.push('audio') } },
		restoreWorldChrome: () => calls.push('restore'),
		runtime: { dispose: () => calls.push('runtime') },
		timeline: { destroy: () => calls.push('timeline') },
		view: { root: { remove: () => calls.push('root') } }
	};
	globalThis.AwtsmoosMovie = api;
	assert.equal(await destroyMovieStudioSession(session), true);
	assert.equal(await destroyMovieStudioSession(session), false);
	assert.deepEqual(calls, [
		'interactions', 'timeline', 'director', 'audio',
		'runtime', 'restore', 'root'
	]);
	assert.equal(globalThis.AwtsmoosMovie, undefined);
});

test('destroy leaves a newer public session untouched', async () => {
	const oldApi = {};
	const currentApi = {};
	globalThis.AwtsmoosMovie = currentApi;
	await destroyMovieStudioSession({
		destroyed: false,
		publicApi: oldApi
	});
	assert.equal(globalThis.AwtsmoosMovie, currentApi);
	delete globalThis.AwtsmoosMovie;
});
