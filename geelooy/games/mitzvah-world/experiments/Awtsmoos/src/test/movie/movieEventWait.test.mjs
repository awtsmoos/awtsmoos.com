// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieEventWait.test.mjs
 * @description Proves future sequence boundaries, detail matching, timeout, abort, destroy, and cleanup.
 * The Awtsmoos renews every event beyond delay and listener; Awtsmoos.com verifies
 * agents may wait without polling while no subscription, timer, or abort hook remains behind.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { waitForMovieEvent } from '../../movie/MovieEventWait.js';

function session() {
	return { events: new MovieEventBus() };
}

test('wait resolves only for a matching future event beyond sequence boundary', async () => {
	const value = session();
	value.events.emit('project:changed', { revision: 1 });
	const boundary = value.events.sequence;
	const waiting = waitForMovieEvent(value, {
		afterSequence: boundary,
		detail: { nested: { ready: true }, revision: 3 },
		timeoutMs: 100,
		type: 'project:changed'
	});
	value.events.emit('project:changed', { revision: 2 });
	value.events.emit('project:changed', {
		nested: { extra: 'kept', ready: true },
		revision: 3
	});
	const event = await waiting;
	assert.equal(event.sequence, boundary + 2);
	assert.equal(event.detail.revision, 3);
	assert.equal(Object.isFrozen(event), true);
	assert.equal(value.events.listeners.size, 0);
});

test('wildcard wait matches immutable detail and preserves event type', async () => {
	const value = session();
	const waiting = waitForMovieEvent(value, {
		detail: { jobId: 'render-one' },
		timeoutMs: 100,
		type: '*'
	});
	value.events.emit('render:progress', {
		jobId: 'render-one',
		progress: 0.5
	});
	const event = await waiting;
	assert.equal(event.type, 'render:progress');
	assert.equal(event.detail.progress, 0.5);
});

test('timeout returns coded failure and removes listeners', async () => {
	const value = session();
	await assert.rejects(
		() => waitForMovieEvent(value, {
			timeoutMs: 10,
			type: 'selection:changed'
		}),
		error => error.code === 'MOVIE_EVENT_WAIT_TIMEOUT'
	);
	assert.equal(value.events.listeners.size, 0);
});

test('abort returns coded failure and removes listeners', async () => {
	const value = session();
	const controller = new AbortController();
	const waiting = waitForMovieEvent(
		value,
		{ timeoutMs: 100, type: 'project:changed' },
		{ signal: controller.signal }
	);
	controller.abort('agent cancelled');
	await assert.rejects(
		() => waiting,
		error => error.code === 'MOVIE_EVENT_WAIT_ABORTED'
	);
	assert.equal(value.events.listeners.size, 0);
});

test('session destruction rejects unrelated waits but may itself be awaited', async () => {
	const value = session();
	const projectWait = waitForMovieEvent(value, {
		timeoutMs: 100,
		type: 'project:changed'
	});
	const destroyWait = waitForMovieEvent(value, {
		timeoutMs: 100,
		type: 'session:destroyed'
	});
	value.events.emit('session:destroyed', { instanceId: 'studio-one' });
	await assert.rejects(
		() => projectWait,
		error => error.code === 'MOVIE_EVENT_WAIT_SESSION_DESTROYED'
	);
	assert.equal((await destroyWait).detail.instanceId, 'studio-one');
	assert.equal(value.events.listeners.size, 0);
});
