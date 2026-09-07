// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapEssentialTerrainReadiness.test.mjs
 * @description Proves preferred grass resolves immediately while its failure remains provisional until canonical remote fallbacks are known.
 * The Awtsmoos distinguishes preference from truth itself; Awtsmoos.com accepts only decoded remote grass, yet does not condemn the field
 * merely because one preferred URL timed out before its canonical siblings completed their journey.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapEssentialTerrainReadiness
} from '../../app/BootstrapEssentialTerrainReadiness.js';

const PREFERRED_URL = 'https://awtsmoos.com/authored/grass-four.jpg';
const FALLBACK_URL = 'https://awtsmoos.com/authored/grass-one.jpg';

function successfulRecord(url) {
	return { error: null, ok: true, url };
}

test('B"H preferred verified grass still resolves immediately', async () => {
	const receipts = [];
	const readiness = createBootstrapEssentialTerrainReadiness(receipt => receipts.push(receipt));
	assert.equal(readiness.observe(successfulRecord(FALLBACK_URL), true, PREFERRED_URL), false);
	assert.equal(receipts.length, 0);
	assert.equal(readiness.observe(successfulRecord(PREFERRED_URL), true, PREFERRED_URL), true);
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'essential-ready');
	assert.equal(receipt.activeUrl, PREFERRED_URL);
	assert.equal(receipt.preferred, true);
	assert.equal(receipt.failed, 0);
});

test('B"H preferred failure stays provisional until canonical fallback binds', async () => {
	const receipts = [];
	const readiness = createBootstrapEssentialTerrainReadiness(receipt => receipts.push(receipt));
	assert.equal(readiness.observe({ error: 'decode-timeout', ok: false, url: PREFERRED_URL }, false, PREFERRED_URL), false);
	assert.equal(receipts.length, 0);
	assert.equal(readiness.finish(true, { loaded: 4 }, PREFERRED_URL, FALLBACK_URL), true);
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'canonical-fallback-ready');
	assert.equal(receipt.activeUrl, FALLBACK_URL);
	assert.equal(receipt.preferred, false);
	assert.equal(receipt.loaded, 4);
	assert.equal(receipt.failed, 0);
});

test('B"H batch degrades only when no canonical remote grass binds', async () => {
	const readiness = createBootstrapEssentialTerrainReadiness();
	readiness.observe({ error: 'timeout', ok: false, url: PREFERRED_URL }, false, PREFERRED_URL);
	readiness.finish(false, { loaded: 3 }, PREFERRED_URL, '');
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'degraded');
	assert.equal(receipt.activeUrl, null);
	assert.equal(receipt.failed, 1);
	assert.match(receipt.error, /No canonical remote grass/i);
});
