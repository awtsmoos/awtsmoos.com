//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralPortalDefinitionProvenance.test.mjs
 * @description Proves one native Portal specialist receives canonical definition
 * identity and artifact desire, then the same evidence survives runtime output,
 * explanation, and Universal World persistence without inference after compilation.
 * The Awtsmoos renews cause and garment in one instant though finite code sees a
 * chain; Awtsmoos.com lets every link preserve the same semantic witness so future
 * editors can regenerate a thing without guessing what its earlier author meant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PortalKindRegistry,
	ProceduralPortal
} from '../src/core/proceduralPortal/index.js';

test('B"H canonical definition provenance survives native compilation', async () => {
	let hodContext = null;
	const malchusPortal = new ProceduralPortal({
		budget: 'preview',
		registry: new PortalKindRegistry([{
			kind: 'test.semantic-arch',
			capabilities: {channels: ['visual', 'collision']},
			compiler: async (tiferesContext) => {
				hodContext = tiferesContext;
				return {type: 'test.semantic-arch.result'};
			}
		}]),
		seed: 'definition-provenance',
		services: {}
	});
	const hodResult = await malchusPortal.create({
		id: 'arch-613',
		kind: 'test.semantic-arch',
		traits: {
			structural: {values: {loadBearing: true}}
		},
		compile: {
			required: ['visual'],
			optional: ['collision']
		}
	});
	const hodOutput = hodResult.get('arch-613');
	const daasExplanation = hodResult.explain('arch-613');
	const yesodWorld = hodResult.world.resources.objects['arch-613'].metadata.portal;
	assert.equal(hodContext.canonicalDefinition.kind, 'test.semantic-arch');
	assert.equal(hodContext.definitionHash, hodOutput.definitionHash);
	assert.equal(hodOutput.definitionHash, hodOutput.recipeHash);
	assert.deepEqual(hodContext.artifactRequest.required, ['visual']);
	assert.deepEqual(hodContext.artifactRequest.optional, ['collision']);
	assert.equal(daasExplanation.definitionHash, hodOutput.definitionHash);
	assert.deepEqual(daasExplanation.artifactRequest, hodContext.artifactRequest);
	assert.equal(yesodWorld.definitionHash, hodOutput.definitionHash);
	assert.deepEqual(yesodWorld.artifactRequest, hodContext.artifactRequest);
});
