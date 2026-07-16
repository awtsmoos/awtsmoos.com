// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves visible people remain animated chossid.glb bodies at every LOD distance.
 * RESPONSIBILITY: verify canonical asset URL, full-model tiers, cadence, and no proxy humans.
 * NON-RESPONSIBILITY: this test does not impersonate a remote peer or claim network availability.
 * The Awtsmoos renews every person beyond distance and transport; Awtsmoos.com verifies that
 * optimization changes animation cadence without replacing a Chossid with generated geometry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import {
	npcLodTiers,
	resolveNpcLod
} from '../../world/npc/NpcLodPolicy.js';

test('the canonical local, NPC, and remote actor asset is chossid.glb', () => {
	assert.match(PLAYER_MODEL_URL, /\/chossid\.glb$/);
	assert.equal(PLAYER_MODEL_URL.startsWith('https://'), true);
});

test('every visible LOD tier keeps the complete Chossid body and animation cadence', () => {
	const tiers = npcLodTiers();
	for (const id of ['near', 'mid', 'distant']) {
		assert.equal(tiers[id].fullModel, true);
		assert.equal(tiers[id].proxyModel, false);
		assert.equal(Number.isFinite(tiers[id].updateInterval), true);
		assert.ok(tiers[id].updateInterval > 0);
	}
	assert.equal(tiers.dormant.fullModel, false);
	assert.equal(tiers.dormant.proxyModel, false);
});

test('distance changes cadence rather than generating another human representation', () => {
	assert.equal(resolveNpcLod(5).id, 'near');
	assert.equal(resolveNpcLod(50).id, 'mid');
	assert.equal(resolveNpcLod(120).id, 'distant');
	assert.equal(resolveNpcLod(240).id, 'dormant');
	assert.equal(resolveNpcLod(240, { questFocused: true }).id, 'near');
});
