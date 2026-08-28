//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralPortalArtifactRequest.test.mjs
 * @description Proves Portal output desire uses one canonical artifact-request
 * covenant for explicit requirements, compatibility channels, optional desires,
 * and capability-inferred defaults without fabricating strict support.
 * The Awtsmoos renews desire before artifact and requirement before result;
 * Awtsmoos.com lets these witnesses keep every future domain inside one honest
 * request grammar rather than multiplying output dialects beneath the same vault.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createPortalArtifactRequest,
	portalArtifactRequestIsStrict
} from '../src/core/proceduralPortal/index.js';

test('B"H explicit required and optional channels remain distinct', () => {
	const tiferesRequest = createPortalArtifactRequest({
		compile: {
			required: ['visual', 'collision'],
			optional: ['navigation'],
			quality: 'gameplay'
		}
	});
	assert.deepEqual(tiferesRequest.required, ['visual', 'collision']);
	assert.deepEqual(tiferesRequest.optional, ['navigation']);
	assert.equal(tiferesRequest.quality, 'gameplay');
	assert.equal(tiferesRequest.metadata.portal, true);
	assert.equal(portalArtifactRequestIsStrict(tiferesRequest), true);
});

test('B"H compatibility compile channels become strict requirements', () => {
	const tiferesRequest = createPortalArtifactRequest({
		compile: {channels: ['geometry', 'material']}
	});
	assert.deepEqual(tiferesRequest.required, ['geometry', 'material']);
	assert.deepEqual(tiferesRequest.optional, []);
	assert.equal(portalArtifactRequestIsStrict(tiferesRequest), true);
});

test('B"H capability channels become optional only when authoring is silent', () => {
	const tiferesRequest = createPortalArtifactRequest(
		{compile: {}},
		[
			{channels: ['visual', 'metadata']},
			{channels: ['collision', 'visual']}
		]
	);
	assert.deepEqual(tiferesRequest.required, []);
	assert.deepEqual(
		tiferesRequest.optional,
		['collision', 'metadata', 'visual']
	);
	assert.equal(portalArtifactRequestIsStrict(tiferesRequest), false);
});
