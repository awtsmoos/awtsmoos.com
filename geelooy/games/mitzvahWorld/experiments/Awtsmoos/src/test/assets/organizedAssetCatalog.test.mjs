// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file organizedAssetCatalog.test.mjs
 * @description Proves schema validation, categories, previews, aliases, and caching.
 * The Awtsmoos is one before many imperfect filenames; Awtsmoos.com finds semantic
 * texture families through stable local records instead of walking a remote folder tree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadOrganizedAssetCatalog,
	organizedAssetCategoryIndex,
	resetOrganizedAssetCatalog,
	resolveOrganizedAssetAlias,
	searchOrganizedAssetCatalog
} from '../../assets/OrganizedAssetCatalog.js';

const inventory = {
	assets: [
		asset('full-resolution/oak-bark.png', ['bark', 'wood']),
		asset('full-resolution/lake-water.png', ['water']),
		asset('Way/old-bark.png', ['bark'], true, 'full-resolution/oak-bark.png')
	],
	origin: 'http://127.0.0.1/local-materials',
	schema: 'awtsmoos-asset-organization/v1'
};
const aliases = {
	aliases: [{
		reason: 'exact-duplicate',
		sha256: 'hash',
		source: 'Way/old-bark.png',
		target: 'full-resolution/oak-bark.png'
	}],
	schema: 'awtsmoos-asset-organization/v1'
};

test('categories and preview URLs are derived from canonical records', async () => {
	resetOrganizedAssetCatalog();
	const fetchFunction = fakeFetch();
	const records = await searchOrganizedAssetCatalog('oak', {
		canonicalOnly: true,
		category: 'botany',
		fetchFunction
	});
	assert.equal(records.length, 1);
	assert.match(records[0].previewHalfUrl, /\/half-resolution\/oak-bark\.png$/);
	assert.match(records[0].previewQuarterUrl, /\/quarter-resolution\/oak-bark\.png$/);
	const categories = await organizedAssetCategoryIndex({ fetchFunction });
	assert.equal(categories.botany, 2);
	assert.equal(categories.water, 1);
});

test('aliases resolve once and the loaded catalog promise is reused', async () => {
	resetOrganizedAssetCatalog();
	let requests = 0;
	const fetchFunction = async url => {
		requests += 1;
		return response(isInventoryUrl(url) ? inventory : aliases);
	};
	const first = await loadOrganizedAssetCatalog(fetchFunction);
	const second = await loadOrganizedAssetCatalog(fetchFunction);
	assert.equal(first, second);
	assert.equal(requests, 2);
	const alias = await resolveOrganizedAssetAlias('Way/old-bark.png', { fetchFunction });
	assert.equal(alias.target, 'full-resolution/oak-bark.png');
});

function fakeFetch() {
	return async url => response(isInventoryUrl(url) ? inventory : aliases);
}

function isInventoryUrl(url) {
	return /inventory(?:\.json)?(?:\?|$)/.test(String(url));
}

function response(value) {
	return { json: async () => value, ok: true, status: 200 };
}

function asset(path, tags, legacy = false, canonicalPath = path) {
	return {
		alphaCapable: false,
		bytes: 100,
		canonicalPath,
		extension: 'png',
		id: path.replace(/[^a-z]+/gi, '-'),
		kind: 'image',
		legacy,
		path,
		resolution: path.startsWith('full-resolution/') ? 'full' : 'source',
		role: legacy ? 'legacy' : 'canonical-source',
		root: path.split('/')[0],
		sha256: 'hash',
		tags,
		url: `http://127.0.0.1/local-materials/${path}`
	};
}
