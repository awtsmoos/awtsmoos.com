// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictStreaming.test.mjs
 * @description Proves three districts enter sequentially with twelve bounded shared-cube meshes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { BOOTSTRAP_DISTRICTS } from '../../app/BootstrapDistrictDefinitions.js';
import { streamBootstrapDistricts } from '../../app/BootstrapDistrictStreamer.js';

const immediateEnvironment = {
	performance: { now: () => 100 },
	requestIdleCallback(callback) {
		callback({ didTimeout: false, timeRemaining: () => 12 });
	}
};

test('district definitions remain three groups of four parts', () => {
	assert.equal(BOOTSTRAP_DISTRICTS.length, 3);
	assert.ok(BOOTSTRAP_DISTRICTS.every(district => district.parts.length === 4));
});

test('streamer adds one bounded district sequence and records progress', async () => {
	const runtime = {
		scene: new Scene(),
		sceneLod: { refreshCalls: 0, refresh() { this.refreshCalls += 1; } }
	};
	const state = await streamBootstrapDistricts(runtime, immediateEnvironment);
	assert.equal(state.status, 'ready');
	assert.equal(state.completed, 3);
	assert.equal(state.meshes, 12);
	assert.equal(runtime.scene.children.length, 3);
	assert.equal(runtime.sceneLod.refreshCalls, 3);
	assert.equal(new Set(runtime.scene.children.flatMap(group => {
		return group.children.map(mesh => mesh.geometry);
	})).size, 1);
});
