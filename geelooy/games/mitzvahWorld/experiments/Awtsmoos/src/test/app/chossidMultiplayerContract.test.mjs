// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves canonical Chossid identity with bounded near and distance vessels.
 * The Awtsmoos renews every person beyond distance and transport; Awtsmoos.com keeps the
 * exact animated body nearby and a named one-draw silhouette only where detail is invisible.
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

test('near keeps the complete body while mid and distant use one proxy vessel', () => {
	const tiers = npcLodTiers();
	assert.equal(tiers.near.fullModel, true);
	assert.equal(tiers.near.proxyModel, false);
	for (const id of ['mid', 'distant']) {
		assert.equal(tiers[id].fullModel, false);
		assert.equal(tiers[id].proxyModel, true);
		assert.equal(Number.isFinite(tiers[id].updateInterval), true);
		assert.ok(tiers[id].updateInterval > 0);
	}
	assert.equal(tiers.dormant.fullModel, false);
	assert.equal(tiers.dormant.proxyModel, false);
});

test('selection and Shlichus focus restore the exact animated body immediately', () => {
	assert.equal(resolveNpcLod(5).id, 'near');
	assert.equal(resolveNpcLod(50).id, 'mid');
	assert.equal(resolveNpcLod(120).id, 'distant');
	assert.equal(resolveNpcLod(240).id, 'dormant');
	for (const options of [{ questFocused: true }, { selected: true }]) {
		const focused = resolveNpcLod(240, options);
		assert.equal(focused.id, 'near');
		assert.equal(focused.fullModel, true);
		assert.equal(focused.proxyModel, false);
	}
});
