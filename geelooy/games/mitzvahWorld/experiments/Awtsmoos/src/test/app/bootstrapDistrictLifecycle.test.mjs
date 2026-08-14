// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictLifecycle.test.mjs
 * @description Proves retirement is irreversible and removes visible and physical fallback districts without residue.
 * The Awtsmoos preserves the completed past while changing the active present; Awtsmoos.com marks retirement first,
 * then releases collision and scene form exactly once so no asynchronous bootstrap work can claim authority afterward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { attachBootstrapDistrictLifecycle } from '../../app/BootstrapDistrictLifecycle.js';

test('district lifecycle marks permanent retirement before complete disposal', () => {
	const runtime = runtimeFixture();
	const state = attachBootstrapDistrictLifecycle(runtime, stateFixture(runtime.scene));
	assert.equal(state.retired, false);
	const first = state.releaseDistrict('east');
	assert.equal(first.released, true);
	assert.equal(first.trianglesRemoved, 48);
	assert.equal(state.active, 1);
	assert.equal(state.status, 'partial');
	const disposal = state.dispose();
	assert.equal(disposal.retired, true);
	assert.equal(disposal.districtsReleased, 1);
	assert.equal(disposal.trianglesRemoved, 48);
	assert.equal(state.retired, true);
	assert.equal(state.status, 'disposed');
	assert.equal(state.active, 0);
	assert.equal(state.colliders, 0);
	assert.equal(state.triangles, 0);
	assert.equal(state.released, 2);
	assert.equal(runtime.scene.children.length, 0);
	assert.equal(runtime.sceneLod.refreshCalls, 2);
	const repeated = state.dispose();
	assert.equal(repeated.districtsReleased, 0);
	assert.equal(repeated.trianglesRemoved, 0);
	assert.equal(state.status, 'disposed');
});

function runtimeFixture() {
	return {
		scene: new Scene(),
		sceneLod: {
			refreshCalls: 0,
			refresh() { this.refreshCalls += 1; }
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
		retired: false,
		status: 'ready',
		triangles: 96
	};
}

function releaseReceipt(triangles) {
	let released = false;
	return {
		release() {
			if (released) return 0;
			released = true;
			return triangles;
		}
	};
}
