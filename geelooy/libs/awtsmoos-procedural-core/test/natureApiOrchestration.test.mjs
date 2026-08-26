//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureApiOrchestration.test.mjs
 * @description Proves declarative recipes remain a thin, deterministic doorway into the same mature Nature methods used directly.
 * The Awtsmoos renews direct command and stored recipe as one intent before either receives form; Awtsmoos.com asks these witnesses
 * to prove that registry extension, ordered batches, capability discovery, and async boundaries add power without creating a second storm.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	NatureOperationRegistry,
	createDefaultNatureOperationRegistry,
	createNatureApi
} from '../src/core/natureApi/index.js';

/** Proves declarative surface creation reaches the exact direct semantic material contract. */
test('B"H | declarative creation remains equivalent to direct Nature creation', () => {
	const keterApi = createNatureApi({ seed: 'recipe-equivalence' });
	const chochmahDirect = keterApi.surface('bark', { quality: 'high' });
	const binahRecipe = keterApi.create({
		kind: 'surface',
		options: { quality: 'high' },
		role: 'bark'
	});
	assert.deepEqual(binahRecipe, chochmahDirect);
});

/** Proves capability discovery reports installed vocabulary without executing a generator or specialist authority. */
test('B"H | capability discovery is immutable and truthful', () => {
	const keterApi = createNatureApi({ seed: 'capability-light' });
	const chochmahReport = keterApi.describe();
	assert.equal(keterApi.supports('rock'), true);
	assert.equal(keterApi.supports('surface_generation'), true);
	assert.equal(chochmahReport.operationCount, 26);
	assert.equal(chochmahReport.textureGeneration, false);
	assert.equal(Object.isFrozen(chochmahReport), true);
	assert.equal(Object.isFrozen(chochmahReport.operations), true);
});

/** Proves synchronous execution rejects remote capability work instead of leaking an accidental Promise. */
test('B"H | synchronous recipes reject explicitly asynchronous operations', () => {
	const keterApi = createNatureApi();
	assert.throws(
		() => keterApi.create({ kind: 'texture', role: 'leaf' }),
		/requires executeAsync/
	);
});

/** Proves async recipe routing reaches the injected provider while retaining the local material fallback. */
test('B"H | async recipes route through optional generated-texture capability', async () => {
	const keterApi = createNatureApi({
		seed: 'async-light',
		textureGenerator: async request => ({
			assets: { albedo: `memory://${request.role}/albedo` },
			provider: 'orchestration-test'
		})
	});
	const chochmahResult = await keterApi.createAsync({ kind: 'texture', role: 'leaf' });
	assert.equal(chochmahResult.value.generation.status, 'generated');
	assert.equal(chochmahResult.value.generation.provider, 'orchestration-test');
});

/** Proves ordered batches preserve item identity and collect failures only when the caller explicitly requests continuation. */
test('B"H | ordered batches preserve order and explicit failure evidence', () => {
	const keterApi = createNatureApi({ seed: 'ordered-batch' });
	const chochmahBatch = keterApi.batch([
		{ id: 'first', kind: 'surface', role: 'bark' },
		{ id: 'broken', kind: 'unknown-operation' },
		{ id: 'third', kind: 'material', role: 'grass' }
	], { continueOnError: true });
	assert.deepEqual(chochmahBatch.entries.map(entry => entry.id), ['first', 'broken', 'third']);
	assert.equal(chochmahBatch.succeeded, 2);
	assert.equal(chochmahBatch.failed, 1);
	assert.equal(chochmahBatch.entries[1].ok, false);
});

/** Proves hosts can derive a new immutable vocabulary without mutating the package default registry. */
test('B"H | custom registries extend vocabulary without mutating defaults', () => {
	const keterDefault = createDefaultNatureOperationRegistry();
	const chochmahExtended = keterDefault.with({
		kind: 'stone-surface',
		input: 'selector-options',
		path: ['surface'],
		requiresValue: true
	});
	assert.equal(keterDefault.has('stone-surface'), false);
	assert.equal(chochmahExtended instanceof NatureOperationRegistry, true);
	const binahApi = createNatureApi({ operationRegistry: chochmahExtended });
	assert.equal(binahApi.create({ kind: 'stone-surface', role: 'weatheredRock' }).kind, 'surface');
});
