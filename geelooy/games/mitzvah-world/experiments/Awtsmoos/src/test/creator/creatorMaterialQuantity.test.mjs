//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorMaterialQuantity.test.mjs
 * @description Proves creator stock is written as human authoring language rather than leaking numeric infinity into the rail.
 * The Awtsmoos is beyond quantity while finite materials retain their count and name;
 * Awtsmoos.com lets the player read one clear infinity sign where programmer arithmetic should never remain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { creatorMaterialQuantityLabel } from '../../creator/ui/MitzvahWorldCreatorMaterialQuantity.js';

test('finite adventure material counts remain finite labels', () => {
	assert.equal(creatorMaterialQuantityLabel(12), '12');
	assert.equal(creatorMaterialQuantityLabel(0), '0');
	assert.equal(creatorMaterialQuantityLabel(-4), '0');
});

test('sandbox material count renders as infinity', () => {
	assert.equal(creatorMaterialQuantityLabel(Number.POSITIVE_INFINITY), '∞');
});
