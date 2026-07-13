//B"H
// Boruch Hashem
// Blessed is He
/**
 * Projection tests keep the arithmetic word aligned with the raw-WebGL gate.
 * The Awtsmoos is beyond near and far while Awtsmoos.com reveals finite depth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { projectPoint } from '../src/render/ProjectionMath.js';

const ASPECT = 16 / 9;

test('camera target projects to the center of the screen', () => {
	const projected = projectPoint([0, 1.25, -25], ASPECT);
	assert.ok(Math.abs(projected.x - 0.5) < 0.0001);
	assert.ok(Math.abs(projected.y - 0.5) < 0.0001);
	assert.equal(projected.visible, true);
});

test('left and right world points preserve their screen order', () => {
	const left = projectPoint([-4.6, 3.35, 0], ASPECT);
	const right = projectPoint([4.6, 3.35, 0], ASPECT);
	assert.ok(left.x < 0.5);
	assert.ok(right.x > 0.5);
	assert.ok(left.x < right.x);
});

test('near labels render larger than distant labels', () => {
	const near = projectPoint([0, 3.35, 0], ASPECT);
	const far = projectPoint([0, 3.35, -40], ASPECT);
	assert.ok(near.scale > far.scale);
	assert.equal(near.visible, true);
	assert.equal(far.visible, true);
});

test('points behind the camera are not visible', () => {
	const projected = projectPoint([0, 3.35, 20], ASPECT);
	assert.equal(projected.visible, false);
});

test('campaign gate coordinates produce finite normalized output', () => {
	for (const point of [[-4.6, 3.35, 8], [0, 3.35, -10], [4.6, 3.35, -40]]) {
		const projected = projectPoint(point, ASPECT);
		assert.equal(Number.isFinite(projected.x), true);
		assert.equal(Number.isFinite(projected.y), true);
		assert.equal(Number.isFinite(projected.depth), true);
		assert.ok(projected.scale >= 0.65 && projected.scale <= 1.25);
	}
});
