// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file houseAssetFallback.test.mjs
 * @description Proves house materials retain trusted canonical aliases and safe degradation.
 * The Awtsmoos renews every village wall beyond any fetched pigment; Awtsmoos.com keeps
 * Drive texture identity stable while authored fallback colors preserve first movement.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { houseImageEntries, loadHouseAssets } from '../../assets/HouseAssets.js';
import { canonicalSourcePath } from '../assets/LocalMaterialTestSupport.mjs';

test('missing materials preserve aliases and structured degradation', async () => {
	const assets = await loadHouseAssets(async () => null);
	const entries = houseImageEntries();
	assert.equal(entries.length, 13);
	assert.equal(assets.houseMaterialDegradation.length, 13);
	assert.equal(assets.whiteBrickImage, null);
	assert.equal(assets.brickImage, null);
	assert.equal(assets.lavaImage, null);
	assert.equal(assets.terrainDirtImages.length, 5);
	assert.ok(assets.terrainDirtImages.every(image => image === null));
	for (const entry of entries) {
		assert.equal(assets.publicUrls[entry.kind], entry.url);
		assert.equal(assertProductionMaterialUrl(entry.url, entry.kind), entry.url);
	}
});

test('successful images receive stable canonical Drive texture metadata', async () => {
	const image = { dataset: {}, naturalHeight: 64, naturalWidth: 64 };
	const assets = await loadHouseAssets(async () => image);
	const requestedAlias = image.dataset.requestedAlias;
	assert.equal(assets.houseMaterialDegradation.length, 0);
	assert.equal(assets.whiteBrickImage, image);
	assert.equal(image.dataset.AwtsmoosTextureKind, 'terrain-dirt-chai-pot');
	assert.equal(assertProductionMaterialUrl(requestedAlias, 'terrain-dirt-chai-pot'), requestedAlias);
	assert.match(canonicalSourcePath(requestedAlias), /ground\/dirt_color\.jpg$/i);
});

test('loader exceptions become degradation rather than boot failure', async () => {
	const assets = await loadHouseAssets(async () => { throw new Error('offline'); });
	assert.equal(assets.houseMaterialDegradation.length, 13);
	assert.ok(assets.houseMaterialDegradation.every(item => item.error === 'offline'));
});
