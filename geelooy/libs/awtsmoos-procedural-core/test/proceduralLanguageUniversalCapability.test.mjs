//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUniversalCapability.test.mjs
 * @description Proves compiler capabilities match generic semantic meaning rather
 * than requiring the universal kernel to recognize any particular created noun.
 * The Awtsmoos renews kind, trait, relation, constraint, behavior, and refusal;
 * Awtsmoos.com lets these tests keep eligibility explainable while future domain
 * plugins arrive through data instead of another hard-coded conditional.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompilerCapability } from '../src/core/proceduralLanguage/capability/createCompilerCapability.js';
import { matchCompilerCapability } from '../src/core/proceduralLanguage/capability/matchCompilerCapability.js';

const VISUAL_REQUEST = Object.freeze({required: ['visual']});

test('B"H capabilities match exact, namespace, and wildcard kinds', () => {
	const chochmahExact = createCompilerCapability({
		id: 'exact',
		kinds: ['machine.pump'],
		channels: ['visual']
	});
	const binahNamespace = createCompilerCapability({
		id: 'architecture',
		kinds: ['architecture.*'],
		channels: ['visual']
	});
	const tiferesWildcard = createCompilerCapability({
		id: 'universal',
		kinds: ['*'],
		channels: ['visual']
	});
	assert.equal(
		matchCompilerCapability(
			chochmahExact,
			{id: 'pump', kind: 'machine.pump'},
			VISUAL_REQUEST
		).accepted,
		true
	);
	assert.equal(
		matchCompilerCapability(
			binahNamespace,
			{id: 'arch', kind: 'architecture.building'},
			VISUAL_REQUEST
		).accepted,
		true
	);
	assert.equal(
		matchCompilerCapability(
			tiferesWildcard,
			{id: 'future', kind: 'unknown.future.kind'},
			VISUAL_REQUEST
		).accepted,
		true
	);
});

test('B"H semantic prerequisites explain missing meaning precisely', () => {
	const gevurahCapability = createCompilerCapability({
		id: 'semantic-span',
		kinds: ['architecture.*'],
		requires: {
			traitsAll: ['structural'],
			traitsAny: ['walkable', 'habitable'],
			relationships: ['spans'],
			constraints: ['clearance'],
			behaviors: ['opens']
		},
		channels: ['visual']
	});
	const hodMissing = matchCompilerCapability(
		gevurahCapability,
		{id: 'arch', kind: 'architecture.arch'},
		VISUAL_REQUEST
	);
	assert.equal(hodMissing.accepted, false);
	assert.equal(hodMissing.reasons.length, 5);
	assert(hodMissing.reasons.includes('traits-all:structural'));
	assert(hodMissing.reasons.includes('traits-any:walkable,habitable'));
	assert(hodMissing.reasons.includes('relationships:spans'));
	assert(hodMissing.reasons.includes('constraints:clearance'));
	assert(hodMissing.reasons.includes('behaviors:opens'));
});

test('B"H channel irrelevance does not masquerade as semantic incompatibility', () => {
	const hodAudio = createCompilerCapability({
		id: 'audio-only',
		kinds: ['*'],
		channels: ['audio']
	});
	const malchusMatch = matchCompilerCapability(
		hodAudio,
		{id: 'future', kind: 'unknown.future.kind'},
		VISUAL_REQUEST
	);
	assert.equal(malchusMatch.semanticallyEligible, true);
	assert.equal(malchusMatch.relevant, false);
	assert.equal(malchusMatch.accepted, false);
});
