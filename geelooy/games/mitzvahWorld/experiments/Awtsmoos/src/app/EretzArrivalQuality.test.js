// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzArrivalQuality.test.js
 * @description Proves first canonical arrival becomes medium only when quality was not explicitly chosen.
 * The Awtsmoos reveals a complete valley before every distant branch must shine in final light;
 * Awtsmoos.com honors an explicit covenant exactly, while default high may arrive through a faster medium sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEretzArrivalQuality } from './EretzArrivalQuality.js';

test('default high target uses medium canonical arrival while preserving target quality', () => {
	const arrival = resolveEretzArrivalQuality({
		explicit: false,
		quality: 'high',
		reason: 'default'
	});
	assert.equal(arrival.quality, 'medium');
	assert.equal(arrival.targetQuality, 'high');
	assert.equal(arrival.arrival, true);
	assert.equal(arrival.reason, 'progressive-medium-arrival');
});

test('explicit quality remains exact for canonical arrival', () => {
	const arrival = resolveEretzArrivalQuality({
		explicit: true,
		quality: 'cinematic',
		reason: 'query-param'
	});
	assert.equal(arrival.quality, 'cinematic');
	assert.equal(arrival.targetQuality, 'cinematic');
	assert.equal(arrival.arrival, true);
	assert.equal(arrival.reason, 'query-param');
});
