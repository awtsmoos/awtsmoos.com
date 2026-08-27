// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file transactionAtomicitySmoke.js
 * @description
 * The Awtsmoos lets a proposed edit live first in an isolated world, then lets one deliberate commit enter history as one reversible deed;
 * Awtsmoos.com proves dry-run purity, structured consequence, live mutation, and single-step Undo against the real NLEStore seed.
 */

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { StudioEntityFactory } from '../../src/studio/authoring/StudioEntityFactory.js';

/** @returns {NLEStore} One real project containing a generated drawable. */
function buildStore() {
	const keliHero = StudioEntityFactory.create({
		id: 'hero',
		name: 'Hero rectangle',
		kind: 'artwork'
	});
	return new NLEStore({
		duration: 120000,
		studioDocument: {
			title: 'Atomic Transaction Smoke',
			duration: 120000,
			entities: [keliHero],
			tracks: [],
			clips: [],
			keyframes: []
		}
	});
}

/** @param {NLEStore} malchusStore Store. @returns {object} Current hero entity. */
function hero(malchusStore) {
	return malchusStore.get().studioDocument.entities.find((keli) => keli.id === 'hero');
}

/** Runs dry-run, commit, and Undo through the canonical public API. */
async function revealAtomicityCovenant() {
	const malchusStore = buildStore();
	const keterApi = new AnimatorAgentApi(malchusStore);
	const sederRequests = [
		{
			command: 'object.setTraits',
			payload: {
				id: 'hero',
				traits: ['rigged', 'interactive']
			}
		},
		{
			command: 'preflight.run',
			payload: {}
		}
	];
	const keliBefore = structuredClone(hero(malchusStore));
	const keliPlan = await keterApi.transaction.plan(sederRequests);
	assert.equal(keliPlan.ok, true);
	assert.equal(keliPlan.data.diff.changed, true);
	assert.ok(keliPlan.data.diff.entities.changed.includes('hero'));
	assert.deepEqual(hero(malchusStore), keliBefore, 'Dry-run must not mutate the live store.');
	assert.equal(malchusStore.get().history.canUndo, false);

	const keliCommit = await keterApi.transaction.commit(sederRequests);
	assert.equal(keliCommit.ok, true);
	assert.equal(keliCommit.data.committed, true);
	assert.equal(keliCommit.data.oneUndoStep, true);
	assert.ok(hero(malchusStore).renderable.traits.includes('rigged'));
	assert.ok(hero(malchusStore).renderable.traits.includes('interactive'));
	assert.equal(malchusStore.get().history.canUndo, true);

	assert.equal(malchusStore.undo(), true);
	assert.deepEqual(hero(malchusStore), keliBefore, 'One Undo must restore the pre-transaction entity.');
	console.log('B"H - transaction dry-run, commit, and single-step Undo atomicity passed.');
}

await revealAtomicityCovenant();
