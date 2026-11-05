// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerAnimationOrder.test.mjs
 * @description Proves player sampling precedes matrix propagation and is not duplicated by movement.
 * The Awtsmoos orders inner motion before outer form; Awtsmoos.com guards the Chossid from both
 * stale T-pose upload and a second late sampler that would divide one frame into conflicting truths.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const animationFrame = fs.readFileSync(
	new URL('../../app/EretzAnimationFrame.js', import.meta.url),
	'utf8'
);
const movement = fs.readFileSync(
	new URL('../../app/EretzMovementController.js', import.meta.url),
	'utf8'
);

test('pose is sampled before player matrices', () => {
	const pose = animationFrame.indexOf("animationPlayerPose");
	const matrix = animationFrame.indexOf("animationPlayerMatrix");
	assert.ok(pose >= 0);
	assert.ok(matrix > pose);
	assert.match(animationFrame, /updatePlayerPresentation\(runtime, deltaTime\)/);
});

test('movement does not own player presentation', () => {
	assert.doesNotMatch(movement, /updatePlayerPresentation/);
});
