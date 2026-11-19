// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalPlayerInstall.test.js
 * @description Proves the player install shrinks the head inside the clips
 * the player actually animates, and retries the tree collision the
 * first-control registration can miss. The Awtsmoos lets the traveler keep
 * his true proportions; Awtsmoos.com never lets the animation restore the
 * big head, and never leaves the ring trees walk-through.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installCanonicalPlayer } from './MinimalMeadowCanonicalPlayerInstall.js';

const IDENTITY = new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);

function vec3(x = 0, y = 0, z = 0) {
	return {
		set(nx, ny, nz) {
			this.x = nx;
			this.y = ny;
			this.z = nz;
			return this;
		},
		x,
		y,
		z
	};
}

function quat() {
	return {
		set(x, y, z, w) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		},
		w: 1,
		x: 0,
		y: 0,
		z: 0
	};
}

function fakeHeadNode() {
	return {
		name: 'mixamorig:Head',
		position: vec3(),
		quaternion: quat(),
		scale: vec3(1, 1, 1)
	};
}

function fakeClip(headNode) {
	return {
		channels: [{
			input: new Float32Array([0, 2]),
			interpolation: 'LINEAR',
			node: headNode,
			output: new Float32Array([1, 1, 1, 1, 1, 1]),
			path: 'scale',
			size: 3
		}],
		duration: 2,
		name: 'stand_Armature'
	};
}

function fakeTree() {
	const bark = {
		geometry: {
			attributes: {
				position: {
					array: new Float32Array([
						29.8, 0, -48.2, 30.2, 0, -48.2, 30.2, 4, -48.2, 29.8, 4, -48.2,
						29.8, 0, -47.8, 30.2, 0, -47.8, 30.2, 4, -47.8, 29.8, 4, -47.8
					])
				}
			}
		},
		isMesh: true,
		matrixWorld: IDENTITY,
		name: 'MeadowTreeBark'
	};
	const leaves = {
		geometry: { attributes: { position: { array: new Float32Array([30, 4, -48]) } } },
		isMesh: true,
		matrixWorld: IDENTITY,
		name: 'MeadowTreeLeaves'
	};
	return {
		name: 'MeadowTree_olive',
		position: { x: 30, y: 0, z: -48 },
		traverse(fn) {
			fn(bark);
			fn(leaves);
		},
		userData: { awtsmoosMeadowTree: true }
	};
}

function fakeOctree() {
	return {
		items: [],
		insert(collider) {
			this.items.push(collider);
		},
		remove(collider) {
			const at = this.items.indexOf(collider);
			if (at < 0) return false;
			this.items.splice(at, 1);
			return true;
		}
	};
}

function fakeRuntime({ withTree = true } = {}) {
	const children = withTree ? [fakeTree()] : [];
	const scene = {
		add(object) {
			children.push(object);
		},
		traverse(fn) {
			for (const child of [...children]) {
				fn(child);
				child.traverse?.(fn);
			}
		},
		updateWorldMatrix() {}
	};
	return {
		mainOctree: fakeOctree(),
		scene,
		state: { facing: 0, x: 0, y: 0, z: 0 }
	};
}

test('the install shrinks the head inside the clips the player animates', () => {
	const headNode = fakeHeadNode();
	const clip = fakeClip(headNode);
	const runtime = fakeRuntime({ withTree: false });
	const model = { name: 'Awtsmoos_grounded_canonical_chossid', userData: {} };
	const gltf = { animations: [clip], scene: model };
	const installed = installCanonicalPlayer(runtime, null, gltf, {
		feet: 0,
		model,
		visiblePlayer: model
	}, {
		// B"H: stub the retry timer — there are no trees here, so the real
		// one would arm a five-minute window and stall the test run.
		scheduleTreeCollisionRetry() {}
	});
	assert.equal(installed.animation.defaultClip, 'stand_Armature');
	assert.ok(clip.channels[0].output.every(value => Math.abs(value - 0.88) < 1e-6));
	assert.ok([headNode.scale.x, headNode.scale.y, headNode.scale.z]
		.every(value => Math.abs(value - 0.88) < 1e-6));
	assert.equal(runtime.model, model);
	assert.equal(runtime.playerGltf.animations, gltf.animations);
});

test('the install retries tree collision when first control missed it', () => {
	const headNode = fakeHeadNode();
	const runtime = fakeRuntime({ withTree: true });
	const model = { name: 'Awtsmoos_grounded_canonical_chossid', userData: {} };
	installCanonicalPlayer(runtime, null, { animations: [fakeClip(headNode)], scene: model }, {
		feet: 0,
		model,
		visiblePlayer: model
	});
	assert.ok(runtime.bootstrapTreeCollisionReceipt);
	assert.equal(runtime.bootstrapTreeCollisionReceipt.triangles, 12);
	assert.equal(runtime.mainOctree.items.length, 12);
	// A second install adds nothing — the retry is idempotent per tree.
	installCanonicalPlayer(runtime, null, { animations: [fakeClip(headNode)], scene: model }, {
		feet: 0,
		model,
		visiblePlayer: model
	});
	assert.equal(runtime.mainOctree.items.length, 12);
});

test('the install never breaks the player when there are no trees', () => {
	const headNode = fakeHeadNode();
	const runtime = fakeRuntime({ withTree: false });
	delete runtime.mainOctree;
	const model = { name: 'Awtsmoos_grounded_canonical_chossid', userData: {} };
	let scheduled = 0;
	const installed = installCanonicalPlayer(runtime, null, { animations: [fakeClip(headNode)], scene: model }, {
		feet: 0,
		model,
		visiblePlayer: model
	}, {
		// B"H: stub the retry timer — the real one would arm a five-minute
		// window in the test runner and stall the run.
		scheduleTreeCollisionRetry() {
			scheduled += 1;
		}
	});
	assert.equal(installed.animation.defaultClip, 'stand_Armature');
	assert.equal(scheduled, 1);
	assert.equal(runtime.bootstrapTreeCollisionReceipt, undefined);
});

test('the install schedules tree retries when the trunks have not landed yet', () => {
	const headNode = fakeHeadNode();
	const runtime = fakeRuntime({ withTree: false });
	const model = { name: 'Awtsmoos_grounded_canonical_chossid', userData: {} };
	let scheduled = 0;
	let scheduledRuntime = null;
	installCanonicalPlayer(runtime, null, { animations: [fakeClip(headNode)], scene: model }, {
		feet: 0,
		model,
		visiblePlayer: model
	}, {
		scheduleTreeCollisionRetry(scheduledRuntimeValue) {
			scheduled += 1;
			scheduledRuntime = scheduledRuntimeValue;
		}
	});
	assert.equal(scheduled, 1);
	assert.equal(scheduledRuntime, runtime);
	assert.equal(runtime.bootstrapTreeCollisionReceipt, undefined);
});
