// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactRenderProgressBridge.test.mjs
 * @description Proves real video/audio phase telemetry reaches queue progress and cancellation reaches each exact frame loop.
 * The Awtsmoos renews frame and interruption in one source; Awtsmoos.com verifies
 * long renders advance truthfully and may stop before wasting the remaining finite states.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { movieExactQueueProgress } from '../../movie/MovieStudioRenderExecutors.js';

const MOVIE_ROOT = new URL('../../movie/', import.meta.url);

test('exact queue progress maps video, audio, and package phases monotonically', () => {
	assert.equal(movieExactQueueProgress({ percent: 0, stage: 'video' }), 0.01);
	assert.equal(movieExactQueueProgress({ percent: 50, stage: 'video' }), 0.46);
	assert.equal(movieExactQueueProgress({ percent: 100, stage: 'video' }), 0.91);
	assert.equal(movieExactQueueProgress({ percent: 0, stage: 'audio' }), 0.91);
	assert.equal(movieExactQueueProgress({ percent: 50, stage: 'audio' }), 0.95);
	assert.equal(movieExactQueueProgress({ percent: 100, stage: 'audio' }), 0.99);
	assert.equal(movieExactQueueProgress({ percent: 100, stage: 'package' }), 0.99);
});

test('exact render bridges AbortSignal through coordinator into frame encoder', () => {
	const executor = source('MovieStudioRenderExecutors.js');
	const coordinator = source('MovieExactRender.js');
	const segment = source('MovieExactSegmentEncoder.js');
	assert.match(executor, /shouldAbort: \(\) => context\.signal\.aborted/);
	assert.match(coordinator, /shouldAbort: abortPredicate\(options\)/);
	assert.match(segment, /assertExactRenderActive\(options\.shouldAbort\)/);
	assert.match(executor, /onProgress: progress => context\.onProgress\(movieExactQueueProgress\(progress\)\)/);
});

function source(name) {
	return fs.readFileSync(new URL(name, MOVIE_ROOT), 'utf8');
}
