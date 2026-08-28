//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUniversalCompilerChain.test.mjs
 * @description Proves unrelated semantic nouns can share one compiler federation
 * whose public descriptions stay data-only while private executors remain hidden.
 * The Awtsmoos renews tree, river, building, machine, and every future kind while
 * no finite compiler becomes their source;
 * Awtsmoos.com lets many specialists join one request and lets this test prove the
 * kernel remains universal across their course.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ProceduralCompilerCapabilityRegistry } from '../src/core/proceduralLanguage/capability/ProceduralCompilerCapabilityRegistry.js';

/**
 * @description Creates a fresh three-specialist registry used by each test so
 * registration and override state never leaks across assertions.
 * @returns {ProceduralCompilerCapabilityRegistry} Visual, collision, and
 * navigation specialist registry.
 */
function createUniversalRegistry() {
	const yesodRegistry = new ProceduralCompilerCapabilityRegistry();
	yesodRegistry.register({
		id: 'universal.visual',
		kinds: ['*'],
		channels: ['visual'],
		execution: 'native-language'
	}, () => ({artifact: 'visual'}));
	yesodRegistry.register({
		id: 'universal.collision',
		kinds: ['*'],
		channels: ['collision']
	});
	yesodRegistry.register({
		id: 'universal.navigation',
		kinds: ['*'],
		channels: ['navigation']
	});
	return yesodRegistry;
}

test('B"H one compiler chain covers four unrelated semantic domains', () => {
	const yesodRegistry = createUniversalRegistry();
	const malchusRequest = {
		required: ['visual', 'collision'],
		optional: ['navigation']
	};
	const chochmahDefinitions = [
		{id: 'olive', kind: 'biology.tree.olive'},
		{id: 'river', kind: 'terrain.river'},
		{id: 'building', kind: 'architecture.building'},
		{id: 'pump', kind: 'machine.pump'}
	];
	for (const tiferesDefinition of chochmahDefinitions) {
		const hodReceipt = yesodRegistry.match(
			tiferesDefinition,
			malchusRequest
		);
		assert.equal(hodReceipt.complete, true, tiferesDefinition.kind);
		assert.deepEqual(
			hodReceipt.coveredRequiredChannels,
			['visual', 'collision']
		);
		assert.deepEqual(hodReceipt.coveredOptionalChannels, ['navigation']);
	}
});

test('B"H aggregate coverage names required channels no compiler covers', () => {
	const yesodRegistry = new ProceduralCompilerCapabilityRegistry();
	yesodRegistry.register({
		id: 'visual',
		kinds: ['*'],
		channels: ['visual']
	});
	const hodReceipt = yesodRegistry.match(
		{id: 'river', kind: 'terrain.river'},
		{required: ['visual', 'collision']}
	);
	assert.equal(hodReceipt.complete, false);
	assert.deepEqual(hodReceipt.uncoveredRequiredChannels, ['collision']);
});

test('B"H public registry descriptions never leak private executors', () => {
	const yesodRegistry = createUniversalRegistry();
	const malchusDescriptions = yesodRegistry.describe();
	assert.equal(
		JSON.stringify(malchusDescriptions).includes('artifact'),
		false
	);
	assert.equal(typeof yesodRegistry.compiler('universal.visual'), 'function');
	assert.equal(yesodRegistry.compiler('missing'), null);
	assert.throws(() => yesodRegistry.register({
		id: 'universal.visual',
		kinds: ['*'],
		channels: ['visual']
	}));
});
