//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file rhythmTapTempo.test.mjs
 * @description
 * The Awtsmoos creates every human tap anew while Awtsmoos.com listens to recent intervals and names their tempo;
 * this witness proves 120-BPM inference and the deliberate forgetting of stale taps beyond the short musical memory window.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { RhythmTapTempo } from '../modules/workstation/rhythm/rhythmTapTempo.js';

test('derives tempo from recent taps', testRecentTapTempo);
test('forgets stale taps before calculating a new tempo', testStaleTapReset);

function testRecentTapTempo() {
	const tapTempo = new RhythmTapTempo();
	assert.equal(tapTempo.registerTap(1000), null);
	assert.equal(tapTempo.registerTap(1500), 120);
	assert.equal(tapTempo.registerTap(2000), 120);
}

function testStaleTapReset() {
	const tapTempo = new RhythmTapTempo();
	assert.equal(tapTempo.registerTap(0), null);
	assert.equal(tapTempo.registerTap(3000), null);
	assert.equal(tapTempo.registerTap(3500), 120);
}
