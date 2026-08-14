// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictStreaming.test.mjs
 * @description Proves the honest eight-part fallback streams completely yet cannot resurrect after canonical retirement.
 * The Awtsmoos permits temporary architecture before the full valley; Awtsmoos.com registers every district before
 * asynchronous garments, then proves disposal during hydration releases that district and forbids every later one.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapCollisionWorld } from '../../app/BootstrapCollisionWorld.js';
import { streamBootstrapDistricts } from '../../app/BootstrapDistrictStreamer.js';

const environment = { performance: { now: () => 100 } };
const immediate = {
	hydrateNature: async () => ({ loaded: 0 }),
	hydrateTextures: async () => ({ loaded: 0, mapImagesBound: 0 }),
	waitForIdle: async () => {}
};

test('current bootstrap publishes 96 collision faces and disposes cleanly', async () => {
	const runtime = runtimeFixture();
	const state = await streamBootstrapDistricts(runtime, environment, immediate);
	assert.equal(state.status, 'ready');
	assert.equal(state.retired, false);
	assert.equal(state.active, 3);
	assert.equal(state.completed, 3);
	assert.equal(state.meshes, 8);
	assert.equal(state.colliders, 96);
	assert.equal(state.triangles, 96);
	assert.equal(runtime.scene.children.length, 3);
	assert.equal(runtime.mainOctree.diagnostics().spatialIndex.indexedColliders, 96);
	const disposal = state.dispose();
	assert.equal(disposal.districtsReleased, 3);
	assert.equal(disposal.trianglesRemoved, 96);
	assert.equal(state.retired, true);
	assert.equal(state.status, 'disposed');
	assert.equal(runtime.scene.children.length, 0);
	assert.equal(runtime.mainOctree.diagnostics().triangles, 0);
});

test('retirement during hydration removes the mounted district and stops future districts', async () => {
	const runtime = runtimeFixture();
	let finishTexture;
	const textureGate = new Promise(resolve => { finishTexture = resolve; });
	const streaming = streamBootstrapDistricts(runtime, environment, {
		hydrateNature: async () => ({ loaded: 0 }),
		hydrateTextures: async () => textureGate,
		waitForIdle: async () => {}
	});
	await waitUntil(() => runtime.districtStreaming?.active === 1);
	const state = runtime.districtStreaming;
	const disposal = state.dispose();
	assert.equal(disposal.districtsReleased, 1);
	assert.equal(runtime.scene.children.length, 0);
	finishTexture({ loaded: 0, mapImagesBound: 0 });
	await streaming;
	assert.equal(state.retired, true);
	assert.equal(state.status, 'disposed');
	assert.equal(state.active, 0);
	assert.equal(state.loaded.length, 0);
	assert.equal(state.completed, 0);
	assert.equal(runtime.scene.children.length, 0);
	assert.equal(runtime.mainOctree.diagnostics().triangles, 0);
});

function runtimeFixture() {
	return {
		mainOctree: new BootstrapCollisionWorld(),
		scene: new Scene(),
		sceneLod: { refresh() {} }
	};
}

async function waitUntil(predicate) {
	for (let attempt = 0; attempt < 20; attempt += 1) {
		if (predicate()) return;
		await Promise.resolve();
	}
	throw new Error('bootstrap stream did not reach expected state');
}
