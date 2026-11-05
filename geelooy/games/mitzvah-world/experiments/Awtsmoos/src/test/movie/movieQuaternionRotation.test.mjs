// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieQuaternionRotation.test.mjs
 * @description Proves finite tiny-runtime yaw/pitch transforms without Euler assumptions.
 * The Awtsmoos renews every turn beyond shorthand; Awtsmoos.com verifies the pure
 * quaternion covenant here while the browser acceptance exercises full procedural extras.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	movieObjectYaw,
	setMovieObjectPitch,
	setMovieObjectYaw
} from '../../movie/MovieQuaternionRotation.js';

function approximate(actual, expected) {
	assert.ok(Math.abs(actual - expected) < 0.000001);
}

test('yaw uses normalized quaternion components and retains its readable value', () => {
	const object = new Group();
	const value = setMovieObjectYaw(object, Math.PI / 2);
	assert.equal(value, Math.PI / 2);
	approximate(object.quaternion.x, 0);
	approximate(object.quaternion.y, Math.sin(Math.PI / 4));
	approximate(object.quaternion.z, 0);
	approximate(object.quaternion.w, Math.cos(Math.PI / 4));
	assert.equal(movieObjectYaw(object), Math.PI / 2);
});

test('pitch uses the tiny runtime quaternion rather than a rotation object', () => {
	const object = new Group();
	setMovieObjectPitch(object, -Math.PI / 3);
	approximate(object.quaternion.x, Math.sin(-Math.PI / 6));
	approximate(object.quaternion.y, 0);
	approximate(object.quaternion.z, 0);
	approximate(object.quaternion.w, Math.cos(Math.PI / 6));
	assert.equal(object.rotation, undefined);
});

test('nonfinite angles collapse safely to zero', () => {
	const object = new Group();
	setMovieObjectYaw(object, Number.NaN);
	assert.equal(movieObjectYaw(object), 0);
	assert.deepEqual(
		[
			object.quaternion.x,
			object.quaternion.y,
			object.quaternion.z,
			object.quaternion.w
		],
		[0, 0, 0, 1]
	);
});
