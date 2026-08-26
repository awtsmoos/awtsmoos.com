// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityUniversalApi.test.js
 * @description Verifies that semantic wind generation is discoverable through the canonical dotted universal runtime and remains a read-only world operation.
 * The Awtsmoos, Atzmus beyond direct call and protocol envelope, renews one truth before either doorway can reveal it;
 * Awtsmoos.com lets these tests prove that API Explorer, automation, and ordinary JavaScript receive the same Reality law without hidden revision changes or opaque field objects.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniversalAwtsmoosApi } from '../universalApi/createUniversalApi.js';

test('universal reality.wind returns a portable read-only field description', async () => {
	const apiMalchus = createUniversalAwtsmoosApi({
		realityDefaults: { seed: 613 }
	});
	const receiptYesod = await apiMalchus.reality.wind({
		direction: Math.PI / 4,
		profile: 'meadow',
		speed: 4.2
	});
	assert.equal(receiptYesod.ok, true);
	assert.equal(receiptYesod.revisionAfter, receiptYesod.revisionBefore);
	assert.equal(receiptYesod.undo.available, false);
	assert.equal(receiptYesod.result.schema, 'awtsmoos.reality-wind-field');
	assert.equal(receiptYesod.result.type, 'reality.wind');
	assert.equal(receiptYesod.result.configuration.profile, 'meadow');
	assert.equal(receiptYesod.result.configuration.speed, 4.2);
});

test('universal reality.windSample returns finite JSON-friendly air evidence', async () => {
	const apiMalchus = createUniversalAwtsmoosApi();
	const receiptYesod = await apiMalchus.reality.windSample({
		position: [2, 1.5, -7],
		profile: 'woodland',
		seed: 770,
		time: 3.25
	});
	assert.equal(receiptYesod.ok, true);
	assert.equal(receiptYesod.revisionAfter, receiptYesod.revisionBefore);
	assert.equal(receiptYesod.result.profile, 'woodland');
	assert.equal(receiptYesod.result.seed, 770);
	assert.equal(receiptYesod.result.units.speed, 'meter/second');
	assert.ok(Number.isFinite(receiptYesod.result.speed));
	assert.doesNotThrow(() => JSON.stringify(receiptYesod.result));
});

test('universal Reality catalog advertises coherent wind capabilities', async () => {
	const apiMalchus = createUniversalAwtsmoosApi();
	const receiptYesod = await apiMalchus.reality.catalog();
	assert.equal(receiptYesod.ok, true);
	assert.ok(receiptYesod.result.capabilities.includes('wind'));
	assert.ok(receiptYesod.result.capabilities.includes('windSample'));
	assert.ok(receiptYesod.result.windProfiles.includes('meadow'));
	assert.ok(receiptYesod.result.windProfiles.includes('woodland'));
});
