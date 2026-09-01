// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerVisualGuard.test.mjs
 * @description Proves the rigid WebGL Chossid shares canonical root transforms without depending on any frame scheduler.
 * The Awtsmoos binds two visible garments to one moving place, so a compact loop cannot leave the humble body behind;
 * Awtsmoos.com keeps the guard's own scale and meshes while canonical position and orientation flow through one root intertwined.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	preservePlayerVisualGuard,
	syncPlayerVisualGuard
} from '../../app/PlayerVisualGuard.js';

function runtimeFixture() {
	const model = new Group();
	const guard = new Group();
	guard.scale.set(1.52, 1.52, 1.52);
	model.position.set(4, 2, -3);
	model.quaternion.set(0, 0.5, 0, 0.8660254);
	return { guard, runtime: { model } };
}

test('B"H guard shares canonical transform objects while preserving device-safe scale', () => {
	const { guard, runtime } = runtimeFixture();
	guard.visible = false;
	const preserved = preservePlayerVisualGuard(runtime, guard);
	assert.equal(preserved, guard);
	assert.equal(runtime.playerVisualGuard, guard);
	assert.equal(guard.visible, true);
	assert.equal(guard.userData.awtsmoosPlayerVisualGuard, true);
	assert.equal(guard.position, runtime.model.position);
	assert.equal(guard.quaternion, runtime.model.quaternion);
	assert.deepEqual(guard.position.toArray(), [4, 2, -3]);
	assert.deepEqual(guard.scale.toArray(), [1.52, 1.52, 1.52]);
});

test('B"H canonical movement reaches the guard without any frame-task sync call', () => {
	const { guard, runtime } = runtimeFixture();
	preservePlayerVisualGuard(runtime, guard);
	runtime.model.position.set(-5, 1.25, 8);
	runtime.model.quaternion.set(0, -0.7071068, 0, 0.7071068);
	assert.deepEqual(guard.position.toArray(), [-5, 1.25, 8]);
	assert.ok(Math.abs(guard.quaternion.y + 0.7071068) < 1e-6);
	assert.ok(Math.abs(guard.quaternion.w - 0.7071068) < 1e-6);
	assert.equal(guard.position, runtime.model.position);
	assert.equal(guard.quaternion, runtime.model.quaternion);
	assert.deepEqual(guard.scale.toArray(), [1.52, 1.52, 1.52]);
});

test('B"H compatibility sync structurally rebinds a guard whose references were replaced', () => {
	const { guard, runtime } = runtimeFixture();
	preservePlayerVisualGuard(runtime, guard);
	guard.position = guard.position.clone();
	guard.quaternion = guard.quaternion.clone();
	assert.notEqual(guard.position, runtime.model.position);
	assert.notEqual(guard.quaternion, runtime.model.quaternion);
	const rebound = syncPlayerVisualGuard(runtime);
	assert.equal(rebound, guard);
	assert.equal(guard.position, runtime.model.position);
	assert.equal(guard.quaternion, runtime.model.quaternion);
});
