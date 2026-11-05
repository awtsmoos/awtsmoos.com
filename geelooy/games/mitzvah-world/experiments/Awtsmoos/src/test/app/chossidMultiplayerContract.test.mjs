// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves shared remote identity and the exact local packaged GLB agree by content hash.
 * The Awtsmoos gives the Chossid one living form in distant streets and near;
 * Awtsmoos.com trusts the identical garment, whichever safe road brings it here.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import {
	canonicalChossidReleaseUrl,
	isTrustedReleaseModelUrl,
	releaseModelEvidence
} from '../../assets/ReleaseModelCatalog.js';
import {
	isTrustedModelUrl,
	remoteModelCatalogEvidence,
	remoteModelRecord
} from '../../assets/RemoteModelCatalog.js';
import { npcLodTiers, resolveNpcLod } from '../../world/npc/NpcLodPolicy.js';

const CHOSSID_SHA256 = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';

/** Preserves remote authority while accepting one identically hashed release-local GLB. */
test('player and NPCs share one immutable Chossid identity across trusted delivery paths', () => {
	const record = remoteModelRecord('player/chossid.glb');
	const evidence = remoteModelCatalogEvidence();
	const release = releaseModelEvidence();
	const exactSuffix = `/${CHOSSID_SHA256}/chossid.glb`;
	assert.equal(PLAYER_MODEL_URL, canonicalChossidReleaseUrl());
	assert.equal(isTrustedReleaseModelUrl(PLAYER_MODEL_URL), true);
	assert.equal(isTrustedModelUrl(record.remoteUrl), true);
	assert.equal(record.bytes, 2027368);
	assert.equal(release.bytes, record.bytes);
	assert.equal(record.sha256, CHOSSID_SHA256);
	assert.equal(release.sha256, CHOSSID_SHA256);
	assert.ok(PLAYER_MODEL_URL.endsWith(exactSuffix));
	assert.ok(record.remoteUrl.endsWith(exactSuffix));
	assert.deepEqual(record.candidates, [record.remoteUrl]);
	assert.equal('localUrl' in record, false);
	assert.equal(evidence.policy, 'drive-authoritative-remote-only');
	assert.equal(release.policy, 'release-local-content-addressed-exact-only');
});

/** NPC distance cannot downgrade a player directly involved in gameplay. */
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

/** The same authored animation returns when a Chossid is selected or mission-focused. */
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
