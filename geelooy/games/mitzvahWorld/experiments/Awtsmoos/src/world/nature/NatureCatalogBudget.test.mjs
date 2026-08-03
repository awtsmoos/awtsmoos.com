// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCatalogBudget.test.mjs
 * @description Proves real asset identity, mobile budgets, and terrain texture provenance.
 * The Awtsmoos counts every vessel before the valley receives its living array;
 * Awtsmoos.com tests each content-addressed road, so mobile restraint and source truth stay.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	realNatureAsset,
	realNatureAssetCatalog
} from './RealNatureAssetCatalog.js';
import {
	natureQualityBudget,
	natureQualityBudgets
} from './NatureQualityBudget.js';
import {
	localTerrainTextureEvidence,
	localTerrainTextureUrl
} from '../terrain/LocalTerrainTextureCatalog.js';

const LOCAL_MODEL_PATTERN = /^\/games\/mitzvahWorld\/assets\/models\/reference-world\/[a-f0-9]{64}\//;

test('real nature catalog exposes the five inspected immutable assets', () => {
	const catalog = realNatureAssetCatalog();
	assert.deepEqual(
		catalog.map(asset => asset.id),
		['pine', 'broadleaf', 'flower', 'bush', 'rock']
	);
	for (const asset of catalog) {
		assert.match(asset.url, LOCAL_MODEL_PATTERN);
		assert.match(asset.modelPath, /\.glb$/);
		assert.equal(realNatureAsset(asset.id), asset);
	}
	assert.equal(realNatureAsset('missing'), null);
});

test('nature budgets shrink monotonically toward mobile', () => {
	const budgets = natureQualityBudgets();
	const order = ['low', 'medium', 'high', 'cinematic'];
	for (let index = 1; index < order.length; index += 1) {
		const previous = budgets[order[index - 1]];
		const current = budgets[order[index]];
		assert.ok(current.grassBlades >= previous.grassBlades);
		assert.ok(current.cullDistance >= previous.cullDistance);
		assert.ok(current.windFps >= previous.windFps);
		for (const id of Object.keys(previous.counts)) {
			assert.ok(current.counts[id] >= previous.counts[id]);
		}
	}
	assert.equal(natureQualityBudget('unknown'), budgets.low);
});

test('terrain evidence names the public full-resolution authority', () => {
	const evidence = localTerrainTextureEvidence();
	assert.equal(evidence.authority.publicRemote, true);
	assert.equal(evidence.authority.resolution, 'full');
	assert.equal(evidence.roles.length, 6);
	assert.equal(evidence.urls.length, 6);
	assert.match(localTerrainTextureUrl('mountain-stone'), /^https:\/\//);
	assert.throws(() => localTerrainTextureUrl('unknown-role'));
});
