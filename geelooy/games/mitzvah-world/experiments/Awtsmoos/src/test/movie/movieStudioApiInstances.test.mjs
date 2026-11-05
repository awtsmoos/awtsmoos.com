// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiInstances.test.mjs
 * @description Proves immutable instance discovery and revision-neutral alias activation through the API.
 * The Awtsmoos renews every studio without confusing identity with project mutation;
 * Awtsmoos.com lets agents choose a finite active vessel while JSON reveals metadata alone.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioInstanceHarness } from './movieStudioInstanceHarness.mjs';

test('instance API lists metadata and activates another studio without revision change', () => {
	const harness = createMovieStudioInstanceHarness();
	const events = [];
	harness.second.api.events.on('instance:activated', event => events.push(event));
	assert.equal(harness.second.api.instances.state().activeId, 'studio-second');
	assert.deepEqual(
		harness.first.api.instances.list().map(item => item.id),
		['studio-first', 'studio-second']
	);
	const result = harness.second.api.instances.activate('studio-first', {
		expectedRevision: 1,
		requestId: 'activate-first'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.beforeRevision, 1);
	assert.equal(result.metadata.afterRevision, 1);
	assert.equal(result.metadata.requestId, 'activate-first');
	assert.equal(result.value.activeId, 'studio-first');
	assert.equal(globalThis.AwtsmoosMovie, harness.first.api);
	assert.equal(harness.second.api.instances.current().id, 'studio-first');
	assert.equal(events.length, 1);
	assert.equal(events[0].detail.instanceId, 'studio-first');
	harness.destroy();
});

test('instance API returns structured missing-instance failure without moving alias', () => {
	const harness = createMovieStudioInstanceHarness();
	const active = globalThis.AwtsmoosMovie;
	const result = harness.first.api.instances.activate('missing-studio');
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'MOVIE_STUDIO_INSTANCE_NOT_FOUND');
	assert.equal(globalThis.AwtsmoosMovie, active);
	assert.equal(harness.registry.state().activeId, 'studio-second');
	harness.destroy();
});

test('root API serialization contains instance metadata but no session implementation', () => {
	const harness = createMovieStudioInstanceHarness();
	const value = JSON.parse(JSON.stringify(harness.first.api));
	assert.equal(value.instances.activeId, 'studio-second');
	assert.equal(value.instances.instances.length, 2);
	assert.deepEqual(
		value.instances.instances.map(item => item.title),
		['First Studio', 'Second Studio']
	);
	assert.equal(JSON.stringify(value).includes('publicApi'), false);
	assert.equal(JSON.stringify(value).includes('instanceRegistry'), false);
	assert.equal(JSON.stringify(value).includes('function'), false);
	harness.destroy();
});
