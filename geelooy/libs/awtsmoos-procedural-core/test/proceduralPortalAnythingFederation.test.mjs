//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralPortalAnythingFederation.test.mjs
 * @description Proves a semantic noun never hardcoded into Portal can enter through
 * ordinary create(), resolve dynamically through the Universal Semantic Kernel, and
 * compile requested channels while Portal discovery remains noun-neutral.
 * The Awtsmoos renews every known and future noun before registry or compiler can
 * foresee its face; Awtsmoos.com lets this witness prove the grammar stays open while
 * actual manifestation remains bounded by explicitly installed specialist grace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createProceduralPortal } from '../src/core/proceduralPortal/index.js';
import {
	createUniversalSemanticKernel
} from '../src/core/proceduralLanguage/universalKernel/index.js';

/**
 * @description Creates an isolated noun-neutral kernel with executable visual and
 * collision specialists plus descriptor-only optional navigation evidence.
 * @returns {object} Configured Universal Semantic Kernel.
 */
function createAnythingKernel() {
	const kesserKernel = createUniversalSemanticKernel();
	kesserKernel.registerCompiler({
		id: 'anything.visual',
		kinds: ['*'],
		channels: ['visual'],
		execution: 'native-language'
	}, ({definition}) => ({kind: definition.kind, channel: 'visual'}));
	kesserKernel.registerCompiler({
		id: 'anything.collision',
		kinds: ['*'],
		channels: ['collision'],
		execution: 'native-language'
	}, ({definition}) => ({kind: definition.kind, channel: 'collision'}));
	kesserKernel.registerCompiler({
		id: 'anything.navigation',
		kinds: ['*'],
		channels: ['navigation'],
		execution: 'descriptor'
	});
	return kesserKernel;
}

test('B"H unknown nouns compile through Portal without new facade methods', async () => {
	const malchusPortal = createProceduralPortal({
		budget: 'preview',
		proceduralKernel: createAnythingKernel(),
		seed: 'anything-federation'
	});
	const tiferesDiscovery = malchusPortal.describe();
	assert.equal(tiferesDiscovery.definitionModel, 'awtsmoos.procedural-language/1');
	assert.ok(tiferesDiscovery.artifactChannels.includes('visual'));
	assert.ok(tiferesDiscovery.artifactChannels.includes('navigation'));
	const hodResult = await malchusPortal.create({
		id: 'garden-613',
		kind: 'future.quantum-garden',
		compile: {
			required: ['visual', 'collision'],
			optional: ['navigation']
		}
	});
	const malchusKernelResult = hodResult.result;
	const daasExplanation = hodResult.explain('garden-613');
	assert.equal(malchusKernelResult.execution.executionComplete, true);
	assert.deepEqual(
		malchusKernelResult.execution.executedCompilerIds,
		['anything.collision', 'anything.visual']
	);
	assert.deepEqual(
		malchusKernelResult.execution.deferredCompilerIds,
		['anything.navigation']
	);
	assert.deepEqual(daasExplanation.artifactRequest.required, ['visual', 'collision']);
	assert.equal(
		daasExplanation.definitionHash,
		hodResult.world.resources.objects['garden-613'].metadata.portal.definitionHash
	);
});
