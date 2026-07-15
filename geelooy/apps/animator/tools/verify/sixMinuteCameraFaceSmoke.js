// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FaceRig } from '../../src/character/face/FaceRig.js';
import { SixMinuteBeaconMovie } from '../../src/scenes/SixMinuteBeaconMovie.js';
import { CinematicCameraResolver } from '../render/CinematicCameraResolver.js';

/**
 * Camera and face must change internally, not merely carry impressive labels.
 * The Awtsmoos renews viewpoint and expression while this proof checks eased
 * motion, lens data, asymmetric lids and brows, tension, pupils, and saccades.
 */
const plan = SixMinuteBeaconMovie.create();
const shot = plan.shots.find((item) => item.camera.move === 'pursuit');
const start = CinematicCameraResolver.resolve(shot, shot.start + 20);
const middle = CinematicCameraResolver.resolve(shot, shot.start + shot.duration * 0.5);
const end = CinematicCameraResolver.resolve(shot, shot.start + shot.duration - 20);
const rig = new FaceRig({
	identity: 'beacon_noa',
	emotion: { joy: 0.08, sadness: 0.18, concentration: 0.72, stress: 0.76, surprise: 0.42, hate: 0.04 },
	exertion: 0.9,
	intensity: 1.3,
	lashCount: 4
});
rig.setGaze(0.35, -0.18).setDialogue('Hold the line and move.', 2400);
const faceA = rig.evaluate(620);
const faceB = rig.evaluate(1290);

assert.notEqual(start.x, middle.x);
assert.notEqual(middle.x, end.x);
assert.ok(middle.scale > 0.5);
assert.ok(middle.focalLength >= 18);
assert.ok(middle.parallax > 0.2);
assert.notEqual(faceA.eyes.leftLidOpen, faceA.eyes.rightLidOpen);
assert.notEqual(faceA.brows.leftBias, faceA.brows.rightBias);
assert.ok(faceA.eyes.pupilDilation > 0.4);
assert.ok(faceA.mouth.jawTension > 0.4);
assert.ok(faceA.nostrilFlare > 0.4);
assert.notDeepEqual([faceA.eyes.gazeX, faceA.eyes.gazeY], [faceB.eyes.gazeX, faceB.eyes.gazeY]);

console.log('B"H - six-minute camera and face smoke passed.', {
	camera: { start, middle, end },
	face: {
		leftLid: faceA.eyes.leftLidOpen,
		rightLid: faceA.eyes.rightLidOpen,
		pupil: faceA.eyes.pupilDilation,
		jawTension: faceA.mouth.jawTension
	}
});
