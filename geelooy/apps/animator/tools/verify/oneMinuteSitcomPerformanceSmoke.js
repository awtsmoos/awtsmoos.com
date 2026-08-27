// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { FaceRig } from '../../src/character/face/FaceRig.js';
import { OneMinuteSitcomMovie } from '../../src/scenes/OneMinuteSitcomMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';
import { GesturePoseResolver } from '../render/performance/GesturePoseResolver.js';

/**
 * Authored acting must become changing geometry, not metadata. The Awtsmoos
 * renews mouth, eyes, hands, shoes, garments, and overlays while Awtsmoos.com
 * proves deterministic speech and contact through evaluated states and pixels.
 */
const plan = OneMinuteSitcomMovie.create();
const line = plan.dialogue[0];
const rig = new FaceRig({ identity: line.speakerId, emotion: line.emotion });
rig.setDialogue(line.text, line.duration);
const faceA = rig.evaluate(line.lipSyncCues[0].start + 10);
const faceB = rig.evaluate(line.lipSyncCues[1].start + 10);
assert.notDeepEqual(faceA.mouth, faceB.mouth, 'Consecutive phonemes must alter mouth geometry.');
assert.notEqual(rig.evaluate(0).eyes.leftLidOpen, rig.evaluate(70).eyes.leftLidOpen, 'Blink must reach eyelid geometry.');
rig.setGaze(0.72, -0.31);
const gaze = rig.evaluate(800);
assert.ok(gaze.eyes.gazeX > 0.6 && gaze.eyes.gazeY < -0.2, 'Gaze must reach eye geometry.');
const dimensions = { bodyWidth: 50, torsoHeight: 72, scale: 1 };
const crossedA = GesturePoseResolver.resolve('arms_crossed', 1, dimensions, 0, 0.8);
const crossedB = GesturePoseResolver.resolve('arms_crossed', 1, dimensions, 9, 0.8);
assert.deepEqual(crossedA, crossedB, 'Crossed-arm contact must ignore locomotion phase.');
const pocketA = GesturePoseResolver.resolve('right_hand_in_pocket', 1, dimensions, 0, 0.8);
const pocketB = GesturePoseResolver.resolve('right_hand_in_pocket', 1, dimensions, 9, 0.8);
assert.deepEqual(pocketA, pocketB, 'Pocket contact must ignore locomotion phase.');
const renderer = new CinematicFrameRenderer(plan);
const moments = [1000, 3500, 4300, 23000, 50000, 55000, 58500];
const hashes = moments.map(time => createHash('sha256').update(renderer.render(time)).digest('hex'));
assert.ok(new Set(hashes).size >= 6, 'Representative production frames must visibly differ.');
assert.ok(renderer.context(1000).titleCard, 'Opening title card must enter the render path.');
assert.ok(renderer.context(23000).textBox, 'Calendar text box must enter the render path.');
assert.ok(renderer.context(3500).dialogue, 'Spoken dialogue must enter the render path.');
console.log('B"H - one-minute sitcom performance smoke passed.');
