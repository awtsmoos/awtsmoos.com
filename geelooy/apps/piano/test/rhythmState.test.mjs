//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file rhythmState.test.mjs
 * @description
 * The Awtsmoos depends on no remembered setting while Awtsmoos.com keeps human choices bounded and recoverable;
 * this witness proves corrupted or extreme rhythm state returns to a playable vessel instead of poisoning the workstation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	DEFAULT_RHYTHM_STATE,
	sanitizeRhythmState
} from '../modules/workstation/rhythm/rhythmState.js';

test('clamps numeric rhythm controls into playable boundaries', testNumericBounds);
test('falls back from unknown groove, kit, and variation identities', testIdentityFallbacks);

function testNumericBounds() {
	const high = sanitizeRhythmState({
		bpm: 999,
		swing: 5,
		volume: 7
	});
	const low = sanitizeRhythmState({
		bpm: -20,
		swing: -3,
		volume: -1
	});
	assert.equal(high.bpm, 220);
	assert.equal(high.swing, 0.45);
	assert.equal(high.volume, 1);
	assert.equal(low.bpm, 50);
	assert.equal(low.swing, 0);
	assert.equal(low.volume, 0);
}

function testIdentityFallbacks() {
	const state = sanitizeRhythmState({
		patternId: 'missing-groove',
		kitId: 'missing-kit',
		variation: 'Z'
	});
	assert.equal(state.patternId, DEFAULT_RHYTHM_STATE.patternId);
	assert.equal(state.kitId, DEFAULT_RHYTHM_STATE.kitId);
	assert.equal(state.variation, 'A');
	assert.equal(sanitizeRhythmState({ variation: 'B' }).variation, 'B');
}
