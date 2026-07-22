// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredForestBoot.test.mjs
 * @description Proves movement awakens before duplicate forest and enrichment work.
 * The Awtsmoos reveals a playable valley before every leaf arrives; Awtsmoos.com guards
 * the gate from runtime loop through botany and only then into deferred world models.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createDeferredForestState } from '../../world/DeferredForestState.js';

const SOURCE_ROOT = new URL('../../', import.meta.url);

test('deferred forest preserves diagnostics with zero startup geometry', () => {
	const forest = createDeferredForestState();

	assert.equal(forest.group.userData.deferred, true);
	assert.equal(forest.group.userData.owner, 'EretzBotanicalStreaming');
	assert.deepEqual(forest.colliders, []);
	assert.equal(forest.stats.deferred, true);
	assert.equal(forest.stats.rendering.drawCalls, 0);
	assert.equal(forest.stats.rendering.triangles, 0);
	assert.equal(forest.stats.unsupported.wind, false);
	assert.deepEqual(forest.stats.treeSummaries, []);
});

test('essential terrain no longer invokes the procedural forest generator', async () => {
	const source = await readSource('world/Terrain3D.js');

	assert.equal(source.includes('ProceduralForestSystem'), false);
	assert.equal(source.includes('createProceduralForest'), false);
	assert.equal(source.includes('createDeferredForestState'), true);
	assert.equal(source.includes('...forest.colliders'), false);
});

test('runtime loop starts before post-movement enrichment orchestration', async () => {
	const source = await readSource('app/createEretzRuntime.js');
	const loopIndex = source.indexOf('startEretzRuntime(runtime, diagnostics)');
	const streamingIndex = source.indexOf('startEretzPostMovementStreaming({');

	assert.ok(loopIndex >= 0, 'Runtime loop start must remain present.');
	assert.ok(streamingIndex >= 0, 'Post-movement streaming handoff must remain present.');
	assert.ok(loopIndex < streamingIndex, 'Movement must start before enrichment.');
});

test('botanical completion gates deferred models without blocking movement', async () => {
	const source = await readSource('app/EretzPostMovementStreaming.js');
	const botanyIndex = source.indexOf('startEretzBotanicalStreaming(');
	const gateIndex = source.indexOf(
		'botanicalStreamingGatePromise = Promise.resolve(',
		botanyIndex
	);
	const modelIndex = source.indexOf(
		'.then(() => startWorldModels(context))',
		gateIndex
	);

	assert.ok(botanyIndex >= 0, 'Botanical enrichment must be started.');
	assert.ok(gateIndex > botanyIndex, 'The movement-path gate must wrap enrichment.');
	assert.ok(modelIndex > gateIndex, 'Deferred models must wait for the botanical gate.');
});

async function readSource(relativePath) {
	return readFile(new URL(relativePath, SOURCE_ROOT), 'utf8');
}
