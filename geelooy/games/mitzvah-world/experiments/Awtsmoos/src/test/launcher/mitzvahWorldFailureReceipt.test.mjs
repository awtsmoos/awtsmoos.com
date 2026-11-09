//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldFailureReceipt.test.mjs
 * @description Proves failures expose exact unmet playable conditions, failed resources, and one shared release/source/bundle covenant.
 * The Awtsmoos lets Awtsmoos.com turn a broken road into readable evidence rather than fog;
 * every failed gate keeps the finite name needed to repair, reproduce, and clear the log.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMitzvahWorldFailureReceipt,
	formatMitzvahWorldFailureReceipt
} from '../../launcher/MitzvahWorldFailureReceipt.js';
import { MITZVAH_WORLD_RELEASE_ID } from '../../launcher/MitzvahWorldReleaseIdentity.js';

test('not-playable failures preserve every missing condition and one release identity', () => {
	const error = new Error('MINIMAL_MEADOW_NOT_PLAYABLE:terrain-collision-active,camera-attached');
	error.failedUrl = '/assets/models/player/chossid.glb';
	const receipt = createMitzvahWorldFailureReceipt(error);
	assert.deepEqual(receipt.unmetConditions, [
		'terrain-collision-active',
		'camera-attached'
	]);
	assert.equal(receipt.failedUrl, '/assets/models/player/chossid.glb');
	assert.equal(receipt.releaseId, MITZVAH_WORLD_RELEASE_ID);
	assert.equal(receipt.sourceVersion, receipt.releaseId);
	assert.equal(receipt.bundleVersion, receipt.releaseId);
	assert.match(formatMitzvahWorldFailureReceipt(receipt), /Unmet: terrain-collision-active, camera-attached/);
});

test('deadline metadata survives normalization without inventing a URL', () => {
	const error = new Error('MITZVAH_WORLD_ESSENTIAL_BOOT_TIMEOUT');
	error.code = 'MITZVAH_WORLD_ESSENTIAL_BOOT_TIMEOUT';
	error.stage = 'canonicalChossidDecoded';
	error.detail = 'canonical model receipt remained pending';
	const receipt = createMitzvahWorldFailureReceipt(error);
	assert.equal(receipt.stage, 'canonicalChossidDecoded');
	assert.equal(receipt.detail, 'canonical model receipt remained pending');
	assert.equal(receipt.failedUrl, '');
});
