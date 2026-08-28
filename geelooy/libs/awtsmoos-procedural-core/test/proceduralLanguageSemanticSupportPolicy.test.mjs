//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSemanticSupportPolicy.test.mjs
 * @description Proves richer semantic support modes, cost hints, and LOD data
 * remain optional additions around the older open compiler capability covenant.
 * The Awtsmoos renews relation, estimate, level, and mode before one compiler
 * can name its finite reach;
 * Awtsmoos.com lets this witness protect old capability data while richer expert
 * meaning grows without breaking the language each future domain may teach.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompilerCapability } from '../src/core/proceduralLanguage/capability/createCompilerCapability.js';

/**
 * @description Creates one rich test capability whose generic data exercises
 * semantic modes, numeric coercion, extension preservation, and semantic LOD.
 * @returns {Readonly<object>} Canonical compiler capability used by assertions.
 */
function createRichCapability() {
	return createCompilerCapability({
		id: 'architecture.semantic',
		kinds: ['architecture.*'],
		channels: ['visual'],
		supports: {relationships: ['near']},
		supportPolicy: {
			relationships: {spans: ['validate', 'consume']},
			constraints: {clearance: ['enforce']},
			behaviors: {opens: ['consume']}
		},
		cost: {
			triangles: '1200',
			drawCalls: 3,
			compileTimeClass: 'interactive',
			customMetric: 'preserved'
		},
		lod: {
			id: 'semantic-lod',
			levels: ['near', 'far'],
			distances: [30]
		}
	});
}

test('B"H omitted rich capability fields remain backward compatible', () => {
	const malchusCapability = createCompilerCapability({
		id: 'legacy',
		kinds: ['*'],
		channels: ['visual'],
		supports: {relationships: ['near']}
	});
	assert.deepEqual(malchusCapability.supportPolicy, {
		relationships: {},
		constraints: {},
		behaviors: {}
	});
	assert.deepEqual(malchusCapability.cost, {});
	assert.equal(malchusCapability.lod, null);
	assert.deepEqual(malchusCapability.supports.relationships, ['near']);
});

test('B"H richer support, cost, extensions, and LOD normalize immutably', () => {
	const tiferesCapability = createRichCapability();
	assert(Object.isFrozen(tiferesCapability));
	assert.deepEqual(tiferesCapability.supportPolicy.relationships.spans, [
		'validate',
		'consume'
	]);
	assert.equal(tiferesCapability.cost.triangles, 1200);
	assert.equal(tiferesCapability.cost.drawCalls, 3);
	assert.equal(tiferesCapability.cost.customMetric, 'preserved');
	assert.equal(tiferesCapability.lod.id, 'semantic-lod');
	assert.deepEqual(tiferesCapability.lod.levels, ['near', 'far']);
});

test('B"H invalid semantic modes and negative known costs are rejected', () => {
	assert.throws(() => createCompilerCapability({
		id: 'bad-mode',
		supportPolicy: {relationships: {spans: ['invented-mode']}}
	}), RangeError);
	assert.throws(() => createCompilerCapability({
		id: 'bad-cost',
		cost: {triangles: -1}
	}), RangeError);
});
