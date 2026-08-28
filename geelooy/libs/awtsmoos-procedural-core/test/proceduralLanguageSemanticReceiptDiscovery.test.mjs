//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSemanticReceiptDiscovery.test.mjs
 * @description Proves chain receipts and Portal federation discovery aggregate
 * semantic coverage, cost, and LOD evidence without exposing compiler executors.
 * The Awtsmoos renews every specialist before partial expertise can gather as one;
 * Awtsmoos.com lets Daas name what the chain understands and what remains outside
 * while hidden execution stays concealed beneath the procedural sun.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompilerCapability } from '../src/core/proceduralLanguage/capability/createCompilerCapability.js';
import { matchCompilerCapability } from '../src/core/proceduralLanguage/capability/matchCompilerCapability.js';
import { createCompilerMatchReceipt } from '../src/core/proceduralLanguage/capability/createCompilerMatchReceipt.js';
import {
	describeLanguageFederation
} from '../src/core/proceduralPortal/adapters/language/ProceduralLanguagePortalDiscovery.js';

const DEFINITION = Object.freeze({
	id: 'bridge-613',
	kind: 'architecture.bridge',
	relationships: [{id: 'span', type: 'spans', target: 'river'}],
	constraints: [{id: 'clear', type: 'clearance'}],
	behaviors: [{id: 'sway', kind: 'sways'}]
});
const REQUEST = Object.freeze({required: ['visual', 'collision']});

/**
 * @description Creates complementary visual and collision specialists whose union
 * recognizes different semantic categories and contributes different evidence.
 * @returns {ReadonlyArray<object>} Canonical compiler capabilities.
 */
function createCapabilities() {
	return Object.freeze([
		createCompilerCapability({
			id: 'bridge.visual',
			kinds: ['architecture.*'],
			channels: ['visual'],
			supportPolicy: {relationships: {spans: ['consume']}},
			cost: {triangles: 1500},
			lod: {id: 'bridge-lod', levels: ['near', 'far']}
		}),
		createCompilerCapability({
			id: 'bridge.collision',
			kinds: ['architecture.*'],
			channels: ['collision'],
			supports: {constraints: ['clearance']},
			cost: {vertices: 120}
		})
	]);
}

test('B"H chain receipt unions semantic recognition and keeps uncovered meaning', () => {
	const tiferesCapabilities = createCapabilities();
	const malchusMatches = tiferesCapabilities.map(
		(capability) => matchCompilerCapability(capability, DEFINITION, REQUEST)
	);
	const hodReceipt = createCompilerMatchReceipt(malchusMatches, REQUEST);
	assert.equal(hodReceipt.complete, true);
	assert.deepEqual(hodReceipt.semanticCoverage.relationships.recognized, ['spans']);
	assert.deepEqual(hodReceipt.semanticCoverage.constraints.recognized, ['clearance']);
	assert.deepEqual(hodReceipt.semanticCoverage.behaviors.unsupported, ['sways']);
	assert.equal(hodReceipt.costEvidence.length, 2);
	assert.equal(hodReceipt.lodEvidence.length, 1);
});

test('B"H Portal federation discovery exposes rich executor-free capability data', () => {
	const malchusDiscovery = describeLanguageFederation(createCapabilities());
	assert(malchusDiscovery.semanticVocabulary.relationships.includes('spans'));
	assert(malchusDiscovery.semanticVocabulary.constraints.includes('clearance'));
	assert.equal(malchusDiscovery.compilers[0].cost.triangles, 1500);
	assert.equal(malchusDiscovery.compilers[0].lod.id, 'bridge-lod');
	assert.equal(JSON.stringify(malchusDiscovery).includes('function'), false);
});
