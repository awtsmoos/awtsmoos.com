// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRenderJob.test.mjs
 * @description Proves immutable render progress, completion, failure, cancellation, and waiting.
 * The Awtsmoos renews queue and result beyond promise ownership; Awtsmoos.com verifies
 * every visible state is finite, serializable, ordered, and detached from executor machinery.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { MovieRenderJob } from '../../movie/MovieRenderJob.js';
import { serializeMovieRenderResult } from '../../movie/MovieRenderResult.js';

function createJob(id = 'render-test') {
	const events = new MovieEventBus();
	const seen = [];
	events.on('*', event => seen.push(event));
	return {
		events,
		job: new MovieRenderJob(id, { mode: 'test' }, events),
		seen
	};
}

test('render job reports progress and immutable completed result', async () => {
	const { job, seen } = createJob();
	job.start(async context => {
		context.onProgress(0.25);
		context.onProgress({ percent: 75 });
		return { bytes: 12, fileName: 'movie.webm' };
	});
	const snapshot = await job.wait();
	assert.equal(snapshot.state, 'completed');
	assert.equal(snapshot.progress, 1);
	assert.deepEqual(snapshot.result, {
		bytes: 12,
		fileName: 'movie.webm'
	});
	assert.equal(Object.isFrozen(snapshot), true);
	assert.doesNotThrow(() => JSON.stringify(snapshot));
	assert.deepEqual(
		seen.filter(event => event.type === 'render:state')
			.map(event => event.detail.state),
		['preparing', 'rendering', 'completed']
	);
	assert.deepEqual(
		seen.filter(event => event.type === 'render:progress')
			.map(event => event.detail.progress),
		[0.25, 0.75]
	);
});

test('executor failure becomes a failed serializable snapshot', async () => {
	const { job } = createJob('render-failed');
	job.start(async () => {
		const error = new Error('encoder failed');
		error.code = 'ENCODER_FAILED';
		throw error;
	});
	const snapshot = await job.wait();
	assert.equal(snapshot.state, 'failed');
	assert.equal(snapshot.error.code, 'ENCODER_FAILED');
	assert.match(snapshot.error.message, /encoder failed/);
});

test('cancel before start and during executor both end cancelled', async () => {
	const before = createJob('render-cancel-before').job;
	assert.equal(before.cancel('not needed'), true);
	assert.equal((await before.wait()).state, 'cancelled');
	assert.equal(before.cancel(), false);
	const during = createJob('render-cancel-during').job;
	let release;
	during.start(async context => {
		await new Promise(resolve => { release = resolve; });
		return { aborted: context.signal.aborted };
	});
	assert.equal(during.cancel('user stopped'), true);
	release();
	const snapshot = await during.wait();
	assert.equal(snapshot.state, 'cancelled');
	assert.equal(snapshot.error.code, 'MOVIE_RENDER_JOB_CANCELLED');
});

test('render result sanitizer removes functions and summarizes blobs when available', () => {
	const source = {
		fileName: 'movie.bin',
		handler() {},
		nested: { keep: true, skip: Symbol('skip') }
	};
	const value = serializeMovieRenderResult(source);
	assert.deepEqual(value, {
		fileName: 'movie.bin',
		nested: { keep: true }
	});
	if (typeof Blob !== 'undefined') {
		assert.deepEqual(
			serializeMovieRenderResult(new Blob(['abc'], { type: 'text/plain' })),
			{ bytes: 3, type: 'text/plain' }
		);
	}
});
