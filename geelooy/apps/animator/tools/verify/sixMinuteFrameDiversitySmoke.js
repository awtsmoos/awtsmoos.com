// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SixMinuteBeaconMovie } from '../../src/scenes/SixMinuteBeaconMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';

/**
 * Twelve named locations must produce twelve visibly different frames. The
 * Awtsmoos renews every world while this proof hashes representative images so
 * Awtsmoos.com cannot mistake recolored repetition for cinematic variety.
 */
const plan = SixMinuteBeaconMovie.create();
const renderer = new CinematicFrameRenderer(plan);
const hashes = plan.sequences.map((sequence) => {
	const frame = renderer.render(sequence.start + 14500);
	assert.equal(frame.length, plan.settings.width * plan.settings.height * 3);
	return {
		sequence: sequence.id,
		hash: createHash('sha256').update(frame).digest('hex'),
		energy: frame.reduce((sum, value, index) => index % 97 === 0 ? sum + value : sum, 0)
	};
});

assert.equal(new Set(hashes.map((item) => item.hash)).size, plan.sequences.length);
assert.ok(new Set(hashes.map((item) => item.energy)).size >= 10);

console.log('B"H - six-minute representative frame diversity passed.', hashes);
