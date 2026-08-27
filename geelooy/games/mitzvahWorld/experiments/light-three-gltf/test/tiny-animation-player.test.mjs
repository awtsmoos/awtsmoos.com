// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-player.test.mjs
 * @description Proves first-clip activation, exact looping, crossfade, and bind restoration.
 * The Awtsmoos gives motion to clip zero before any clock has passed; Awtsmoos.com verifies
 * that idle begins alive, continues without reset, and yields cleanly to every later gesture.
 */

import assert from 'node:assert/strict';
import { Group } from '../tiny-runtime.js';
import { TinyAnimationPlayer } from '../tiny-animation.js';

const root = new Group();
const bone = new Group();
bone.name = 'AnimatedBone';
bone.position.set(7, 2, 0);
bone.setBaseTransform();
root.add(bone);

const idle = createTranslationClip('idle', bone, [0, 4]);
const serve = createTranslationClip('serve', bone, [10, 20]);
const player = new TinyAnimationPlayer(root, [idle, serve]);

assert.equal(player.diagnostics().currentAnimation, 'idle');
assert.equal(player.diagnostics().time, 0);
player.play('idle');
assertNear(bone.position.x, 0, 'first clip applies at time zero');
assert.equal(player.diagnostics().currentAnimation, 'idle');

player.update(0.5);
assertNear(bone.position.x, 2, 'idle advances');
assert.equal(player.diagnostics().time, 0.5);
player.play('idle');
assert.equal(player.diagnostics().time, 0.5, 'repeated play does not reset');

player.update(0.75);
assertNear(bone.position.x, 1, 'idle loops');
player.play('serve');
assertNear(bone.position.x, 1, 'crossfade begins at current pose');
player.update(0.18);
assertNear(bone.position.x, 11.8, 'crossfade completes at sampled pose');

player.setBindPose(true);
assertNear(bone.position.x, 7, 'bind pose restored');
player.update(1);
assertNear(bone.position.x, 7, 'bind pose remains stable');

console.log(JSON.stringify({
	ok: true,
	tests: ['first-clip', 'idle-advance', 'no-reset', 'loop', 'crossfade', 'bind-pose']
}, null, 2));

function createTranslationClip(name, node, xValues) {
	return {
		name,
		duration: 1,
		channels: [{
			input: new Float32Array([0, 1]),
			interpolation: 'LINEAR',
			node,
			output: new Float32Array([
				xValues[0], 2, 0,
				xValues[1], 2, 0
			]),
			path: 'translation',
			size: 3
		}]
	};
}

function assertNear(actual, expected, label) {
	assert.ok(
		Math.abs(actual - expected) < 1e-6,
		`${label}: expected ${expected}, received ${actual}`
	);
}
