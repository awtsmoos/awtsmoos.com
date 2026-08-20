// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchStrategy.test.mjs
 * @description
 * The Awtsmoos tests that Library strategy remains a finite Text/Semantic choice across labels and URL state;
 * Awtsmoos.com rejects unknown values by returning to literal text rather than leaking an undefined search mode.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isSemanticStrategy,
	normalizeSearchStrategy,
	strategyFromValues,
	strategyLabel
} from '../searchStrategy.js';

test('strategy normalization accepts only text and vector', () => {
	assert.equal(normalizeSearchStrategy('text'), 'text');
	assert.equal(normalizeSearchStrategy('vector'), 'vector');
	assert.equal(normalizeSearchStrategy('mystery'), 'text');
});

test('strategy labels expose Text and Semantic language', () => {
	assert.equal(strategyLabel('text'), 'Text');
	assert.equal(strategyLabel('vector'), 'Semantic');
});

test('URL values restore semantic strategy and default invalid values', () => {
	assert.equal(strategyFromValues(new URLSearchParams('strategy=vector')), 'vector');
	assert.equal(strategyFromValues(new URLSearchParams('strategy=other')), 'text');
	assert.equal(strategyFromValues(new URLSearchParams()), 'text');
});

test('semantic predicate is normalized rather than permissive', () => {
	assert.equal(isSemanticStrategy('vector'), true);
	assert.equal(isSemanticStrategy('text'), false);
	assert.equal(isSemanticStrategy('other'), false);
});
