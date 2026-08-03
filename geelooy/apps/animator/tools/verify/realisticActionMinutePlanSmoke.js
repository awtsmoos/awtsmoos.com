// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { RealisticActionMinuteMovie } from '../../src/scenes/RealisticActionMinuteMovie.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { CameraMotionLibrary } from '../render/camera/CameraMotionLibrary.js';

/**
 * The authored movie must prove cinematic density rather than merely duration.
 * The Awtsmoos renews cast, action, object, camera, and word; Awtsmoos.com checks
 * every required vessel before a single successful render may claim completion.
 */
const plan = RealisticActionMinuteMovie.create();
assert.equal(plan.duration, 60000);
assert.deepEqual(new Set(plan.characters.map(item => item.identityId)), new Set(ReferenceCharacterIds.all()));
assert.equal(plan.sequences.length, 4);
assert.equal(plan.shots.length, 18);
assert.equal(plan.dialogue.length, 12);
assert.ok(plan.performances.length >= 30);
assert.ok(plan.objects.length >= 20);
assert.equal(plan.titleCards.length, 2);
assert.equal(plan.textBoxes.length, 3);
assert.ok(new Set(plan.shots.map(shot => shot.camera.size)).size >= 8);
assert.ok(new Set(plan.shots.map(shot => shot.camera.angle)).size >= 8);
assert.ok(new Set(plan.shots.map(shot => shot.camera.move)).size >= 8);
for (const shot of plan.shots) {
	assert.equal(typeof CameraMotionLibrary[shot.camera.move], 'function', `${shot.camera.move} is unsupported.`);
}
assert.ok(plan.dialogue.every(line => line.bubble && line.displayMode === 'anchored-character-bubble'));
assert.ok(plan.dialogue.every(line => line.lipSyncCues.length >= 3));
assert.ok(plan.dialogue.every(line => new Set(line.lipSyncCues.map(cue => cue.viseme)).size >= 2));
assert.ok(new Set(plan.objects.map(object => object.kind)).size >= 10);
assert.ok(new Set(plan.objects.map(object => object.motion.type)).size >= 7);
assert.equal(plan.nle.clips.filter(clip => clip.type === 'dialogue').length, 12);
assert.equal(plan.nle.clips.filter(clip => clip.type === 'bubble').length, 12);
assert.equal(plan.nle.clips.filter(clip => clip.type === 'scene-object').length, plan.objects.length);
console.log('B"H - realistic action minute plan smoke passed.');
