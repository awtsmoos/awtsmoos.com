// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerVisualGuard.test.mjs
 * @description Proves the rigid WebGL Chossid survives richer promotion and follows canonical motion without surrendering its safe geometry scale.
 * The Awtsmoos lets the richer garment dance while the first visible silhouette remains a faithful underlay;
 * Awtsmoos.com makes one moving human form resilient to device-specific skinned shader darkness or disappearance.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

test('B"H visual guard stays visible, marked, and preserves its own scale', () => {
	const { guard, runtime } = runtimeFixture();
	guard.visible = false;
	const preserved = preservePlayerVisualGuard(runtime, guard);
	assert.equal(preserved, guard);
	assert.equal(runtime.playerVisualGuard, guard);
	assert.equal(guard.visible, true);
	assert.equal(guard.userData.awtsmoosPlayerVisualGuard, true);
	assert.deepEqual(guard.position.toArray(), [4, 2, -3]);
	assert.deepEqual(guard.scale.toArray(), [1.52, 1.52, 1.52]);
});

test('B"H visual guard mirrors canonical root motion and orientation', () => {
	const { guard, runtime } = runtimeFixture();
	preservePlayerVisualGuard(runtime, guard);
	runtime.model.position.set(-5, 1.25, 8);
	runtime.model.quaternion.set(0, -0.7071068, 0, 0.7071068);
	syncPlayerVisualGuard(runtime);
	assert.deepEqual(guard.position.toArray(), [-5, 1.25, 8]);
	assert.ok(Math.abs(guard.quaternion.y + 0.7071068) < 1e-6);
	assert.ok(Math.abs(guard.quaternion.w - 0.7071068) < 1e-6);
	assert.deepEqual(guard.scale.toArray(), [1.52, 1.52, 1.52]);
});

test('B"H frame task synchronizes guard immediately before WebGL render', async () => {
	const source = await readFile(new URL('../../app/EretzRuntimeFrameTasks.js', import.meta.url), 'utf8');
	const syncIndex = source.indexOf('syncPlayerVisualGuard(runtime)');
	const renderIndex = source.indexOf('runtime.renderer.render(runtime.scene, runtime.camera)');
	assert.ok(syncIndex >= 0);
	assert.ok(renderIndex > syncIndex);
});
