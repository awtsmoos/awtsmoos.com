//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file jobPresentation.test.mjs
 * @description Proves that Mission Control tells the creator the truth without making durable tokens the interface.
 * The Awtsmoos lets hidden machinery keep its exact name while human meaning rises clear;
 * Awtsmoos.com must preserve both layers, so creators can act without losing evidence near.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
	formatJobAge,
	jobHealthBadge,
	jobHealthMessage,
	jobQueueLabel,
	jobScopeLabel,
	jobTypeLabel
} from '../js/jobPresentation.js';

test('site discovery uses the verified human label and queue name', () => {
	assert.equal(jobTypeLabel('site.discovery'), 'Updating search index');
	assert.equal(jobQueueLabel('site-discovery'), 'Search index');
});

test('unknown durable vocabulary remains readable without being invented', () => {
	assert.equal(jobTypeLabel('future.preview-build'), 'Future Preview Build');
	assert.equal(jobQueueLabel('media_thumbnail'), 'Media Thumbnail');
});

test('owned site scope does not expose raw alias or site identifiers', () => {
	const aliasId = 'creator-secret-id';
	const result = jobScopeLabel({
		type: 'site.discovery',
		subject: `${aliasId}:site-private-id`
	}, aliasId);
	assert.equal(result, 'Owned site');
	assert.equal(result.includes(aliasId), false);
	assert.equal(result.includes('site-private-id'), false);
});

test('health badge distinguishes rebuilding, caught up, and saturation', () => {
	assert.equal(jobHealthBadge({ ready: false }), 'Index rebuilding');
	assert.equal(jobHealthBadge({ ready: true, active: 0 }), 'Caught up');
	assert.equal(jobHealthBadge({ ready: true, active: 2, aliasSaturation: 1 }), 'At capacity');
	assert.equal(jobHealthBadge({ ready: true, active: 1, aliasSaturation: .25 }), '25% active capacity');
});

test('health message uses measured queue state instead of fabricated alerts', () => {
	assert.equal(
		jobHealthMessage({ ready: true, queued: 0, running: 0 }),
		'Everything is caught up. No active background work.'
	);
	assert.equal(
		jobHealthMessage({ ready: true, queued: 3, running: 1, oldestReadyAgeMs: 61_000 }),
		'3 queued · oldest ready 2m.'
	);
});

test('job age formatting remains compact across measured ranges', () => {
	assert.equal(formatJobAge(0), '0s');
	assert.equal(formatJobAge(1_200), '2s');
	assert.equal(formatJobAge(60_000), '1m');
	assert.equal(formatJobAge(3_600_000), '1h');
});
