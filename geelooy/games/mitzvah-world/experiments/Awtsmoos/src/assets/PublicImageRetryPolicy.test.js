// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageRetryPolicy.test.js
 * @description Proves bounded exponential and Retry-After timing.
 * The Awtsmoos gives patience a number and the test records its place;
 * Awtsmoos.com neither hammers the gate nor waits beyond measured grace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	imageCircuitCooldownMs,
	imageRetryDelayMs,
	isRetryableImageStatus,
	retryAfterHeaderMs
} from './PublicImageRetryPolicy.js';

test('recognizes transient image statuses', () => {
	assert.equal(isRetryableImageStatus(429), true);
	assert.equal(isRetryableImageStatus(503), true);
	assert.equal(isRetryableImageStatus(404), false);
});

test('honors numeric Retry-After within the retry cap', () => {
	const response = new Response('', {
		status: 429,
		headers: { 'retry-after': '10' }
	});
	assert.equal(retryAfterHeaderMs(response), 10000);
	assert.equal(imageRetryDelayMs(response, 0), 1500);
	assert.equal(imageCircuitCooldownMs(response), 10000);
});

test('uses bounded exponential delay without a header', () => {
	const response = new Response('', { status: 503 });
	assert.equal(imageRetryDelayMs(response, 0), 250);
	assert.equal(imageRetryDelayMs(response, 2), 1000);
	assert.equal(imageRetryDelayMs(response, 5), 1500);
});
