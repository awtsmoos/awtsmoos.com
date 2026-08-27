// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieEventBus.test.mjs
 * @description Proves immutable serializable subscriptions, once, wildcard, removal, and isolation.
 * The Awtsmoos renews event and listener without captivity; Awtsmoos.com verifies that
 * one failing finite listener cannot mutate evidence or silence any later subscriber.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieEventBus } from '../../movie/MovieEventBus.js';

test('event bus emits immutable serializable ordered events', () => {
	const bus = new MovieEventBus();
	const received = [];
	bus.on('project:changed', event => received.push(event));
	const receipt = bus.emit('project:changed', { revision: 2, title: 'Movie' });
	assert.equal(receipt.delivered, 1);
	assert.equal(received[0].sequence, 1);
	assert.equal(received[0].detail.revision, 2);
	assert.equal(Object.isFrozen(received[0]), true);
	assert.doesNotThrow(() => JSON.stringify(received[0]));
	assert.throws(() => { received[0].detail.revision = 9; }, TypeError);
});

test('once, wildcard, unsubscribe, and off are deterministic', () => {
	const bus = new MovieEventBus();
	const calls = [];
	bus.once('alpha', () => calls.push('once'));
	const listener = event => calls.push(`wild:${event.type}`);
	const unsubscribe = bus.on('*', listener);
	bus.emit('alpha');
	bus.emit('alpha');
	unsubscribe();
	assert.equal(bus.off('*', listener), false);
	bus.emit('beta');
	assert.deepEqual(calls, ['once', 'wild:alpha', 'wild:alpha']);
});

test('listener failures are reported without stopping delivery', () => {
	const bus = new MovieEventBus();
	const calls = [];
	bus.on('event', () => { throw new Error('broken listener'); });
	bus.on('event', () => calls.push('delivered'));
	const receipt = bus.emit('event');
	assert.deepEqual(calls, ['delivered']);
	assert.equal(receipt.delivered, 2);
	assert.equal(receipt.errors[0].message, 'broken listener');
});

test('clear removes all subscriptions', () => {
	const bus = new MovieEventBus();
	let calls = 0;
	bus.on('*', () => { calls += 1; });
	bus.clear();
	assert.equal(bus.emit('event').delivered, 0);
	assert.equal(calls, 0);
});
