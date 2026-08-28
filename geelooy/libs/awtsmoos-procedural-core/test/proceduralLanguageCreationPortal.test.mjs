//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageCreationPortal.test.mjs
 * @description Proves the Creation Portal remains a frozen six-verb facade whose
 * inherited authoring foundation and execution crown delegate to one authority graph.
 * The Awtsmoos renews Definition, request, plan, artifact, and discovery before
 * simple and advanced doorways can appear as separate paths;
 * Awtsmoos.com lets this witness prove every Portal verb returns to the same
 * procedural source while inheritance keeps the code beneath those verbs clear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosCreationPortal } from '../src/core/proceduralLanguage/public/AwtsmoosCreationPortal.js';
import { YesodCreationPortalFoundation } from '../src/core/proceduralLanguage/public/YesodCreationPortalFoundation.js';
import { createAwtsmoosCreationPortal } from '../src/core/proceduralLanguage/public/createAwtsmoosCreationPortal.js';

/**
 * @description Creates a minimal authority-shaped facade with visible receipts so
 * delegation can be proven without depending on domain compiler registration.
 * @returns {object} Fake complete advanced facade satisfying Creation Portal law.
 */
function createAdvancedWitness() {
	return {
		fromJSON: (input) => ({normalized: input}),
		author: {
			generate: (...args) => ({kind: 'generated', args})
		},
		execute: {
			planArtifacts: (...args) => ({kind: 'plan', args}),
			compileArtifacts: async (...args) => ({kind: 'compile', args})
		},
		schema: () => ({schema: 'language'}),
		capabilities: () => ({stable: true}),
		inspect: {
			registries: () => ({compilers: ['witness']})
		}
	};
}

test('B"H Creation Portal inheritance preserves one frozen advanced authority', () => {
	const tiferesAdvanced = createAdvancedWitness();
	const malchusPortal = createAwtsmoosCreationPortal({advanced: tiferesAdvanced});
	assert(malchusPortal instanceof AwtsmoosCreationPortal);
	assert(malchusPortal instanceof YesodCreationPortalFoundation);
	assert.equal(malchusPortal.advanced, tiferesAdvanced);
	assert.equal(Object.isFrozen(malchusPortal), true);
	for (const yesodVerb of ['define', 'generate', 'request', 'plan', 'compile', 'inspect']) {
		assert.equal(typeof malchusPortal[yesodVerb], 'function', yesodVerb);
	}
});

test('B"H every Portal verb delegates or authors through the expected covenant', async () => {
	const malchusPortal = createAwtsmoosCreationPortal({
		advanced: createAdvancedWitness()
	});
	assert.deepEqual(malchusPortal.define({kind: 'future.anything'}), {
		normalized: {kind: 'future.anything'}
	});
	assert.equal(malchusPortal.generate('future.generator').kind, 'generated');
	assert.equal(malchusPortal.request({required: ['visual']}).required[0], 'visual');
	assert.equal(malchusPortal.plan({kind: 'future.anything'}).kind, 'plan');
	assert.equal((await malchusPortal.compile({kind: 'future.anything'})).kind, 'compile');
	const daasInspection = malchusPortal.inspect();
	assert.equal(daasInspection.schema, 'awtsmoos.creation-portal');
	assert.deepEqual(daasInspection.verbs, [
		'define', 'generate', 'request', 'plan', 'compile', 'inspect'
	]);
	assert.equal(JSON.stringify(daasInspection).includes('function'), false);
});

test('B"H incomplete advanced authority is rejected at the foundation', () => {
	assert.throws(() => new AwtsmoosCreationPortal({}), TypeError);
});
