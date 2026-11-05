// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInstanceLifecycle.test.mjs
 * @description Proves active-instance destruction promotes another studio and final destruction clears alias.
 * The Awtsmoos renews every vessel without residue; Awtsmoos.com verifies one departing
 * editor cannot silence its living neighbor, while the final departure leaves no false global name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { destroyMovieStudioSession } from '../../movie/MovieStudioLifecycle.js';
import { createMovieStudioInstanceHarness } from './movieStudioInstanceHarness.mjs';

test('destroying active studio promotes remaining instance and final destroy clears alias', async () => {
	const harness = createMovieStudioInstanceHarness();
	const removedEvents = [];
	harness.second.api.events.on(
		'instance:unregistered',
		event => removedEvents.push(event)
	);
	assert.equal(globalThis.AwtsmoosMovie, harness.second.api);
	assert.equal(await destroyMovieStudioSession(harness.second.session), true);
	assert.equal(await destroyMovieStudioSession(harness.second.session), false);
	assert.equal(harness.registry.state().activeId, 'studio-first');
	assert.equal(harness.registry.list().length, 1);
	assert.equal(globalThis.AwtsmoosMovie, harness.first.api);
	assert.equal(removedEvents.length, 1);
	assert.equal(removedEvents[0].detail.instanceId, 'studio-second');
	assert.equal(await destroyMovieStudioSession(harness.first.session), true);
	assert.equal(harness.registry.state().activeId, null);
	assert.equal(harness.registry.list().length, 0);
	assert.equal(globalThis.AwtsmoosMovie, undefined);
});

test('destroying inactive studio preserves active alias', async () => {
	const harness = createMovieStudioInstanceHarness();
	assert.equal(globalThis.AwtsmoosMovie, harness.second.api);
	assert.equal(await destroyMovieStudioSession(harness.first.session), true);
	assert.equal(harness.registry.state().activeId, 'studio-second');
	assert.equal(globalThis.AwtsmoosMovie, harness.second.api);
	assert.equal(await destroyMovieStudioSession(harness.second.session), true);
	assert.equal(globalThis.AwtsmoosMovie, undefined);
});
