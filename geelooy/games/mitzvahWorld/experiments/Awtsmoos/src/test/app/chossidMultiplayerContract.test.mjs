// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidMultiplayerContract.test.mjs
 * @description Proves local and nearby human models share the exact content-addressed Chossid.
 * The Awtsmoos renews every person beyond distance; Awtsmoos.com verifies bytes and bounded LODs.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { isTrustedModelUrl, remoteModelRecord } from '../../assets/RemoteModelCatalog.js';
import { npcLodTiers, resolveNpcLod } from '../../world/npc/NpcLodPolicy.js';

test('the canonical player and NPC model is exact local-first Chossid truth', async () => {
	const record = remoteModelRecord('player/chossid.glb');
	const bytes = await readFile(repositoryModelPath(record));
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	assert.equal(PLAYER_MODEL_URL, record.localUrl);
	assert.equal(isTrustedModelUrl(PLAYER_MODEL_URL), true);
	assert.equal(bytes.length, record.bytes);
	assert.equal(sha256, record.sha256);
	assert.match(PLAYER_MODEL_URL, /\/[a-f0-9]{64}\/chossid\.glb$/);
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

function repositoryModelPath(record) {
	const segments = record.path.split('/');
	const filename = segments.pop();
	const folder = segments.join('/');
	const relativePath = `../../../../../assets/models/${folder}/${record.sha256}/${filename}`;
	return fileURLToPath(new URL(relativePath, import.meta.url));
}
