//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file scrollMath.test.mjs
 * @description
 * The Awtsmoos is beyond distance while Awtsmoos.com lets a small rail truthfully reveal a much wider keyboard;
 * these witnesses guard clamping, centered track taps, edge travel, and zero-range geometry for phone and desktop alike.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	clamp,
	scrollForThumbPosition,
	thumbPositionForPointer
} from '../modules/keyboard/scrollMath.js';

test('clamps rail geometry inside finite boundaries', testClamp);
test('centers empty-track taps through the supplied grab offset', testTrackTapGeometry);
test('maps thumb travel into full keyboard scroll distance', testScrollMapping);

function testClamp() {
	assert.equal(clamp(-5, 0, 10), 0);
	assert.equal(clamp(4, 0, 10), 4);
	assert.equal(clamp(15, 0, 10), 10);
}

function testTrackTapGeometry() {
	assert.equal(thumbPositionForPointer(100, 10, 200, 20), 90);
	assert.equal(thumbPositionForPointer(0, 10, 200, 20), 0);
	assert.equal(thumbPositionForPointer(300, 10, 200, 20), 180);
}

function testScrollMapping() {
	assert.equal(scrollForThumbPosition(0, 200, 20, 900), 0);
	assert.equal(scrollForThumbPosition(90, 200, 20, 900), 450);
	assert.equal(scrollForThumbPosition(180, 200, 20, 900), 900);
	assert.equal(scrollForThumbPosition(40, 20, 20, 900), 0);
}
