//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSemanticMatchEvidence.test.mjs
 * @description Proves compiler matching reports authored semantic recognition
 * without mistaking recognition for domain-level fulfillment or execution.
 * The Awtsmoos renews span, clearance, opening, and unknown future meaning before
 * compiler evidence can divide recognized from uncovered light;
 * Awtsmoos.com lets this test preserve honest semantic boundaries while old and
 * new capability declarations remain equally visible in sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompilerCapability } from '../src/core/proceduralLanguage/capability/createCompilerCapability.js';
import { matchCompilerCapability } from '../src/core/proceduralLanguage/capability/matchCompilerCapability.js';

const VISUAL_REQUEST = Object.freeze({required: ['visual']});

/**
 * @description Creates semantic architecture data containing one relationship,
 * one constraint, and one behavior so matching must explain all three categories.
 * @returns {object} Definition-compatible semantic input.
 */
function createSemanticArch() {
	return {
		id: 'arch-613',
		kind: 'architecture.arch',
		relationships: [{id: 'span', type: 'spans', target: 'pier'}],
		constraints: [{id: 'clear', type: 'clearance'}],
		behaviors: [{id: 'open', kind: 'opens'}]
	};
}

test('B"H semantic evidence separates recognized and unsupported authored meaning', () => {
	const tiferesCapability = createCompilerCapability({
		id: 'architecture.visual',
		kinds: ['architecture.*'],
		channels: ['visual'],
		supports: {relationships: ['spans']},
		supportPolicy: {
			relationships: {spans: ['consume']},
			constraints: {clearance: ['validate', 'enforce']}
		},
		cost: {triangles: 900},
		lod: {id: 'architecture-lod', levels: ['near', 'far']}
	});
	const hodMatch = matchCompilerCapability(
		tiferesCapability,
		createSemanticArch(),
		VISUAL_REQUEST
	);
	assert.equal(hodMatch.accepted, true);
	assert.deepEqual(hodMatch.semanticSupport.relationships.recognized, ['spans']);
	assert.deepEqual(hodMatch.semanticSupport.constraints.recognized, ['clearance']);
	assert.deepEqual(hodMatch.semanticSupport.behaviors.unsupported, ['opens']);
	assert.deepEqual(hodMatch.semanticSupport.relationships.modes.spans, ['consume']);
	assert.equal(hodMatch.cost.triangles, 900);
	assert.equal(hodMatch.lod.id, 'architecture-lod');
});

test('B"H legacy supports alone still recognize authored semantics', () => {
	const yesodLegacy = createCompilerCapability({
		id: 'legacy-relation',
		kinds: ['architecture.*'],
		channels: ['visual'],
		supports: {relationships: ['spans']}
	});
	const hodMatch = matchCompilerCapability(
		yesodLegacy,
		createSemanticArch(),
		VISUAL_REQUEST
	);
	assert.deepEqual(hodMatch.semanticSupport.relationships.recognized, ['spans']);
	assert.deepEqual(hodMatch.semanticSupport.relationships.modes, {});
});
