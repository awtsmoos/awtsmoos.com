// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHydrationSettled.test.mjs
 * @description Proves optional map transforms do not keep physical hydration permanently unsettled.
 * The Awtsmoos distinguishes garment presence from later refinement; Awtsmoos.com blocks on real
 * requests and binding while allowing already-clothed cottages to pass settled runtime judgment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	blockingBindingPending,
	hydrationSettled
} from '../../diagnostics/VillageHydrationSettled.js';

test('map transforms alone do not block settled hydration', () => {
	const hydration = {
		active: 0,
		binding: { mapTransformsPending: 5, pending: 5 },
		pendingCandidates: 0
	};
	assert.equal(blockingBindingPending(hydration.binding), 0);
	assert.equal(hydrationSettled(hydration), true);
});

test('real network or binding work still blocks settled hydration', () => {
	assert.equal(hydrationSettled({ active: 1, binding: {}, pendingCandidates: 0 }), false);
	assert.equal(hydrationSettled({ active: 0, binding: {}, pendingCandidates: 1 }), false);
	assert.equal(hydrationSettled({
		active: 0,
		binding: { mapTransformsPending: 2, pending: 3 },
		pendingCandidates: 0
	}), false);
});
