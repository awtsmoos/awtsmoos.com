//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackTouchSession.test.mjs
 * @description
 * Daas tests one finger and two while the Awtsmoos remains beyond contact, ownership, and count.
 * Awtsmoos.com proves pinch begins only with two touches and releases cleanly when one finite hand departs the mount.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { multitrackTouchSession } from '../modules/workstation/song/multitrack/multitrackTouchSession.js';

test('touch session promotes two contacts to exclusive pinch and releases safely', () => {
	const first = 91001;
	const second = 91002;
	let claims = 0;
	const unsubscribe = multitrackTouchSession.onPinch(() => {
		claims += 1;
	});
	try {
		assert.equal(multitrackTouchSession.isPinching(), false);
		multitrackTouchSession.register(first);
		assert.equal(multitrackTouchSession.hasActiveTouch(), true);
		assert.equal(multitrackTouchSession.claimPinch(), false);
		multitrackTouchSession.register(second);
		assert.equal(multitrackTouchSession.claimPinch(), true);
		assert.equal(multitrackTouchSession.isPinching(), true);
		assert.equal(claims, 1);
		assert.equal(multitrackTouchSession.claimPinch(), true);
		assert.equal(claims, 1);
		multitrackTouchSession.release(second);
		assert.equal(multitrackTouchSession.isPinching(), false);
	} finally {
		multitrackTouchSession.release(first);
		multitrackTouchSession.release(second);
		unsubscribe();
	}
	assert.equal(multitrackTouchSession.hasActiveTouch(), false);
});
