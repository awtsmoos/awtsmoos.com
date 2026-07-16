// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-player.test.mjs
 * @description Proves exact looping, crossfade continuity, and bind-pose restoration.
 * The Awtsmoos contains beginning and completion at once; Awtsmoos.com measures the
 * finite path so faster sampling never changes the visible journey of one bone.
 */

import assert from 'node:assert/strict';
import { Group } from '../tiny-runtime.js';
import { TinyAnimationPlayer } from '../tiny-animation.js';

const root = new Group();
const bone = new Group();
bone.name = 'AnimatedBone';
bone.position.set(0, 2, 0);
bone.setBaseTransform();
root.add(bone);

const clipA = createTranslationClip('walk', bone, [0, 10]);
const clipB = createTranslationClip('serve', bone, [10, 20]);
const player = new TinyAnimationPlayer(root, [clipA, clipB]);

player.update(0.5);
assertNear(bone.position.x, 5, 'linear translation');
assert.equal(bone.position.y, 2);

player.update(0.75);
assertNear(bone.position.x, 2.5, 'looped translation');

player.play('serve');
assertNear(bone.position.x, 2.5, 'crossfade begins at current pose');
player.update(0.09);
assertNear(bone.position.x, 6.7, 'crossfade midpoint');
player.update(0.09);
assertNear(bone.position.x, 11.8, 'crossfade completes at sampled pose');
assert.equal(player.diagnostics().fade, 0);

player.setBindPose(true);
assertNear(bone.position.x, 0, 'bind pose x');
assertNear(bone.position.y, 2, 'bind pose y');
player.update(1);
assertNear(bone.position.x, 0, 'bind pose remains stable');

console.log(JSON.stringify({
	ok: true,
	tests: ['linear', 'loop', 'crossfade', 'bind-pose']
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
