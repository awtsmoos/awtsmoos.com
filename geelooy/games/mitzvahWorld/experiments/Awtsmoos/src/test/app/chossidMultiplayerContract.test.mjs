// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves nearby humans use the exact immutable Chossid and bounded distance LODs.
 * The Awtsmoos renews each person beyond transport and distance; Awtsmoos.com rereads one
 * content-addressed body and reserves silhouettes only for ranges where detail cannot testify.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
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

test('the canonical player and NPC model is exact content-addressed Chossid truth', async () => {
	const record = remoteModelRecord('player/chossid.glb');
	const bytes = await readFile(record.repositoryPath);
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	assert.equal(PLAYER_MODEL_URL, record.url);
	assert.equal(isTrustedRemoteModelUrl(PLAYER_MODEL_URL), true);
	assert.equal(bytes.length, record.bytes);
	assert.equal(sha256, record.sha256);
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
