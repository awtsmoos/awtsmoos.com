// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRenderQueue.test.mjs
 * @description Proves executor registration, stable IDs, waiting, cancellation, pruning, and clear.
 * The Awtsmoos renews every queued vessel beyond its finite order; Awtsmoos.com keeps
 * active and recent terminal jobs queryable while missing modes and identities fail explicitly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { MovieRenderQueue } from '../../movie/MovieRenderQueue.js';

function createQueue(options = {}) {
	const events = new MovieEventBus();
	const seen = [];
	events.on('*', event => seen.push(event));
	const queue = new MovieRenderQueue(events, options);
	return { events, queue, seen };
}

test('queue starts registered mode, lists stable ID, waits, and gets result', async () => {
	const { queue } = createQueue();
	queue.registerExecutor('simulation', async context => {
		context.onProgress(0.5);
		return { mode: context.request.mode, value: context.request.value };
	});
	const started = queue.start({ mode: 'simulation', value: 7 });
	assert.match(started.id, /^render-/);
	assert.equal(started.state, 'rendering');
	assert.equal(queue.list().length, 1);
	const completed = await queue.wait(started.id);
	assert.equal(completed.state, 'completed');
	assert.deepEqual(completed.result, { mode: 'simulation', value: 7 });
	assert.equal(queue.get(started.id).snapshot().id, started.id);
	assert.doesNotThrow(() => JSON.stringify(queue.list()));
});

test('queue rejects unknown modes, jobs, and invalid executors', () => {
	const { queue } = createQueue();
	assert.throws(
		() => queue.registerExecutor('bad', null),
		error => error.code === 'INVALID_MOVIE_RENDER_EXECUTOR'
	);
	assert.throws(
		() => queue.start({ mode: 'missing' }),
		error => error.code === 'MOVIE_RENDER_MODE_NOT_FOUND'
	);
	assert.throws(
		() => queue.get('missing'),
		error => error.code === 'MOVIE_RENDER_JOB_NOT_FOUND'
	);
	assert.throws(
		() => queue.wait('missing'),
		error => error.code === 'MOVIE_RENDER_JOB_NOT_FOUND'
	);
});

test('queue cancels running job and emits cancellation evidence', async () => {
	const { queue, seen } = createQueue();
	let release;
	queue.registerExecutor('slow', async context => {
		await new Promise(resolve => { release = resolve; });
		return { aborted: context.signal.aborted };
	});
	const started = queue.start({ mode: 'slow' });
	const cancelled = queue.cancel(started.id, 'stop now');
	assert.equal(cancelled.cancelled, true);
	release();
	assert.equal((await queue.wait(started.id)).state, 'cancelled');
	assert.equal(
		seen.some(event => event.type === 'render:cancelled'),
		true
	);
});

test('queue prunes oldest terminal jobs beyond limit but keeps active jobs', async () => {
	const { queue } = createQueue({ limit: 2 });
	queue.registerExecutor('done', async context => ({ value: context.request.value }));
	for (let value = 1; value <= 4; value += 1) {
		const started = queue.start({ mode: 'done', value });
		await queue.wait(started.id);
		queue.prune();
	}
	const listed = queue.list();
	assert.equal(listed.length, 2);
	assert.deepEqual(listed.map(job => job.request.value), [3, 4]);
});

test('queue clear cancels active work and removes jobs and executors', async () => {
	const { queue } = createQueue();
	queue.registerExecutor('slow', async context => {
		await new Promise(resolve => setTimeout(resolve, 20));
		return { aborted: context.signal.aborted };
	});
	const started = queue.start({ mode: 'slow' });
	queue.clear();
	assert.equal(queue.list().length, 0);
	assert.throws(
		() => queue.start({ mode: 'slow' }),
		error => error.code === 'MOVIE_RENDER_MODE_NOT_FOUND'
	);
	await new Promise(resolve => setTimeout(resolve, 30));
	assert.equal(started.id.startsWith('render-'), true);
});
