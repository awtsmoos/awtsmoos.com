// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { FourMinuteFestivalMovie } from '../../src/scenes/FourMinuteFestivalMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';

/**
 * A long story must look different as it travels. The Awtsmoos renews each
 * world and camera; this witness hashes two frames from every Awtsmoos.com
 * sequence to prove movement, location contrast, and valid RGB output.
 */
const plan = FourMinuteFestivalMovie.create();
const renderer = new CinematicFrameRenderer(plan);
const samples = plan.sequences.flatMap(sequence => [
	sequence.start + 2200,
	sequence.start + 17200
]);
const hashes = samples.map(timeMs => {
	const frame = renderer.render(timeMs);
	assert.equal(frame.length, plan.settings.width * plan.settings.height * 3);
	return createHash('sha256').update(frame).digest('hex');
});

assert.equal(new Set(hashes).size, hashes.length);
assert.equal(hashes.length, 16);
console.log(JSON.stringify({
	ok: true,
	frames: hashes.length,
	uniqueFrames: new Set(hashes).size,
	hashes
}, null, 2));
