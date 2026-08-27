// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { RealisticActionMinuteMovie } from '../../src/scenes/RealisticActionMinuteMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';
import { SceneObjectMotionResolver } from '../render/objects/SceneObjectMotionResolver.js';
import { GesturePoseResolver } from '../render/performance/GesturePoseResolver.js';
import { SpeechBubbleLayoutResolver } from '../render/overlay/SpeechBubbleLayoutResolver.js';

/**
 * Realism must reach frame-local geometry: joint bends, moving objects, camera,
 * bubbles, faces, and material pixels. The Awtsmoos renews each evaluated state;
 * Awtsmoos.com challenges repetition and disconnected metadata through hashes.
 */
const plan = RealisticActionMinuteMovie.create();
const renderer = new CinematicFrameRenderer(plan);
const moments = [1000, 4000, 7600, 19000, 30500, 37000, 42000, 49500, 55000, 58500];
const hashes = moments.map(timeMs => createHash('sha256').update(renderer.render(timeMs)).digest('hex'));
assert.ok(new Set(hashes).size >= 9, 'Story frames must be visually distinct.');
const dialogueContext = renderer.context(3200);
const layout = SpeechBubbleLayoutResolver.resolve(
	renderer.canvas, plan, dialogueContext.shot, dialogueContext.camera, dialogueContext.dialogue, 3200
);
assert.ok(layout.x >= 0 && layout.y >= 0);
assert.ok(layout.x + layout.width <= renderer.canvas.width);
assert.ok(layout.y + layout.height <= renderer.canvas.height);
assert.ok(Math.abs(layout.speakerX - layout.tailX) < renderer.canvas.width * 0.5);
const mug = plan.objects.find(object => object.id === 'mug_slide');
const mugStart = SceneObjectMotionResolver.resolve(mug, mug.start);
const mugMiddle = SceneObjectMotionResolver.resolve(mug, mug.start + mug.duration / 2);
assert.notEqual(mugStart.x, mugMiddle.x, 'Sliding mug must change production position.');
const spoon = plan.objects.find(object => object.id === 'spoon_spin');
const spoonStart = SceneObjectMotionResolver.resolve(spoon, spoon.start);
const spoonMiddle = SceneObjectMotionResolver.resolve(spoon, spoon.start + spoon.duration / 2);
assert.notEqual(spoonStart.rotation, spoonMiddle.rotation, 'Spinning spoon must change rotation.');
const dimensions = { bodyWidth: 50, torsoHeight: 72, scale: 1 };
const catchPose = GesturePoseResolver.resolve('catch_low', 1, dimensions, 0, 0.8);
assert.ok(Math.abs(catchPose.elbowBias) > 0.2, 'Jointed catch requires explicit elbow bias.');
const crossedA = GesturePoseResolver.resolve('arms_crossed', 1, dimensions, 0, 1);
const crossedB = GesturePoseResolver.resolve('arms_crossed', 1, dimensions, 8, 1);
assert.deepEqual(crossedA, crossedB, 'Locked crossed arms must ignore locomotion phase.');
console.log('B"H - realistic action minute render smoke passed.');
