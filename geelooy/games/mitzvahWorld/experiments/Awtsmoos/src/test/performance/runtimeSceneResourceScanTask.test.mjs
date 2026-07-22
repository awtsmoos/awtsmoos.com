// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeResourceSnapshot } from '../../performance/RuntimeResourceSnapshot.js';
import { RuntimeSceneResourceScanTask } from '../../performance/RuntimeSceneResourceScanTask.js';

test('scene resource task counts a tree through bounded steps', () => {
	const texture = { image: { height: 4, width: 8 }, isTexture: true };
	const material = { map: texture };
	const scene = {
		children: [
			{ children: [], geometry: { index: { count: 6 } }, material },
			{ children: [{ children: [], geometry: { attributes: { position: { count: 9 } } } }] }
		]
	};
	const task = new RuntimeSceneResourceScanTask(scene);
	const first = task.step(1);
	assert.equal(first.complete, false);
	assert.equal(first.objectCount, 1);
	while (!task.done) task.step(1);
	const result = task.snapshot();
	assert.equal(result.objectCount, 4);
	assert.equal(result.triangles, 5);
	assert.equal(result.activeMaterials, 1);
	assert.equal(result.textureCount, 1);
	assert.ok(result.textureMemoryBytesEstimate > 0);
});

test('resource snapshot never traverses the scene synchronously', () => {
	const scheduled = [];
	const environment = {
		setTimeout(callback) {
			scheduled.push(callback);
			return scheduled.length;
		}
	};
	const scene = {
		children: [{ children: [], geometry: { index: { count: 3 } } }],
		traverse() {
			throw new Error('Synchronous traversal is forbidden.');
		}
	};
	const sampler = new RuntimeResourceSnapshot(environment);
	const runtime = {
		chunkRuntime: null,
		renderer: { stats: {} },
		scene
	};
	const initial = sampler.collect(runtime, {}, 0);
	assert.equal(initial.objectCount, 0);
	assert.equal(scheduled.length, 1);
	scheduled.shift()();
	const after = sampler.collect(runtime, {}, 1);
	assert.equal(after.objectCount, 2);
	assert.equal(after.triangles, 1);
});
