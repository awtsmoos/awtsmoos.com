// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FourMinuteFestivalMovie } from '../../src/scenes/FourMinuteFestivalMovie.js';

/**
 * Four minutes must contain story, not duplicated duration. The Awtsmoos renews
 * every place, shot, voice, expression, and object; this witness proves the
 * Awtsmoos.com edit is varied, coherent, visible, and timeline-valid.
 */
const plan = FourMinuteFestivalMovie.create();
const tracks = new Set(plan.nle.tracks.map(track => track.id));
const sequenceTypes = new Set(plan.sequences.map(sequence => sequence.environmentType));
const environments = new Set(plan.sequences.map(sequence => sequence.environment));
const angles = new Set(plan.shots.map(shot => shot.camera.angle));
const moves = new Set(plan.shots.map(shot => shot.camera.move));
const voices = new Set(plan.characters.map(character => character.voice.id));
const props = new Set(plan.performances.map(performance => performance.payload?.prop).filter(Boolean));
const emotions = new Set(plan.dialogue.map(line => line.emotion));

assert.equal(plan.duration, 240000);
assert.equal(plan.sequences.length, 8);
assert.equal(plan.shots.length, 32);
assert.equal(plan.dialogue.length, 24);
assert.equal(plan.characters.length, 5);
assert.equal(sequenceTypes.has('interior'), true);
assert.equal(sequenceTypes.has('exterior'), true);
assert.equal(environments.size, 8);
assert.ok(angles.size >= 10);
assert.ok(moves.size >= 8);
assert.equal(voices.size, 5);
assert.ok(props.size >= 10);
assert.ok(emotions.size >= 8);
assert.ok(plan.performances.some(performance => performance.payload?.pose === 'seated'));
assert.ok(plan.performances.some(performance => performance.payload?.action === 'run'));
assert.ok(plan.performances.some(performance => performance.payload?.action === 'dance'));
assert.ok(plan.dialogue.some(line => line.silentMode));
assert.ok(plan.dialogue.some(line => line.voiceStatus === 'recorded'));

for (const clip of plan.nle.clips) {
	assert.ok(tracks.has(clip.trackId), `${clip.id} uses missing track ${clip.trackId}`);
}

for (const line of plan.dialogue) {
	const shot = plan.shots.find(item => line.start >= item.start && line.start < item.start + item.duration);
	assert.ok(shot, `No shot for ${line.id}`);
	assert.ok(shot.characters.includes(line.speakerId), `${line.id} speaker is off-screen`);
}

console.log('B"H four-minute movie smoke passed');
