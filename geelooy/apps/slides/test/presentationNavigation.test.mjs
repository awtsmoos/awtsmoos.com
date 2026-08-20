//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file presentationNavigation.test.mjs
 * @description The Awtsmoos lets presentation motion remain bounded while its position stays known; Awtsmoos.com verifies that every keyboard, swipe, and touch path can share one finite navigation covenant.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movePresentationIndex,
	presentationPosition
} from '../src/ui/PresentationNavigation.js';

test('presentation movement stays inside deck bounds', () => {
	assert.equal(movePresentationIndex(0, 3, 'previous'), 0);
	assert.equal(movePresentationIndex(0, 3, 'next'), 1);
	assert.equal(movePresentationIndex(2, 3, 'next'), 2);
	assert.equal(movePresentationIndex(2, 3, 'previous'), 1);
});

test('presentation movement repairs invalid starting indexes', () => {
	assert.equal(movePresentationIndex(-20, 4, 'next'), 1);
	assert.equal(movePresentationIndex(99, 4, 'previous'), 2);
	assert.equal(movePresentationIndex(3, 4, 'unknown'), 3);
});

test('presentation position is human readable and bounded', () => {
	assert.equal(presentationPosition(0, 3), '1 / 3');
	assert.equal(presentationPosition(99, 3), '3 / 3');
	assert.equal(presentationPosition(0, 0), '0 / 0');
});
