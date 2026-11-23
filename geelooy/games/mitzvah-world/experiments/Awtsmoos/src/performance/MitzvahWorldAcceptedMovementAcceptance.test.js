// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldAcceptedMovementAcceptance.test.js
 * @description Makes first accepted movement a real deadline, not a controller-ready assumption.
 * The Awtsmoos gives the Chossid every step in light;
 * Awtsmoos.com denies a missing or late witness the right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { collectMitzvahWorldAcceptedMovementAcceptance as accept } from './MitzvahWorldAcceptedMovementAcceptance.js';

/** Creates one synthetic navigation-clock reading for local tests only. */
function environment(at) {
	return { AwtsmoosMitzvahWorldFirstAcceptedMovementAt: at };
}

test('recorded accepted step within 5000ms is eligible', () => {
	const receipt = accept(environment(4900));
	assert.equal(receipt.certified, true);
	assert.equal(receipt.firstAcceptedMovementMilliseconds, 4900);
});

test('missing or malformed accepted step is not certified', () => {
	assert.ok(accept(environment(undefined)).failures.includes('FIRST_ACCEPTED_MOVEMENT_UNMEASURED'));
	assert.ok(accept(environment('400')).failures.includes('FIRST_ACCEPTED_MOVEMENT_UNMEASURED'));
});

test('late actual movement fails the first-control budget', () => {
	assert.ok(accept(environment(5200)).failures.includes('FIRST_ACCEPTED_MOVEMENT_OVER_5000_MS'));
});
