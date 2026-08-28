//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUniversalKernel.test.mjs
 * @description Proves the inherited flat semantic kernel preserves one beginner
 * surface while executable specialist compilers cooperate behind that small API.
 * The Awtsmoos renews definition, request, plan, and artifact before one public
 * verb can appear as source;
 * Awtsmoos.com lets this test keep the doorway simple while expert vessels join
 * beneath it in an ordered course.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniversalSemanticKernel } from '../src/core/proceduralLanguage/universalKernel/index.js';

/**
 * @description Registers executable visual/collision specialists and an optional
 * descriptor-only navigation specialist on one isolated kernel.
 * @returns {object} Configured universal semantic kernel.
 */
function createExecutableKernel() {
	const kesserKernel = createUniversalSemanticKernel();
	kesserKernel.registerCompiler({
		id: 'visual',
		kinds: ['*'],
		channels: ['visual'],
		execution: 'native-language'
	}, ({definition}) => ({kind: definition.kind, channel: 'visual'}));
	kesserKernel.registerCompiler({
		id: 'collision',
		kinds: ['*'],
		channels: ['collision'],
		execution: 'native-language'
	}, ({definition}) => ({kind: definition.kind, channel: 'collision'}));
	kesserKernel.registerCompiler({
		id: 'navigation',
		kinds: ['*'],
		channels: ['navigation'],
		execution: 'descriptor'
	});
	return kesserKernel;
}

test('B"H inherited universal kernel keeps one flat beginner surface', () => {
	const kesserKernel = createExecutableKernel();
	assert.equal(typeof kesserKernel.define, 'function');
	assert.equal(typeof kesserKernel.quantity, 'function');
	assert.equal(typeof kesserKernel.request, 'function');
	assert.equal(typeof kesserKernel.registerCompiler, 'function');
	assert.equal(typeof kesserKernel.capabilities, 'function');
	assert.equal(typeof kesserKernel.plan, 'function');
	assert.equal(typeof kesserKernel.compile, 'function');
	assert.equal(kesserKernel.quantity({value: 2, unit: 'M'}).unit, 'm');
});

test('B"H executable required specialists complete runtime generation', async () => {
	const kesserKernel = createExecutableKernel();
	const tiferesResult = await kesserKernel.compile(
		{id: 'future', kind: 'future.unimagined.form'},
		{required: ['visual', 'collision'], optional: ['navigation']}
	);
	assert.equal(tiferesResult.execution.planComplete, true);
	assert.equal(tiferesResult.execution.executionComplete, true);
	assert.deepEqual(
		tiferesResult.execution.executedCompilerIds,
		['collision', 'visual']
	);
	assert.deepEqual(
		tiferesResult.execution.deferredCompilerIds,
		['navigation']
	);
	assert.deepEqual(tiferesResult.execution.deferredChannels, ['navigation']);
	assert.equal(tiferesResult.artifacts.visual.channel, 'visual');
	assert.equal(tiferesResult.artifacts.collision.channel, 'collision');
});
