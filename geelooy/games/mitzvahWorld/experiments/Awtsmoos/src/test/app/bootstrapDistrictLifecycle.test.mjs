// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictLifecycle.test.mjs
 * @description Proves one district and all districts depart without visual or collision residue.
 * The Awtsmoos preserves the completed past while changing the active present;
 * Awtsmoos.com verifies idempotent release, counters, statuses, scene removal, and LOD refresh.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { attachBootstrapDistrictLifecycle } from '../../app/BootstrapDistrictLifecycle.js';

test('district lifecycle releases one, ignores unknown, then disposes all', () => {
	const runtime = runtimeFixture();
	const state = attachBootstrapDistrictLifecycle(runtime, stateFixture(runtime.scene));
	const first = state.releaseDistrict('east');
	assert.deepEqual(first, {
		districtId: 'east',
		released: true,
		trianglesRemoved: 48
	});
	assert.equal(runtime.scene.children.length, 1);
	assert.equal(state.active, 1);
	assert.equal(state.completed, 2);
	assert.equal(state.colliders, 48);
	assert.equal(state.meshes, 4);
	assert.equal(state.released, 1);
	assert.equal(state.status, 'partial');
	assert.equal(runtime.sceneLod.refreshCalls, 1);
	assert.equal(state.releaseDistrict('missing').released, false);
	assert.equal(runtime.sceneLod.refreshCalls, 1);
	const disposal = state.dispose();
	assert.equal(disposal.districtsReleased, 1);
	assert.equal(disposal.trianglesRemoved, 48);
	assert.equal(runtime.scene.children.length, 0);
	assert.equal(state.active, 0);
	assert.equal(state.colliders, 0);
	assert.equal(state.triangles, 0);
	assert.equal(state.released, 2);
	assert.equal(state.status, 'disposed');
	assert.equal(runtime.sceneLod.refreshCalls, 2);
});

function runtimeFixture() {
	return {
		scene: new Scene(),
		sceneLod: {
			refreshCalls: 0,
			refresh() {
				this.refreshCalls += 1;
			}
		}
	};
}

function stateFixture(scene) {
	const districts = {};
	for (const id of ['east', 'west']) {
		const group = new Group();
		group.userData.meshCount = 4;
		scene.add(group);
		districts[id] = { collision: releaseReceipt(48), group };
	}
	return {
		active: 2,
		colliders: 96,
		completed: 2,
		districts,
		loaded: ['east', 'west'],
		meshes: 8,
		released: 0,
		status: 'ready',
		triangles: 96
	};
}

function releaseReceipt(triangles) {
	let released = false;
	return {
		release() {
			if (released) {
				return 0;
			}
			released = true;
			return triangles;
		}
	};
}
