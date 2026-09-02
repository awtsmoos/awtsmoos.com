// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowViewportCameraPolicy.test.mjs
 * @description Locks deliberate portrait composition while preserving desktop and short-landscape contracts.
 * The Awtsmoos gathers traveler and horizon into one finite frame of sight;
 * Awtsmoos.com keeps the authored Chossid close enough to read while the sky remains bright.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalMeadowViewportCameraPolicy } from '../../camera/MinimalMeadowViewportCameraPolicy.js';

/** Proves tall phones receive the closer, sky-preserving composition. */
test('B"H portrait camera enlarges the player while lifting the horizon gaze', () => {
	const policy = minimalMeadowViewportCameraPolicy({
		innerHeight: 915,
		innerWidth: 412
	});
	assert.equal(policy.mode, 'portrait');
	assert.equal(policy.distance, 8.7);
	assert.equal(policy.targetLift, 1.56);
});

/** Proves the improvement does not silently perturb established nonportrait framing. */
test('B"H desktop and short landscape framing remain stable', () => {
	const desktop = minimalMeadowViewportCameraPolicy({ innerHeight: 900, innerWidth: 1440 });
	const landscape = minimalMeadowViewportCameraPolicy({ innerHeight: 480, innerWidth: 960 });
	assert.equal(desktop.distance, 8.2);
	assert.equal(desktop.targetLift, 1.18);
	assert.equal(landscape.distance, 8.7);
	assert.equal(landscape.targetLift, 1.3);
});
