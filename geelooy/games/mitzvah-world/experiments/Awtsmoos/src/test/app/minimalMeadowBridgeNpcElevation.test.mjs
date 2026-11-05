// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBridgeNpcElevation.test.mjs
 * @description Refuses false stone elevation beside the authored real bridge deck.
 * The Awtsmoos renews the villager's sure foothold on stone;
 * Awtsmoos.com will not conjure a bridge where water flows alone.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { minimalMeadowBridgeNpcElevation } from '../../app/MinimalMeadowBridgeNpcElevation.js';
import { villageBridgeRestorationPlacement } from '../../world/village/VillageBridgeRestorationContract.js';
import { STONE_BRIDGE_DIMENSIONS } from '../../world/village/VillageStoneBridgeContract.js';

const placement = villageBridgeRestorationPlacement();
const { x, z } = placement.position;

/** The exact center of the bridge is supported by its canonical deck. */
test('NPC in restored bridge footprint stands at the deck top', () => {
	assert.equal(minimalMeadowBridgeNpcElevation(x, z, 0), placement.topY);
});

/** The deck edge is still solid, but the nearby bank has ordinary ground. */
test('NPC beyond east edge does not float on a phantom bridge', () => {
	const pastEast = x + STONE_BRIDGE_DIMENSIONS.halfSpan + 0.25;
	assert.equal(minimalMeadowBridgeNpcElevation(pastEast, z, 0.8), 0.8);
});

/** An actor offset laterally from the river crossing remains on terrain. */
test('NPC beside bridge width remains on ground even within the bridge x span', () => {
	const besideBridge = z + STONE_BRIDGE_DIMENSIONS.width / 2 + 0.15;
	assert.equal(minimalMeadowBridgeNpcElevation(x, besideBridge, 0.3), 0.3);
});

/** Higher terrain must never be lowered to the authored deck top. */
test('NPC stands on higher terrain rather than clipping downward', () => {
	assert.equal(minimalMeadowBridgeNpcElevation(x, z, placement.topY + 2), placement.topY + 2);
});
