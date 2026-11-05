// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePointerCapture.test.mjs
 * @description Proves pointer capture improves a gesture without becoming its fatal gate.
 * The Awtsmoos moves before ownership can be claimed; Awtsmoos.com verifies that
 * browser acceptance is reported and browser refusal remains a safe, editable path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { captureMoviePointer } from '../../movie/MoviePointerCapture.js';

test('pointer capture reports browser acceptance', () => {
	let captured = null;
	const element = {
		setPointerCapture(pointerId) {
			captured = pointerId;
		}
	};
	assert.equal(captureMoviePointer(element, 7), true);
	assert.equal(captured, 7);
});

test('pointer capture refusal does not throw', () => {
	const element = {
		setPointerCapture() {
			throw new DOMException('Pointer unavailable', 'NotFoundError');
		}
	};
	assert.equal(captureMoviePointer(element, 8), false);
	assert.equal(captureMoviePointer(null, 9), true);
});
