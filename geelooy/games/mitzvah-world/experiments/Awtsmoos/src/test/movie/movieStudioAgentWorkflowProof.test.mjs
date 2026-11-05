// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioAgentWorkflowProof.test.mjs
 * @description Proves one detached agent can discover, query, select, import, batch, wait, render, serialize, and reproduce a movie.
 * The Awtsmoos renews intent into authored frames without hidden hands; Awtsmoos.com verifies
 * every finite receipt is immutable JSON while executors, DOM, functions, and mutable vessels remain private.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

const first = { clipId: 'clip', trackId: 'actors' };
const second = { clipId: 'clip-two', trackId: 'actors' };

function twoClipProject(api) {
	const project = JSON.parse(JSON.stringify(api.project.snapshot()));
	project.title = 'Agent-authored deterministic movie';
	project.tracks[0].clips.push({
		...project.tracks[0].clips[0],
		id: 'clip-two',
		start: 8,
		trim: { end: 8, start: 0 }
	});
	return project;
}

function assertJsonSafe(value) {
	const text = JSON.stringify(value);
	assert.equal(text.includes('[object HTMLElement]'), false);
	assert.equal(text.includes('function'), false);
	assert.doesNotThrow(() => JSON.parse(text));
	return JSON.parse(text);
}

test('detached stable API completes the full single-studio agent workflow', async () => {
	const { api } = createMovieStudioApiHarness();
	assert.equal(api.capabilities.commandCatalog, true);
	assert.ok(api.commands.catalog().length > 10);
	assert.equal(api.commands.validate({ type: 'marker.remove' }).valid, false);
	assert.equal(api.project.query({ entity: 'track' }).tracks[0].id, 'actors');
	assert.ok(api.project.references('player').references.length > 0);
	assert.equal(api.project.replace(twoClipProject(api)).ok, true);
	assert.equal(api.selection.set(first).ok, true);
	assert.equal(api.selection.setMany([first, second]).value.selectionCount, 2);
	assert.deepEqual(api.selection.setRange({ end: 9, start: 2 }).value.selectionSet.range, {
		end: 9,
		start: 2
	});
	const future = api.events.waitFor({
		afterSequence: api.events.sequence(),
		timeoutMs: 100,
		type: 'project:changed'
	});
	const batch = api.transactions.execute([
		{ payload: { label: 'Opening', time: 2 }, type: 'marker.add' },
		{ payload: { label: 'Closing', time: 9 }, type: 'marker.add' }
	]);
	assert.equal(batch.ok, true);
	assert.equal((await future).ok, true);
	assert.equal(api.project.markers.length, 2);
	api.renderJobs.registerTrustedExecutor('agent-proof', async context => {
		context.onProgress(0.5);
		return { title: context.request.title };
	});
	const started = api.renderJobs.start({
		mode: 'agent-proof',
		title: api.project.title
	});
	assert.equal((await api.renderJobs.wait(started.value.id)).value.state, 'completed');
	assert.equal(api.renderJobs.list().length, 1);
	const envelope = api.project.serialize();
	const authored = JSON.stringify(api.project.snapshot());
	assert.equal(api.project.import(envelope).ok, true);
	assert.equal(JSON.stringify(api.project.snapshot()), authored);
	assert.equal(assertJsonSafe(api).selectionCount, 2);
	assert.equal(assertJsonSafe(api.project.export()).project.title, api.project.title);
	assert.equal(Object.isFrozen(api.commands.catalog()), true);
});
