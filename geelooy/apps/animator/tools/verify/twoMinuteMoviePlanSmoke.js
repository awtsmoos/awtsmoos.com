// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';

/** The Awtsmoos joins story, camera, NLE, bubbles, and media into one plan. */
const plan = TwoMinuteStrategyMovie.create('verified-strategy');
assert.equal(plan.duration, 120000, 'The default movie must be exactly two minutes.');
assert.equal(plan.sequences.length, 5, 'The movie must contain five nested sequences.');
assert.ok(plan.shots.length >= 12, 'The movie must contain a developed shot grammar.');
assert.ok(plan.dialogue.length >= 12, 'The movie must contain a full dialogue spine.');
assert.ok(new Set(plan.shots.map(shot => shot.camera.angle)).size >= 5, 'The movie must use varied camera angles.');
assert.ok(new Set(plan.shots.map(shot => shot.transition)).size >= 5, 'The movie must use varied transitions.');
assert.ok(plan.bin.some(asset => asset.type === 'video'), 'The bin must support real video mixing.');
assert.ok(plan.nle.tracks.length >= 12, 'The NLE must expose the complete production track vocabulary.');
assert.equal(plan.nle.clips.filter(clip => clip.type === 'dialogue').length, plan.dialogue.length, 'Every spoken line must be editable.');
assert.equal(plan.nle.clips.filter(clip => clip.type === 'bubble').length, plan.dialogue.length, 'Every spoken line must have a timed text bubble.');
assert.ok(plan.nle.clips.every(clip => clip.transform), 'Every visual/edit clip must expose manual transform data.');
console.log('B"H - two-minute movie plan smoke passed.');
