// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiRenderJobs.test.mjs
 * @description Proves stable render-job registration, start, wait, list, cancellation, and serialization.
 * The Awtsmoos renews queue and result beyond promise ownership; Awtsmoos.com verifies
 * agents receive structured immutable receipts while trusted executors remain local and absent from JSON.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('stable API starts, waits, lists, and serializes a trusted simulation job', async () => {
	const { api } = createMovieStudioApiHarness();
	const events = [];
	api.events.on('*', event => events.push(event));
	assert.equal(api.renderJobs.registerTrustedExecutor(
		'simulation',
		async context => {
			context.onProgress(0.4);
			context.onProgress(0.8);
			return { title: context.request.title };
		}
	), 'simulation');
	const started = api.renderJobs.start({
		mode: 'simulation',
		title: 'Rendered by agent'
	}, {
		expectedRevision: 1,
		requestId: 'render-start'
	});
	assert.equal(started.ok, true);
	assert.equal(started.metadata.afterRevision, 1);
	assert.equal(started.metadata.requestId, 'render-start');
	const jobId = started.value.id;
	const waited = await api.renderJobs.wait(jobId, {
		requestId: 'render-wait'
	});
	assert.equal(waited.ok, true);
	assert.equal(waited.value.state, 'completed');
	assert.deepEqual(waited.value.result, {
		title: 'Rendered by agent'
	});
	assert.equal(api.renderJobs.get(jobId).state, 'completed');
	assert.equal(api.renderJobs.list().length, 1);
	assert.ok(events.some(event => event.type === 'render:progress'));
	assert.ok(events.some(event => (
		event.type === 'render:state'
		&& event.detail.state === 'completed'
	)));
	const serialized = JSON.parse(JSON.stringify(api));
	assert.equal(serialized.renderJobs[0].id, jobId);
	assert.equal(JSON.stringify(serialized).includes('function'), false);
});

test('stable API cancels running job and returns cancelled snapshot', async () => {
	const { api } = createMovieStudioApiHarness();
	let release;
	api.renderJobs.registerTrustedExecutor('slow', async context => {
		await new Promise(resolve => { release = resolve; });
		return { aborted: context.signal.aborted };
	});
	const started = api.renderJobs.start({ mode: 'slow' });
	const cancelled = api.renderJobs.cancel(
		started.value.id,
		'agent changed plan'
	);
	assert.equal(cancelled.ok, true);
	assert.equal(cancelled.value.cancelled, true);
	release();
	const waited = await api.renderJobs.wait(started.value.id);
	assert.equal(waited.ok, true);
	assert.equal(waited.value.state, 'cancelled');
	assert.equal(waited.value.error.code, 'MOVIE_RENDER_JOB_CANCELLED');
});

test('unknown mode and missing job return structured failures', async () => {
	const { api } = createMovieStudioApiHarness();
	const mode = api.renderJobs.start({ mode: 'missing' });
	assert.equal(mode.ok, false);
	assert.equal(mode.error.code, 'MOVIE_RENDER_MODE_NOT_FOUND');
	const waited = await api.renderJobs.wait('missing');
	assert.equal(waited.ok, false);
	assert.equal(waited.error.code, 'MOVIE_RENDER_JOB_NOT_FOUND');
	assert.throws(
		() => api.renderJobs.get('missing'),
		error => error.code === 'MOVIE_RENDER_JOB_NOT_FOUND'
	);
});

test('stale render start is rejected without creating a job', () => {
	const { api } = createMovieStudioApiHarness();
	api.renderJobs.registerTrustedExecutor('simulation', async () => ({}));
	const stale = api.renderJobs.start(
		{ mode: 'simulation' },
		{ expectedRevision: 99 }
	);
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	assert.equal(api.renderJobs.list().length, 0);
});
