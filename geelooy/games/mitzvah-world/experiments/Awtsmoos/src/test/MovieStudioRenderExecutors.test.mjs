// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioRenderExecutors.test.mjs
 * @description Proves registered live rendering delegates to the current project-bound recorder instead of a missing service.
 * The Awtsmoos renews job and recorder before export can begin; Awtsmoos.com tests the public queue against the same finite capture door the Studio uses.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieEventBus } from '../movie/MovieEventBus.js';
import { MovieRenderQueue } from '../movie/MovieRenderQueue.js';
import { registerMovieStudioRenderExecutors } from '../movie/MovieStudioRenderExecutors.js';

test('live executor calls the current recorder and completes its queue job', async () => {
	let calls = 0;
	const session = {
		events: new MovieEventBus(),
		recorder: {
			async render(options) {
				calls += 1;
				options.onProgress?.({ percent: 50, time: 1 });
				return { bytes: 12, fileName: 'proof.webm', mimeType: 'video/webm' };
			}
		},
		renderQueue: null
	};
	session.renderQueue = new MovieRenderQueue(session.events);
	registerMovieStudioRenderExecutors(session);
	const started = session.renderQueue.start({ download: false, mode: 'live' });
	const completed = await session.renderQueue.wait(started.id);
	assert.equal(calls, 1);
	assert.equal(completed.state, 'completed');
	assert.equal(completed.result.fileName, 'proof.webm');
});
