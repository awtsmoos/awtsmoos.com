// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapEssentialTerrainReadiness.test.mjs
 * @description Proves only preferred verified grass may unlock first-frame terrain readiness, while failure degrades promptly.
 * The Awtsmoos distinguishes the essential ray from every optional garment that may later appear;
 * Awtsmoos.com opens gameplay only for authored grass truly bound to earth, and reports failure without a ninety-second snare.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapEssentialTerrainReadiness
} from '../../app/BootstrapEssentialTerrainReadiness.js';

const PREFERRED_URL = 'https://awtsmoos.com/authored/grass-four.jpg';

/** Creates one minimal successful remote texture record for readiness decisions. */
function successfulRecord(url) {
	return {
		error: null,
		ok: true,
		url
	};
}

test('B"H optional texture settlement cannot unlock essential terrain readiness', async () => {
	const receipts = [];
	const readiness = createBootstrapEssentialTerrainReadiness(receipt => {
		receipts.push(receipt);
	});
	const optionalAccepted = readiness.observe(
		successfulRecord('https://awtsmoos.com/authored/soil.jpg'),
		true,
		PREFERRED_URL
	);
	assert.equal(optionalAccepted, false);
	assert.equal(receipts.length, 0);

	const preferredAccepted = readiness.observe(
		successfulRecord(PREFERRED_URL),
		true,
		PREFERRED_URL
	);
	assert.equal(preferredAccepted, true);
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'essential-ready');
	assert.equal(receipt.loaded, 1);
	assert.equal(receipt.failed, 0);
	assert.equal(receipt.preferredUrl, PREFERRED_URL);
	assert.equal(receipts.length, 1);
});

test('B"H preferred authored grass failure settles degraded immediately', async () => {
	const readiness = createBootstrapEssentialTerrainReadiness();
	const accepted = readiness.observe({
		error: 'decode-timeout',
		ok: false,
		url: PREFERRED_URL
	}, false, PREFERRED_URL);
	assert.equal(accepted, true);
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'degraded');
	assert.equal(receipt.loaded, 0);
	assert.equal(receipt.failed, 1);
	assert.equal(receipt.error, 'decode-timeout');
});

test('B"H a successful preferred record still degrades when visible binding rejects it', async () => {
	const readiness = createBootstrapEssentialTerrainReadiness();
	readiness.observe(successfulRecord(PREFERRED_URL), false, PREFERRED_URL);
	const receipt = await readiness.promise;
	assert.equal(receipt.phase, 'degraded');
	assert.match(receipt.error, /could not bind/i);
});
