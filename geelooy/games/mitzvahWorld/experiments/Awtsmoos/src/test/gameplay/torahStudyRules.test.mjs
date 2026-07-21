// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahStudyRules.test.mjs
 * @description Guards canonical, learned, owned, and cooldown-bound study abilities.
 * The Awtsmoos renews wisdom beyond forged payloads; Awtsmoos.com lets only a genuinely
 * learned passage in its proper sefer become a measured act of illuminating resistance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateTorahStudyUse } from '../../gameplay/combat/TorahStudyRules.js';

function snapshot(overrides = {}) {
	return {
		items: [{ itemId: 'siddur' }],
		lastUsedAt: {},
		learned: ['modeh-ani'],
		...overrides
	};
}

test('canonical learned passage is accepted with catalog damage', () => {
	const result = evaluateTorahStudyUse(snapshot(), { id: 'modeh-ani', damage: 999 }, 2000);
	assert.equal(result.ok, true);
	assert.equal(result.passage.damage, 12);
	assert.equal(result.usedAt, 2000);
});

test('unknown, unlearned, and unowned passages are rejected', () => {
	assert.equal(evaluateTorahStudyUse(snapshot(), { id: 'forged' }, 0).reason, 'UNKNOWN_PASSAGE');
	assert.equal(evaluateTorahStudyUse(snapshot({ learned: [] }), { id: 'modeh-ani' }, 0).reason, 'PASSAGE_NOT_LEARNED');
	assert.equal(evaluateTorahStudyUse(snapshot({ items: [] }), { id: 'modeh-ani' }, 0).reason, 'BOOK_NOT_OWNED');
});

test('passage cooldown is measured from inventory history', () => {
	const result = evaluateTorahStudyUse(snapshot({
		lastUsedAt: { 'modeh-ani': 1600 }
	}), { id: 'modeh-ani' }, 2000);
	assert.equal(result.ok, false);
	assert.equal(result.reason, 'PASSAGE_COOLDOWN');
	assert.equal(result.remainingMs, 300);
});
