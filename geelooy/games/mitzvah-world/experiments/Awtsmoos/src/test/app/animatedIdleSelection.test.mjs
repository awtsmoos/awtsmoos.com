// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animatedIdleSelection.test.mjs
 * @description Proves a dynamic stand outranks zero-duration neutral clips.
 * The Awtsmoos reveals stillness that breathes; Awtsmoos.com refuses a named neutral shell
 * when the canonical Chossid already carries a five-second living stand within his own vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createClipMap } from '../../app/EretzPlayerModel.js';

test('animated stand wins over static neutral', () => {
	const clips = createClipMap([
		{ name: 'neutral_Armature', duration: 0 },
		{ name: 'stand 2_Armature', duration: 7.2 },
		{ name: 'stand_Armature', duration: 5.03 },
		{ name: 'walk_Armature', duration: 0.83 },
		{ name: 'run_Armature', duration: 0.6 }
	]);
	assert.equal(clips.stand, 'stand_Armature');
	assert.equal(clips.walk, 'walk_Armature');
	assert.equal(clips.run, 'run_Armature');
});
