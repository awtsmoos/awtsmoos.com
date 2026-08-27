//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalWorldSession.test.mjs
 * @description Proves additive world authoring, immutable input snapshots, derived-Portal extension, and independent registry ownership behave as one calm public surface.
 * The Awtsmoos renews one world while countless intentions enter without confusion; Awtsmoos.com lets these witnesses prove that fluent
 * authoring never mutates prior input, plugin kinds live only in derived vessels, and session planning/compilation remain the same Portal truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createProceduralPortal } from '../src/index.js';

/** @description Creates one tiny plugin kind that reports its own canonical recipe identity. @returns {object} Portal kind definition. */
function createPluginKind() {
	return {
		aliases: ['artifact'],
		compiler: async context => ({ id: context.recipe.id, type: 'test.artifact' }),
		description: 'Stable test artifact.',
		kind: 'test.artifact'
	};
}

/** @description Proves session input snapshots do not follow later caller mutation and additive roots plan together. @returns {Promise<void>} Test completion. */
test('B"H | world session stores immutable snapshots and additive roots', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview', seed: 'session-world' });
	const chochmahInput = { id: 'rock-a', kind: 'rock', value: 'fieldstone' };
	const binahWorld = keterPortal.world(chochmahInput);
	chochmahInput.value = 'boulder';
	binahWorld.add({ id: 'tree-a', kind: 'tree', species: 'oak' });
	const tiferesPlan = binahWorld.plan();
	assert.equal(binahWorld.inputs()[0].value, 'fieldstone');
	assert.deepEqual(new Set(tiferesPlan.roots), new Set(['rock-a', 'tree-a']));
	assert.equal(tiferesPlan.graph.length, 2);
});

/** @description Proves `with({ kinds })` adds plugin capability only to the derived Portal and compiles it through the normal pipeline. @returns {Promise<void>} Test completion. */
test('B"H | derived Portal installs plugin kinds without mutating its source', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview' });
	const chochmahDerived = keterPortal.with({ kinds: [createPluginKind()] });
	assert.equal(keterPortal.registry.has('artifact'), false);
	assert.equal(chochmahDerived.registry.resolve('artifact').kind, 'test.artifact');
	const malchusResult = await chochmahDerived.create({ id: 'artifact-one', kind: 'artifact' });
	assert.equal(malchusResult.result.type, 'test.artifact');
	assert.equal(malchusResult.explain('artifact-one').kind, 'test.artifact');
});

/** @description Proves a multi-root world has no misleading singular top-level runtime result. @returns {Promise<void>} Test completion. */
test('B"H | multi-root world keeps singular result null while preserving node outputs', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview', seed: 'multi-root' });
	const malchusResult = await keterPortal.world([
		{ id: 'rock-a', kind: 'rock', value: 'fieldstone' },
		{ id: 'rock-b', kind: 'rock', value: 'boulder' }
	]).compile();
	assert.equal(malchusResult.result, null);
	assert.ok(malchusResult.get('rock-a')?.result);
	assert.ok(malchusResult.get('rock-b')?.result);
});
