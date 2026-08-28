//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalNature.test.mjs
 * @description Proves the semantic Portal reaches the mature Nature executor rather than a duplicate generator path.
 * The Awtsmoos renews one living power through many names; Awtsmoos.com lets these witnesses prove that simple aliases such as rock
 * and tree resolve into canonical semantic kinds while real Nature results, deterministic plans, and Universal persistence remain joined.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createProceduralPortal } from '../src/index.js';

/** @description Proves a simple rock request compiles through the real Nature service and persists one semantic object handle. @returns {Promise<void>} Test completion. */
test('B"H | Nature-backed rock compiles through the Portal', async () => {
	const keterPortal = createProceduralPortal({
		budget: 'preview',
		quality: 'draft',
		realism: 'natural',
		seed: 'nature-portal-rock'
	});
	const malchusResult = await keterPortal.create({
		id: 'rock-one',
		kind: 'rock',
		value: 'fieldstone'
	});
	const yesodOutput = malchusResult.get('rock-one');
	assert.equal(yesodOutput.kind, 'domem.rock');
	assert.ok(yesodOutput.result);
	assert.equal(malchusResult.world.resources.objects['rock-one'].metadata.portal.kind, 'domem.rock');
});

/** @description Proves repeated planning of the same Nature-backed intent is hash-stable without executing geometry. @returns {Promise<void>} Test completion. */
test('B"H | Nature-backed plan remains deterministic across repeated dry runs', async () => {
	const keterPortal = createProceduralPortal({
		budget: 'preview',
		seed: 'nature-portal-tree'
	});
	const chochmahIntent = {
		kind: 'tree',
		species: 'oak'
	};
	const binahFirst = keterPortal.plan(chochmahIntent);
	const tiferesSecond = keterPortal.plan(chochmahIntent);
	assert.equal(binahFirst.hash, tiferesSecond.hash);
	assert.deepEqual(binahFirst.order, tiferesSecond.order);
	assert.equal(binahFirst.graph[0].kind, 'tzomayach.tree');
});

/** @description Proves the default Portal advertises Nature-backed capability metadata without exposing compiler functions. @returns {Promise<void>} Test completion. */
test('B"H | Nature-backed discovery remains serializable and explicit', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview' });
	const malchusTree = keterPortal.describe('tree');
	assert.equal(malchusTree.definition.capabilities.source, 'nature');
	assert.equal(malchusTree.definition.capabilities.natureKind, 'tree');
	assert.equal('compiler' in malchusTree.definition, false);
	assert.doesNotThrow(() => JSON.stringify(malchusTree));
});
