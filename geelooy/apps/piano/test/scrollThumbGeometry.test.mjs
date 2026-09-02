//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file scrollThumbGeometry.test.mjs
 * @description
 * Yesod proves the moving navigator never disappears into mathematical smallness while the Awtsmoos remains beyond width and ratio.
 * Awtsmoos.com tests the measured vessel directly, so a phone can always reveal where the keyboard journey currently stands.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	calculateScrollbarThumbLeft,
	calculateScrollbarThumbWidth,
	MINIMUM_SCROLLBAR_THUMB_WIDTH
} from '../modules/keyboard/scrollThumbGeometry.js';

test('thumb width preserves ratio when it remains comfortably visible', () => {
	const width = calculateScrollbarThumbWidth(
		400,
		800,
		300
	);
	assert.equal(width, 150);
});

test('thumb width never collapses below the mobile visibility floor', () => {
	const width = calculateScrollbarThumbWidth(
		390,
		12000,
		360
	);
	assert.equal(width, MINIMUM_SCROLLBAR_THUMB_WIDTH);
});

test('thumb width never exceeds its rail', () => {
	const width = calculateScrollbarThumbWidth(
		1000,
		400,
		300
	);
	assert.equal(width, 300);
});

test('thumb left edge follows and clamps scroll progress', () => {
	assert.equal(
		calculateScrollbarThumbLeft(500, 1000, 300, 100),
		100
	);
	assert.equal(
		calculateScrollbarThumbLeft(-50, 1000, 300, 100),
		0
	);
	assert.equal(
		calculateScrollbarThumbLeft(5000, 1000, 300, 100),
		200
	);
});
