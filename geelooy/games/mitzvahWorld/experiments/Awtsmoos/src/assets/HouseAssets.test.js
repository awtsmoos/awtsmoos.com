// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseAssets.test.js
 * @description Proves strict house textures stay real, trusted, bounded, and recover sequentially after transient contention.
 * The Awtsmoos gathers many walls into one world while Awtsmoos.com keeps every finite request measured;
 * no stale alias, false pixel, or simultaneous remote stampede may exile a texture that succeeds when approached alone.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	HOUSE_TEXTURE_CANDIDATE_TIMEOUT_MS,
	HOUSE_TEXTURE_LOAD_CONCURRENCY,
	HOUSE_TEXTURE_RECOVERY_TIMEOUT_MS,
	houseImageEntries,
	loadHouseAssets
} from './HouseAssets.js';
import { REMOTE_TEXTURE_ROOT } from './RemoteTextureTransport.js';

const BAD_ALIASES = ['red%20brick%20203.png', 'dirt-grass%201.png', 'dirt-grass%202.png'];

test('every house candidate uses the trusted production root and excludes stale URL forms', () => {
	const entries = houseImageEntries();
	assert.equal(entries.length, 13);
	for (const entry of entries) {
		assert.ok(entry.urls.length >= 2, `${entry.key} needs a fallback`);
		assert.equal(entry.url, entry.urls[0]);
		for (const url of entry.urls) {
			assert.ok(url.startsWith(REMOTE_TEXTURE_ROOT));
			assert.ok(BAD_ALIASES.every(alias => !url.includes(alias)), url);
		}
	}
});

test('house hydration limits concurrency and grants full first-pass transfer budgets', async () => {
	let active = 0;
	let maximum = 0;
	const calls = [];
	const loadFirstImage = async (urls, timeoutMs) => {
		active += 1;
		maximum = Math.max(maximum, active);
		calls.push({ timeoutMs, urls: [...urls] });
		await new Promise(resolve => setTimeout(resolve, 2));
		active -= 1;
		return { height: 32, width: 32 };
	};
	const assets = await loadHouseAssets(loadFirstImage);
	assert.equal(maximum <= HOUSE_TEXTURE_LOAD_CONCURRENCY, true);
	assert.equal(calls.length, 13);
	assert.ok(calls.every(call => call.timeoutMs === HOUSE_TEXTURE_CANDIDATE_TIMEOUT_MS));
	assert.equal(assets.houseMaterialDegradation.length, 0);
	assert.equal(assets.houseMaterialRecovery.length, 0);
});

test('failed concurrent roles retry sequentially with a larger semantic budget', async () => {
	const attempts = new Map();
	let recoveryActive = 0;
	let maximumRecoveryActive = 0;
	const loadFirstImage = async (urls, timeoutMs) => {
		const key = urls[0];
		const attempt = (attempts.get(key) || 0) + 1;
		attempts.set(key, attempt);
		if (timeoutMs === HOUSE_TEXTURE_CANDIDATE_TIMEOUT_MS && attempt === 1 && /red%20brick%203|oak%20wood%203/.test(key)) {
			return null;
		}
		if (timeoutMs === HOUSE_TEXTURE_RECOVERY_TIMEOUT_MS) {
			recoveryActive += 1;
			maximumRecoveryActive = Math.max(maximumRecoveryActive, recoveryActive);
			await new Promise(resolve => setTimeout(resolve, 1));
			recoveryActive -= 1;
		}
		return { height: 64, width: 64 };
	};
	const assets = await loadHouseAssets(loadFirstImage);
	assert.equal(assets.houseMaterialDegradation.length, 0);
	assert.deepEqual(assets.houseMaterialRecovery.map(value => value.key), ['redBrickImage', 'woodImage']);
	assert.equal(maximumRecoveryActive, 1);
	assert.equal(HOUSE_TEXTURE_RECOVERY_TIMEOUT_MS, 45000);
	assert.equal(assets.brickImage, assets.whiteBrickImage);
	assert.equal(assets.lavaImage, assets.redBrickImage);
	assert.equal(assets.terrainDirtImages.length, 5);
});
