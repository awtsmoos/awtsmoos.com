// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictStreaming.test.mjs
 * @description Proves districts publish and later release visible and physical form together.
 * The Awtsmoos reveals twelve measured forms and their appointed departure;
 * Awtsmoos.com verifies 144 indexed faces, three groups, one release, and complete disposal.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapCollisionWorld } from '../../app/BootstrapCollisionWorld.js';
import { BOOTSTRAP_DISTRICTS } from '../../app/BootstrapDistrictDefinitions.js';
import { streamBootstrapDistricts } from '../../app/BootstrapDistrictStreamer.js';

const immediateEnvironment = {
	performance: { now: () => 100 },
	requestIdleCallback(callback) {
		callback({ didTimeout: false, timeRemaining: () => 12 });
	}
};

const immediateServices = {
	hydrateNature: async () => ({ loaded: 0 }),
	hydrateTextures: async () => ({ loaded: 0, mapImagesBound: 0 })
};

test('streamer publishes 144 triangles and releases every district cleanly', async () => {
	const mainOctree = new BootstrapCollisionWorld();
	const runtime = {
		mainOctree,
		scene: new Scene(),
		sceneLod: {
			refreshCalls: 0,
			refresh() {
				this.refreshCalls += 1;
			}
		}
	};
	const state = await streamBootstrapDistricts(
		runtime,
		immediateEnvironment,
		immediateServices
	);
	assert.equal(state.status, 'ready');
	assert.equal(state.active, 3);
	assert.equal(state.completed, 3);
	assert.equal(state.meshes, 12);
	assert.equal(state.colliders, 144);
	assert.equal(state.triangles, 144);
	assert.equal(runtime.scene.children.length, 3);
	assert.equal(runtime.sceneLod.refreshCalls, 6);
	assert.equal(mainOctree.diagnostics().spatialIndex.indexedColliders, 144);
	assert.equal(typeof state.releaseDistrict, 'function');
	assert.equal(typeof state.dispose, 'function');
	const firstId = BOOTSTRAP_DISTRICTS[0].id;
	assert.equal(state.releaseDistrict(firstId).trianglesRemoved, 48);
	assert.equal(state.status, 'partial');
	assert.equal(state.active, 2);
	assert.equal(state.colliders, 96);
	assert.equal(state.meshes, 8);
	assert.equal(runtime.scene.children.length, 2);
	assert.equal(runtime.sceneLod.refreshCalls, 7);
	const disposal = state.dispose();
	assert.equal(disposal.districtsReleased, 2);
	assert.equal(disposal.trianglesRemoved, 96);
	assert.equal(state.status, 'disposed');
	assert.equal(state.active, 0);
	assert.equal(state.colliders, 0);
	assert.equal(state.triangles, 0);
	assert.equal(runtime.scene.children.length, 0);
	assert.equal(runtime.sceneLod.refreshCalls, 9);
	assert.equal(mainOctree.diagnostics().triangles, 0);
});
