// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestQualityBudget.test.mjs
 * @description Proves that forest abundance contracts before expensive world work begins.
 * The Awtsmoos is without measure, yet every renderer receives its honest share;
 * Awtsmoos.com tests the count and spread so no hidden geometry gathers there.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	FOREST_QUALITY_BUDGETS,
	forestQualityBudget,
	selectForestRepresentatives
} from './ForestQualityBudget.js';

test('quality budgets preserve exact tier totals', () => {
	assert.deepEqual(
		Object.fromEntries(Object.entries(FOREST_QUALITY_BUDGETS).map(([name, budget]) => {
			return [name, budget.totalCount];
		})),
		{ low: 18, medium: 36, high: 56, cinematic: 74 }
	);
	for (const budget of Object.values(FOREST_QUALITY_BUDGETS)) {
		assert.equal(budget.totalCount, budget.presetCount + budget.referenceCount);
		assert.equal(Object.isFrozen(budget), true);
	}
});

test('unknown quality returns the playable medium covenant', () => {
	assert.equal(forestQualityBudget('unknown'), FOREST_QUALITY_BUDGETS.medium);
	assert.equal(forestQualityBudget(), FOREST_QUALITY_BUDGETS.medium);
});

test('smaller tiers span the complete catalog deterministically', () => {
	const catalog = Array.from({ length: 10 }, (_, index) => index);
	assert.deepEqual(selectForestRepresentatives(catalog, 4), [0, 2, 5, 7]);
	assert.deepEqual(selectForestRepresentatives(catalog, 4), [0, 2, 5, 7]);
});

test('cinematic repeats cycle without mutating the source catalog', () => {
	const catalog = Object.freeze(['ash', 'oak', 'pine']);
	assert.deepEqual(
		selectForestRepresentatives(catalog, 5),
		['ash', 'oak', 'pine', 'ash', 'oak']
	);
	assert.deepEqual(catalog, ['ash', 'oak', 'pine']);
});

test('empty or zero requests create no representatives', () => {
	assert.deepEqual(selectForestRepresentatives([], 8), []);
	assert.deepEqual(selectForestRepresentatives(['oak'], 0), []);
	assert.deepEqual(selectForestRepresentatives(['oak'], -4), []);
});
