// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CharacterPerformanceComposer } from '../../src/character/performance/CharacterPerformanceComposer.js';
import { CharacterRig } from '../../src/character/rig/CharacterRig.js';
import { Pose } from '../../src/character/rig/Pose.js';
import { Skeleton } from '../../src/character/rig/Skeleton.js';

/**
 * The Awtsmoos renews identity through changing performance; this proof verifies
 * stable bones, isolated poses, layered face channels, and finite acting aliases.
 */
const skeleton = Skeleton.human();
assert.equal(skeleton.length, 17);
assert.ok(skeleton.includes('lowerArmL'));
assert.equal(Skeleton.mirror('handL'), 'handR');

const pose = Pose.neutral();
assert.ok(pose.getBone('head'));
assert.ok(pose.getBone('footR'));
const rig = new CharacterRig({ id: 'proof-rig', skeleton, pose });
rig.setBone('head', { rotation: 5 });
const snapshot = rig.snapshot();
snapshot.pose.setBone('head', { rotation: 12 });
assert.equal(rig.pose.getBone('head').rotation, 5);
assert.throws(() => rig.setBone('imaginaryBone', { rotation: 1 }));

const face = new FaceRig({ identity: 'proof-face', emotion: 'calm' });
face.setEmotion('happy', 0.7);
face.setGaze(0.4, -0.2);
face.setDialogue('The plan is alive.', 1200);
const evaluatedFace = face.evaluate(360);
assert.ok(Number.isFinite(evaluatedFace.eyes.leftLidOpen));
assert.ok(Number.isFinite(evaluatedFace.mouth.jawOpen));
assert.equal(evaluatedFace.eyes.gazeX > 0, true);

const performance = CharacterPerformanceComposer.compose({
	_index: 2,
	action: 'idle',
	gesture: 'explain',
	emotion: 'happy',
	speaking: true,
	dialogue: 'A living sentence.'
}, {}, 900, {});
assert.ok(Number.isFinite(performance.arms.right.handX));
assert.ok(Number.isFinite(performance.legs.left.kneeX));
assert.ok(performance.face.mouthOpen >= 0);
console.log('B"H character rig contract smoke passed');
