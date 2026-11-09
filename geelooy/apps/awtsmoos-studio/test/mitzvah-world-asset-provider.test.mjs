//B"H
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	describeMitzvahWorldAssets,
	mitzvahWorldChossidUrl,
	resolveMitzvahWorldChossidUrl
} from '../src/providers/StudioMitzvahWorldAssetProvider.js';

const MANIFEST_URL = '/games/mitzvah-world/build/generated/mitzvah-world-essential-assets.json';
const FALLBACK_URL = '/games/mitzvah-world/build/generated/assets/canonical-chossid.glb';
const MANIFEST_CHOSSID_URL = '/games/mitzvah-world/build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';

function fetchReturning(body, ok = true) {
	return async (url) => {
		assert.equal(url, MANIFEST_URL, 'the resolver must read the game build manifest, not a frozen asset path');
		return { ok, json: async () => body };
	};
}

test('chossid URL resolves from the game build essential-assets manifest', async () => {
	const url = await resolveMitzvahWorldChossidUrl(fetchReturning({
		version: 3,
		assets: { canonicalChossid: { publicUrl: MANIFEST_CHOSSID_URL, bytes: 2027368 } }
	}));
	assert.equal(url, MANIFEST_CHOSSID_URL);
});

test('chossid URL falls back to the stable canonical copy when the manifest is unreachable', async () => {
	const url = await resolveMitzvahWorldChossidUrl(async () => { throw new Error('offline'); });
	assert.equal(url, FALLBACK_URL);
});

test('chossid URL falls back when the manifest lacks a usable chossid entry', async () => {
	assert.equal(await resolveMitzvahWorldChossidUrl(fetchReturning({ assets: {} })), FALLBACK_URL);
	assert.equal(await resolveMitzvahWorldChossidUrl(fetchReturning(null, false)), FALLBACK_URL);
	assert.equal(
		await resolveMitzvahWorldChossidUrl(fetchReturning({ assets: { canonicalChossid: { publicUrl: '/elsewhere/model.glb' } } })),
		FALLBACK_URL
	);
});

test('asset descriptor names the manifest resolution and never a retired models/player path', () => {
	const descriptor = describeMitzvahWorldAssets();
	const chossid = descriptor.assets.find(asset => asset.id === 'chossid');
	assert.ok(chossid, 'descriptor must keep the chossid entry');
	assert.equal(chossid.manifestUrl, MANIFEST_URL);
	assert.equal(chossid.resolution, 'essential-assets-manifest');
	assert.ok(!JSON.stringify(descriptor).includes('/assets/models/player/'),
		'the retired /assets/models/player/ layout exists in no deployed tree');
	assert.equal(mitzvahWorldChossidUrl(), FALLBACK_URL);
});
