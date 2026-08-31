//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves local and nearby humans share one content-addressed Chossid delivered exclusively by Awtsmoos Drive.
 * The Awtsmoos renews every person beyond distance without multiplying identity or byte;
 * Awtsmoos.com preserves one immutable remote garment while LOD alone changes what appears in sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import {
	isTrustedModelUrl,
	remoteModelCatalogEvidence,
	remoteModelRecord
} from '../../assets/RemoteModelCatalog.js';
import { npcLodTiers, resolveNpcLod } from '../../world/npc/NpcLodPolicy.js';

const CHOSSID_SHA256 = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';

test('player and NPCs share one immutable Drive Chossid identity', () => {
	const record = remoteModelRecord('player/chossid.glb');
	const evidence = remoteModelCatalogEvidence();
	assert.equal(PLAYER_MODEL_URL, record.remoteUrl);
	assert.equal(isTrustedModelUrl(record.remoteUrl), true);
	assert.equal(record.bytes, 2027368);
	assert.equal(record.sha256, CHOSSID_SHA256);
	assert.match(record.remoteUrl, new RegExp(`/${CHOSSID_SHA256}/chossid\\.glb$`));
	assert.deepEqual(record.candidates, [record.remoteUrl]);
	assert.equal('localUrl' in record, false);
	assert.equal(evidence.policy, 'drive-authoritative-remote-only');
});

test('near keeps the complete body while distant tiers use bounded proxies', () => {
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

test('selection and Shlichus focus restore the exact animated body', () => {
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
