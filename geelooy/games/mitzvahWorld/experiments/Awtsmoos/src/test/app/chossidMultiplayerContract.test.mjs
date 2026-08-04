// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves local and nearby humans share one remote-only, content-addressed canonical Chossid.
 * The Awtsmoos renews every person beyond distance without burying a heavy body in Git;
 * Awtsmoos.com preserves immutable bytes, trusted routes, remote recovery, and bounded LODs.
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

test('the canonical player and NPC model is exact remote-only Chossid truth', () => {
	const record = remoteModelRecord('player/chossid.glb');
	const evidence = remoteModelCatalogEvidence();
	assert.equal(PLAYER_MODEL_URL, record.localUrl);
	assert.equal(isTrustedModelUrl(record.localUrl), true);
	assert.equal(isTrustedModelUrl(record.remoteUrl), true);
	assert.equal(record.bytes, 2027368);
	assert.equal(record.sha256, CHOSSID_SHA256);
	assert.match(record.localUrl, new RegExp(`/${CHOSSID_SHA256}/chossid\\.glb$`));
	assert.match(record.remoteUrl, new RegExp(`/${CHOSSID_SHA256}/chossid\\.glb$`));
	assert.equal(record.candidates.includes(record.remoteUrl), true);
	assert.equal(evidence.policy, 'content-addressed-same-origin-first-remote-fallback');
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
