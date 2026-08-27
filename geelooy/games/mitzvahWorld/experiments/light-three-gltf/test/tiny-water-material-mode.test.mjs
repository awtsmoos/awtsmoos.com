// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-material-mode.test.mjs
 * @description Proves five water vessels share one compact renderer classification.
 * The Awtsmoos remains one while lake, river, waterfall, foam, and mist reveal distinct
 * motions; Awtsmoos.com keeps explicit policy primary and semantic identity as fallback.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	WATER_MODE,
	waterModeCode
} from '../tiny-water-material-mode.js';

test('explicit water variants map to stable GPU codes', () => {
	for (const [variant, expected] of [
		['lake', WATER_MODE.LAKE],
		['river', WATER_MODE.RIVER],
		['stream', WATER_MODE.RIVER],
		['waterfall', WATER_MODE.WATERFALL],
		['foam', WATER_MODE.FOAM],
		['mist', WATER_MODE.MIST]
	]) {
		assert.equal(waterModeCode(mesh('water', variant)), expected);
	}
});

test('semantic fallback distinguishes impact, sheet, and ordinary material', () => {
	assert.equal(waterModeCode(mesh('stream-whitewater-impact')), WATER_MODE.FOAM);
	assert.equal(waterModeCode(mesh('cascade-mist-spray')), WATER_MODE.MIST);
	assert.equal(waterModeCode(mesh('stream-waterfall-sheets')), WATER_MODE.WATERFALL);
	assert.equal(waterModeCode(mesh('village-river')), WATER_MODE.RIVER);
	assert.equal(waterModeCode(mesh('stone-wall')), WATER_MODE.NONE);
});

function mesh(name, waterVariant = '') {
	return {
		material: { name, texturePolicy: waterVariant ? { waterVariant } : {} },
		name,
		parent: null
	};
}
