// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file twoMinuteMoviePlanSmoke.js
 * @description
 * The Awtsmoos lets a two-minute story prove its exact scene rhythm, camera variety, motion, dialogue, blocking, and editable NLE before export;
 * Awtsmoos.com makes structural cinematic promises executable so a richer movie cannot silently fall back into twelve static viewpoints.
 */

import assert from 'node:assert/strict';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';

const plan = TwoMinuteStrategyMovie.create('verified-strategy-pass9');
const sequenceIds = new Set(plan.sequences.map((sequence) => sequence.id));
const angles = new Set(plan.shots.map((shot) => shot.camera.angle));
const moves = new Set(plan.shots.map((shot) => shot.camera.move));
const lenses = new Set(plan.shots.map((shot) => shot.camera.lens));
const environments = new Set(plan.sequences.map((sequence) => sequence.environment));
const environmentTypes = new Set(plan.sequences.map((sequence) => sequence.environmentType));

assert.equal(plan.duration, 120000, 'Movie must be exactly two minutes.');
assert.equal(plan.sequences.length, 8, 'Movie must contain eight distinct scene sequences.');
assert.equal(plan.shots.length, 24, 'Movie must contain twenty-four cinematic shots.');
assert.equal(plan.dialogue.length, 16, 'Movie must contain sixteen dialogue beats.');
assert.ok(plan.performances.length >= 24, 'Movie must contain full-film layered performance motion.');
assert.equal(environments.size, 8, 'Every sequence must use a distinct rendered environment.');
assert.deepEqual(environmentTypes, new Set(['interior', 'exterior']), 'Movie must travel through interior and exterior scenes.');
assert.equal(angles.size, 12, 'Movie must use all twelve supported camera-angle families.');
assert.ok(moves.size >= 16, 'Movie must use at least sixteen distinct camera movements.');
assert.equal(lenses.size, 5, 'Movie must use all five cinematic lens families.');

for (const [index, sequence] of plan.sequences.entries()) {
	assert.equal(sequence.start, index * 15000, `Sequence ${sequence.id} must start on its 15-second boundary.`);
	assert.equal(sequence.duration, 15000, `Sequence ${sequence.id} must last exactly 15 seconds.`);
	assert.equal(plan.shots.filter((shot) => shot.sequenceId === sequence.id).length, 3, `Sequence ${sequence.id} must contain three shots.`);
}

for (const [index, shot] of plan.shots.entries()) {
	assert.equal(shot.start, index * 5000, `Shot ${shot.id} must start on its five-second boundary.`);
	assert.equal(shot.duration, 5000, `Shot ${shot.id} must last five seconds.`);
	assert.ok(sequenceIds.has(shot.sequenceId), `Shot ${shot.id} must reference a real sequence.`);
	assert.ok(shot.characters.length > 0, `Shot ${shot.id} must expose visible cast.`);
	assert.equal(Object.keys(shot.blocking ?? {}).length, shot.characters.length, `Shot ${shot.id} must block every visible character.`);
}

for (const line of plan.dialogue) {
	assert.ok(sequenceIds.has(line.sequenceId), `Dialogue ${line.id} must reference a real sequence.`);
}
for (const performance of plan.performances) {
	assert.ok(sequenceIds.has(performance.sequenceId), `Performance ${performance.id} must reference a real sequence.`);
}
for (const use of plan.assetUses) {
	assert.ok(sequenceIds.has(use.payload?.sequenceId), `Asset use ${use.id} must reference a real sequence.`);
}

assert.ok(plan.bin.some((asset) => asset.type === 'video'), 'Bin must preserve optional real-video mixing.');
assert.ok(plan.nle.tracks.length >= 12, 'NLE must expose the complete production track vocabulary.');
assert.equal(plan.nle.clips.filter((clip) => clip.type === 'dialogue').length, plan.dialogue.length, 'Every spoken line must remain editable.');
assert.equal(plan.nle.clips.filter((clip) => clip.type === 'bubble').length, plan.dialogue.length, 'Every spoken line must retain a timed text bubble.');
assert.ok(plan.nle.clips.every((clip) => clip.transform), 'Every visual/edit clip must expose manual transform data.');
console.log('B"H - expanded two-minute cinematic plan smoke passed.');
