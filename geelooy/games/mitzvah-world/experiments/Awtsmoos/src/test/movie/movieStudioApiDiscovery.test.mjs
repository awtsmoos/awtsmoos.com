// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiDiscovery.test.mjs
 * @description Proves command, project, event, capability, and root-state discovery through the stable API.
 * The Awtsmoos renews action, entity, event, and witness beyond every interface; Awtsmoos.com
 * verifies agents may discover and wait through immutable JSON without polling or unsafe objects.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

const selected = { clipId: 'clip', trackId: 'actors' };

test('commands expose immutable catalog, descriptions, validation, and selection state', () => {
	const { api } = createMovieStudioApiHarness();
	const catalog = api.commands.catalog();
	assert.equal(catalog.length, api.commands.list().length);
	assert.equal(api.commands.describe('marker.add').internalName, 'addMarker');
	assert.equal(api.commands.describe('clip.split').requiresSelection, true);
	assert.equal(api.commands.validate({ type: 'marker.remove' }).valid, false);
	assert.equal(api.commands.state().selectionCount, 0);
	assert.equal(Object.isFrozen(catalog), true);
	assert.doesNotThrow(() => JSON.stringify(catalog));
});

test('project API queries stable metadata and exact references without revision change', () => {
	const { api } = createMovieStudioApiHarness();
	const before = api.revision;
	const query = api.project.query({
		clipId: 'clip',
		entity: 'clip'
	});
	assert.equal(query.clips.length, 1);
	assert.deepEqual(query.clips[0].descriptor, selected);
	const references = api.project.references('player');
	assert.ok(references.references.some(item => item.path === '/tracks/0/target'));
	assert.equal(api.revision, before);
	assert.equal(Object.isFrozen(references), true);
});

test('event API exposes sequence and resolves structured future waits', async () => {
	const { api } = createMovieStudioApiHarness();
	const boundary = api.events.sequence();
	const waiting = api.events.waitFor({
		afterSequence: boundary,
		detail: {
			selectionSet: {
				items: [selected]
			}
		},
		timeoutMs: 100,
		type: 'selection:changed'
	}, { requestId: 'wait-selection' });
	const selectedResult = api.selection.set(selected);
	assert.equal(selectedResult.ok, true);
	const result = await waiting;
	assert.equal(result.ok, true);
	assert.equal(result.metadata.requestId, 'wait-selection');
	assert.equal(result.value.type, 'selection:changed');
	assert.ok(result.value.sequence > boundary);
	assert.deepEqual(result.value.detail.selection, selected);
	assert.equal(api.events.sequence(), result.value.sequence);
});

test('event timeout becomes a structured coded failure', async () => {
	const { api } = createMovieStudioApiHarness();
	const result = await api.events.waitFor({
		timeoutMs: 10,
		type: 'render:completed'
	});
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'MOVIE_EVENT_WAIT_TIMEOUT');
});

test('capabilities and root JSON reveal new finite state without live objects', () => {
	const { api } = createMovieStudioApiHarness();
	api.selection.set(selected);
	assert.equal(api.capabilities.multiSelect, true);
	assert.equal(api.capabilities.commandCatalog, true);
	assert.equal(api.capabilities.projectQueries, true);
	assert.equal(api.capabilities.eventWaiting, true);
	const value = JSON.parse(JSON.stringify(api));
	assert.equal(value.selectionCount, 1);
	assert.deepEqual(value.selection, selected);
	assert.equal(value.commandState.selectionCount, 1);
	assert.equal(typeof value.eventSequence, 'number');
	assert.equal(JSON.stringify(value).includes('function'), false);
});
