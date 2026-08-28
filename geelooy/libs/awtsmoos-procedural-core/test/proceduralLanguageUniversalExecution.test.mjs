//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUniversalExecution.test.mjs
 * @description Proves universal compilation distinguishes semantic plan coverage
 * from real executor coverage and rejects incomplete strict plans before effects.
 * The Awtsmoos renews knowledge, action, delay, and absence before success can be
 * named by a finite receipt;
 * Awtsmoos.com lets this gate keep descriptor possibility honest until an actual
 * trusted compiler reveals the artifact beneath.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniversalSemanticKernel } from '../src/core/proceduralLanguage/universalKernel/index.js';

test('B"H descriptor-only required knowledge remains explicitly unexecuted', async () => {
	const kesserKernel = createUniversalSemanticKernel();
	kesserKernel.registerCompiler({
		id: 'navigation-description',
		kinds: ['*'],
		channels: ['navigation'],
		execution: 'descriptor'
	});
	const tiferesResult = await kesserKernel.compile(
		{id: 'river', kind: 'terrain.river'},
		{required: ['navigation']}
	);
	assert.equal(tiferesResult.execution.planComplete, true);
	assert.equal(tiferesResult.execution.executionComplete, false);
	assert.deepEqual(
		tiferesResult.execution.unexecutedRequiredChannels,
		['navigation']
	);
	assert.deepEqual(
		tiferesResult.execution.deferredCompilerIds,
		['navigation-description']
	);
});

test('B"H strict compile rejects uncovered requirements before execution', async () => {
	const kesserKernel = createUniversalSemanticKernel();
	let gevurahExecutions = 0;
	kesserKernel.registerCompiler({
		id: 'visual',
		kinds: ['*'],
		channels: ['visual'],
		execution: 'native-language'
	}, () => {
		gevurahExecutions += 1;
		return {channel: 'visual'};
	});
	await assert.rejects(
		kesserKernel.compile(
			{id: 'machine', kind: 'machine.pump'},
			{required: ['visual', 'collision']}
		),
		RangeError
	);
	assert.equal(gevurahExecutions, 0);
});
