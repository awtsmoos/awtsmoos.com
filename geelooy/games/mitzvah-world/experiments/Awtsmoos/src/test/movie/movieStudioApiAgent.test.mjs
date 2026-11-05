// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiAgent.test.mjs
 * @description Proves agents can discover, compile, apply, undo, export, and await whole movies.
 * The Awtsmoos renews prompt, manifest, project, and revision through one source;
 * Awtsmoos.com verifies any JSON-speaking agent can coordinate without mutable runtime access.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('agent contract and example are complete immutable serializable documents', () => {
	const { api } = createMovieStudioApiHarness();
	const contract = api.agent.contract();
	const example = api.agent.example();
	assert.equal(Object.isFrozen(contract), true);
	assert.equal(Object.isFrozen(example), true);
	assert.ok(contract.supportedTrackTypes.camera.includes('shot'));
	assert.equal(example.scenes.length, 2);
	assert.doesNotThrow(() => JSON.stringify({ contract, example }));
});

test('agent compile is deterministic and does not mutate current project', () => {
	const { api } = createMovieStudioApiHarness();
	const before = JSON.stringify(api.project);
	const first = api.agent.compile(api.agent.example());
	const second = api.agent.compile(JSON.stringify(api.agent.example()));
	assert.equal(first.ok, true);
	assert.equal(second.ok, true);
	assert.equal(JSON.stringify(first.value), JSON.stringify(second.value));
	assert.equal(JSON.stringify(api.project), before);
	assert.equal(api.revision, 1);
});

test('agent apply creates one undoable revision and emits event', () => {
	const { api } = createMovieStudioApiHarness();
	const events = [];
	api.events.on('agent:applied', event => events.push(event));
	const result = api.agent.generate(api.agent.example(), {
		expectedRevision: 1,
		metadata: { prompt: 'complete journey' },
		requestId: 'agent-1'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.afterRevision, 2);
	assert.equal(api.project.title, 'Agent Generated Journey');
	assert.equal(api.project.tracks.some(track => track.type === 'camera'), true);
	assert.equal(events.length, 1);
	assert.equal(events[0].detail.requestId, 'agent-1');
	assert.equal(api.history.state().canUndo, true);
	api.history.undo();
	assert.equal(api.project.title, 'API Harness Movie');
	api.history.redo();
	assert.equal(api.project.title, 'Agent Generated Journey');
});

test('agent export returns verified serializable project envelope', () => {
	const { api } = createMovieStudioApiHarness();
	const result = api.agent.export(api.agent.example(), {
		exportedAt: '2026-07-28T00:00:00.000Z',
		metadata: { requestId: 'export-1' },
		revision: 9
	});
	assert.equal(result.ok, true);
	assert.equal(result.value.revision, 9);
	assert.equal(result.value.metadata.requestId, 'export-1');
	assert.equal(result.value.project.title, 'Agent Generated Journey');
	assert.doesNotThrow(() => JSON.stringify(result));
});

test('agent can await a future revision without polling', async () => {
	const { api } = createMovieStudioApiHarness();
	const pending = api.agent.waitForRevision(2, {
		requestId: 'wait-1',
		timeoutMs: 1000
	});
	queueMicrotask(() => {
		api.agent.apply(api.agent.example(), { expectedRevision: 1 });
	});
	const result = await pending;
	assert.equal(result.ok, true);
	assert.equal(result.value.revision, 2);
	assert.equal(result.metadata.requestId, 'wait-1');
});

test('agent revision wait times out with coded failure', async () => {
	const { api } = createMovieStudioApiHarness();
	const result = await api.agent.waitForRevision(99, { timeoutMs: 50 });
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'MOVIE_REVISION_WAIT_TIMEOUT');
});
