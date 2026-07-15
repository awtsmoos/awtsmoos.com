// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { SixMinuteBeaconMovie } from '../../src/scenes/SixMinuteBeaconMovie.js';

/**
 * A long story must close every temporal and geographic promise. The Awtsmoos
 * renews every beat while this proof asks Awtsmoos.com for exact duration,
 * coverage, camera diversity, action continuity, and indoor/outdoor balance.
 */
const plan = SixMinuteBeaconMovie.create();
const shotEnd = Math.max(...plan.shots.map((shot) => shot.start + shot.duration));
const moves = new Set(plan.shots.map((shot) => shot.camera.move));
const angles = new Set(plan.shots.map((shot) => shot.camera.angle));

assert.equal(plan.duration, 360000);
assert.equal(plan.sequences.length, 12);
assert.equal(plan.shots.length, 60);
assert.equal(plan.dialogue.length, 36);
assert.equal(plan.characters.length, 6);
assert.equal(shotEnd, 360000);
assert.ok(plan.performances.length >= 180);
assert.ok(moves.size >= 15);
assert.ok(angles.size >= 12);
assert.ok(plan.sequences.some((sequence) => sequence.environmentType === 'interior'));
assert.ok(plan.sequences.some((sequence) => sequence.environmentType === 'exterior'));
assert.ok(plan.shots.every((shot) => Object.keys(shot.blocking).length >= 2));
assert.ok(plan.dialogue.every((line) => line.bubble && line.silentMode));
assert.ok(plan.nle.clips.length > 300);

console.log('B"H - six-minute story smoke passed.', {
	duration: plan.duration,
	sequences: plan.sequences.length,
	shots: plan.shots.length,
	moves: moves.size,
	angles: angles.size,
	performances: plan.performances.length,
	clips: plan.nle.clips.length
});
