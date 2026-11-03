// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets relevance descend in truthful order without erasing equal witnesses;
 * Awtsmoos.com proves percentages, normalized scores, clamping, and stable ties before the browser paints its niches.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	orderHitsByRelevance,
	relevancePercent
} from './searchResultWindow.js';

test('relevancePercent follows displayed percent/score semantics and clamps safely', () => {
	assert.equal(relevancePercent({ percent: 39.3, score: 0.1 }), 39.3);
	assert.ok(Math.abs(relevancePercent({ score: 0.357 }) - 35.7) < 1e-9);
	assert.equal(relevancePercent({ percent: 180 }), 100);
	assert.equal(relevancePercent({ percent: -7 }), 0);
	assert.equal(relevancePercent({ percent: 'not-a-number' }), 0);
});

test('orderHitsByRelevance fixes inverted relevance while preserving stable ties', () => {
	const lower = { id: 'lower', percent: 35.7 };
	const higher = { id: 'higher', percent: 39.3 };
	const tiedFirst = { id: 'tied-first', score: 0.25 };
	const tiedSecond = { id: 'tied-second', percent: 25 };
	const input = [lower, tiedFirst, higher, tiedSecond];

	assert.deepEqual(
		orderHitsByRelevance(input).map(hit => hit.id),
		['higher', 'lower', 'tied-first', 'tied-second']
	);
	assert.deepEqual(
		input.map(hit => hit.id),
		['lower', 'tied-first', 'higher', 'tied-second'],
		'ordering must not mutate backend arrival testimony'
	);
});
