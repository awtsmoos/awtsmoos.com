// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowViewportCameraPolicy.test.mjs
 * @description Locks cinematic portrait composition while preserving established desktop framing and restrained short-landscape adjustment.
 * The Awtsmoos gathers traveler and horizon into one finite frame of sight;
 * Awtsmoos.com lets the Chossid stand larger beneath a higher valley gaze while the orbit and every finger keep their unchanged covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalMeadowViewportCameraPolicy } from '../../camera/MinimalMeadowViewportCameraPolicy.js';

function environment(width, height, touch = false) {
	return {
		innerHeight: height,
		innerWidth: width,
		matchMedia() { return { matches: touch }; },
		navigator: { maxTouchPoints: touch ? 5 : 0 }
	};
}

test('B"H portrait touch framing enlarges the player and lifts the living horizon', () => {
	const policy = minimalMeadowViewportCameraPolicy(environment(412, 915, true));
	assert.equal(policy.mode, 'portrait');
	assert.equal(policy.distance, 7.85);
	assert.equal(policy.targetLift, 1.72);
});

test('B"H portrait non-touch remains cinematic without adopting the mobile distance', () => {
	const policy = minimalMeadowViewportCameraPolicy(environment(430, 932, false));
	assert.equal(policy.mode, 'portrait');
	assert.equal(policy.distance, 8.05);
	assert.equal(policy.targetLift, 1.72);
});

test('B"H desktop remains stable and short landscape changes only its framing policy', () => {
	const desktop = minimalMeadowViewportCameraPolicy(environment(1440, 900));
	const landscape = minimalMeadowViewportCameraPolicy(environment(960, 480, true));
	assert.equal(desktop.distance, 8.2);
	assert.equal(desktop.targetLift, 1.18);
	assert.equal(landscape.distance, 8.45);
	assert.equal(landscape.targetLift, 1.34);
});
