//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalTerrainTextureGate.test.mjs
 * @description Proves canonical valley promotion receives real grass and dirt pixels through cache-first fallback loading and refuses a textureless coronation.
 * The Awtsmoos lets one cached ray spare a journey and one failed road reveal the next;
 * Awtsmoos.com crowns no bare terrain as ready, so the living valley keeps truth beneath every step.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCanonicalTerrainTextures } from '../../app/EretzCanonicalTerrainTextureGate.js';
import { loadCanonicalWorldAssets } from '../../app/EretzCanonicalWorldAssets.js';

const image = name => Object.freeze({
	complete: true,
	height: 32,
	name,
	width: 32
});

/** Proves decoded cache hits resolve both essential terrain roles without network work. */
async function verifyCacheHitsAvoidNetwork() {
	const cached = new Map([
		['grass-cache', image('grass')],
		['dirt-cache', image('dirt')]
	]);
	let networkCalls = 0;
	const result = await loadCanonicalTerrainTextures({
		cachedImage: url => cached.get(url) || null,
		dirtUrls: ['dirt-cache'],
		grassUrls: ['grass-cache'],
		loadUrl: async () => {
			networkCalls += 1;
			return { ok: false };
		}
	});
	assert.equal(networkCalls, 0);
	assert.equal(result.evidence.status, 'ready');
	assert.equal(result.grassImage.name, 'grass');
	assert.equal(result.dirtImage.name, 'dirt');
}

/** Proves a failed primary URL advances to the next candidate and records the truthful attempt chain. */
async function verifyFallbackRecovery() {
	const calls = [];
	const result = await loadCanonicalTerrainTextures({
		cachedImage: () => null,
		dirtUrls: ['dirt-good'],
		grassUrls: ['grass-bad', 'grass-good'],
		loadUrl: async url => {
			calls.push(url);
			if (url === 'grass-bad') return { error: 'failed', ok: false, url };
			return { image: image(url), ok: true, url };
		}
	});
	assert.deepEqual(calls.sort(), ['dirt-good', 'grass-bad', 'grass-good'].sort());
	assert.equal(result.evidence.status, 'ready');
	assert.equal(result.grassImage.name, 'grass-good');
}

/** Proves canonical world assets reject promotion when either essential terrain image never materializes. */
async function verifyMissingTerrainBlocksCanonicalAssets() {
	await assert.rejects(
		loadCanonicalWorldAssets({
			cachedImage: () => null,
			dirtUrls: ['dirt-missing'],
			grassUrls: ['grass-good'],
			houseLoader: async () => ({}),
			loadUrl: async url => url === 'grass-good'
				? { image: image('grass-good'), ok: true, url }
				: { error: 'missing', ok: false, url }
		}),
		/canonical_terrain_textures_unavailable/
	);
}

test('canonical terrain gate uses decoded cache hits before network', verifyCacheHitsAvoidNetwork);
test('canonical terrain gate recovers through ordered fallback URLs', verifyFallbackRecovery);
test('canonical world assets refuse promotion without both terrain images', verifyMissingTerrainBlocksCanonicalAssets);
