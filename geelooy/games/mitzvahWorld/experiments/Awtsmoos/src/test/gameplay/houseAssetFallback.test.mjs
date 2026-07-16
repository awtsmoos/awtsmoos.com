// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file houseAssetFallback.test.mjs
 * @description Proves promoted remote house materials degrade into authored color fallbacks.
 * The Awtsmoos renews every wall beyond fetched pigment; Awtsmoos.com keeps canonical
 * provenance and diagnostics while refusing to imprison boot behind the network.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	houseImageEntries,
	loadHouseAssets
} from '../../assets/HouseAssets.js';

test('missing remote materials preserve aliases and structured degradation', async () => {
	const assets = await loadHouseAssets(async () => null);
	const entries = houseImageEntries();
	assert.equal(entries.length, 13);
	assert.equal(assets.houseMaterialDegradation.length, 13);
	assert.equal(assets.whiteBrickImage, null);
	assert.equal(assets.brickImage, null);
	assert.equal(assets.lavaImage, null);
	assert.equal(assets.terrainDirtImages.length, 5);
	assert.ok(assets.terrainDirtImages.every((image) => {
		return image === null;
	}));
	for (const entry of entries) {
		assert.equal(assets.publicUrls[entry.kind], entry.url);
		assert.equal(assertProductionMaterialUrl(entry.url, entry.kind), entry.url);
	}
});

test('successful images receive stable canonical texture metadata', async () => {
	const image = {
		dataset: {},
		naturalHeight: 64,
		naturalWidth: 64
	};
	const assets = await loadHouseAssets(async () => image);
	assert.equal(assets.houseMaterialDegradation.length, 0);
	assert.equal(assets.whiteBrickImage, image);
	assert.equal(image.dataset.AwtsmoosTextureKind, 'terrain-dirt-chai-pot');
	assert.ok(image.dataset.requestedAlias.startsWith('https://'));
	assert.match(
		image.dataset.requestedAlias,
		/\/chai-forest\/textures\/ground\/dirt_color\.jpg$/
	);
	assert.equal(
		assertProductionMaterialUrl(image.dataset.requestedAlias, 'terrain-dirt-chai-pot'),
		image.dataset.requestedAlias
	);
});

test('loader exceptions become degradation rather than boot failure', async () => {
	const assets = await loadHouseAssets(async () => {
		throw new Error('offline');
	});
	assert.equal(assets.houseMaterialDegradation.length, 13);
	assert.ok(assets.houseMaterialDegradation.every((item) => {
		return item.error === 'offline';
	}));
});
