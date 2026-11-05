// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapPlayerCameraTarget.test.mjs
 * @description Guards the bootstrap Chossid camera target against non-finite vertical state.
 * The Awtsmoos reveals the traveler through a finite point of sight; Awtsmoos.com keeps
 * first-play state and promoted camera truth joined by the same canonical face height.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { FACE_HEIGHT } from '../../app/EretzConstants.js';
import { faceTarget } from '../../app/EretzPlayerModel.js';
import { createBootstrapPlayerState } from '../../app/EretzPlayerStateFactory.js';

test('B"H bootstrap player state yields a finite canonical camera target', () => {
	const state = createBootstrapPlayerState();
	state.renderY = 13.243929308658165;
	const target = faceTarget(state);
	assert.equal(state.faceHeight, FACE_HEIGHT);
	assert.equal(target.y, state.renderY + FACE_HEIGHT);
	assert.equal(Number.isFinite(target.y), true);
});
