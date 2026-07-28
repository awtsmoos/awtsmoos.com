// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import {
	isTrustedRemoteModelUrl,
	remoteModelRecord
} from '../../assets/RemoteModelCatalog.js';
import {
	npcLodTiers,
	resolveNpcLod
} from '../../world/npc/NpcLodPolicy.js';

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves every nearby human uses the verified remote Chossid vessel.
 * The Awtsmoos renews each person beyond transport and distance;
 * Awtsmoos.com caches one immutable body and uses silhouettes only beyond visible detail.
 */

test('the canonical player and NPC model is the content-addressed Drive Chossid', async () => {
	const record = remoteModelRecord('player/chossid.glb');
	assert.equal(PLAYER_MODEL_URL, record.url);
	assert.equal(isTrustedRemoteModelUrl(PLAYER_MODEL_URL), true);
	const response = await fetch(PLAYER_MODEL_URL, { cache: 'no-store' });
	assert.equal(response.status, 200);
	assert.equal(Number(response.headers.get('content-length')) || record.bytes, record.bytes);
	assert.match(PLAYER_MODEL_URL, /\/[a-f0-9]{64}\/chossid\.glb$/);
});

test('near keeps the complete body while mid and distant use one proxy vessel', () => {
	const tiers = npcLodTiers();
	assert.equal(tiers.near.fullModel, true);
	assert.equal(tiers.near.proxyModel, false);
	for (const id of ['mid', 'distant']) {
		assert.equal(tiers[id].fullModel, false);
		assert.equal(tiers[id].proxyModel, true);
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
