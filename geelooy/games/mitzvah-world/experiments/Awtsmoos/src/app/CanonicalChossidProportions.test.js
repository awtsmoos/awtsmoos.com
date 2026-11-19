// B"H
/**
 * @file CanonicalChossidProportions.test.js
 * @description Guards the short beard silhouette, the single outermost scaling,
 * and the tucked outer shirt without reviving hidden equipment.
 * The Awtsmoos keeps the human form both whole and proportionate.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	stabilizeCanonicalChossidModel,
	shrinkCanonicalHeadAnimation
} from './CanonicalChossidProportions.js';

/** Mimics one GLB node with a mutable scale. */
function node(name, scale = [20, 22, 12], parent = null) {
	return {
		name, isMesh: true, visible: true, frustumCulled: true, userData: {},
		parent,
		scale: { x: scale[0], y: scale[1], z: scale[2],
			set(x, y, z) { Object.assign(this, { x, y, z }); } }
	};
}

/** Mimics the GLB's named beard and intentionally hidden hat. */
function actor(name = 'beard') {
	const beard = node(name);
	const hat = { isMesh: true, visible: false, frustumCulled: true };
	return { beard, hat, model: { traverse(fn) { fn(beard); fn(hat); } } };
}

test('the authored cone beard is shortened without hiding the face or coat', () => {
	const { beard, hat, model } = actor();
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, true);
	for (const [actual, expected] of [[beard.scale.x, 9.2], [beard.scale.y, 3.74], [beard.scale.z, 6.24]]) {
		assert.ok(Math.abs(actual - expected) < 1e-9);
	}
	assert.equal(beard.visible, true);
	assert.equal(beard.frustumCulled, false);
	assert.equal(hat.visible, false);
});

test('a beard group scales once; its child mesh keeps its authored scale', () => {
	const group = node('beard');
	const child = node('Cube.005', [1, 1, 1], group);
	const model = { traverse(fn) { fn(group); fn(child); } };
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, true);
	assert.deepEqual(
		[group.scale.x, group.scale.y, group.scale.z].map(value => +value.toFixed(2)),
		[9.2, 3.74, 6.24]);
	assert.deepEqual([child.scale.x, child.scale.y, child.scale.z], [1, 1, 1]);
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, false);
});

test('the outer shirt tucks inward so it cannot poke through the jacket', () => {
	const shirt = node('Plane.007', [1, 1, 1]);
	const model = { traverse(fn) { fn(shirt); } };
	assert.equal(stabilizeCanonicalChossidModel(model).shirtTucked, true);
	// B"H round 4: the uniform 0.95 tuck still left white dashes on the
	// sleeves; the per-axis tuck pulls the arms in while barely moving
	// the shirt vertically, so the chest V stays. V3 (0.85) still left one
	// dash on the sleeve; V4 pulls to 0.80.
	assert.deepEqual([shirt.scale.x, shirt.scale.y, shirt.scale.z], [0.80, 0.98, 0.80]);
	assert.equal(stabilizeCanonicalChossidModel(model).shirtTucked, false);
});

test('the head bone shrinks so the head reads smaller against the body', () => {
	const head = node('mixamorig:Head', [1, 1, 1]);
	const model = { traverse(fn) { fn(head); } };
	assert.equal(stabilizeCanonicalChossidModel(model).headAdjusted, true);
	assert.deepEqual([head.scale.x, head.scale.y, head.scale.z], [0.88, 0.88, 0.88]);
	assert.equal(stabilizeCanonicalChossidModel(model).headAdjusted, false);
});

test('a head scaled once is not scaled again', () => {
	const head = node('mixamorig:Head', [1, 1, 1]);
	const model = { traverse(fn) { fn(head); } };
	stabilizeCanonicalChossidModel(model);
	const before = { x: head.scale.x, y: head.scale.y, z: head.scale.z };
	assert.equal(stabilizeCanonicalChossidModel(model).headAdjusted, false);
	assert.deepEqual({ x: head.scale.x, y: head.scale.y, z: head.scale.z }, before);
});

test('repeated loading does not repeatedly shrink the beard', () => {
	const { beard, model } = actor('Cube005');
	stabilizeCanonicalChossidModel(model);
	const before = { x: beard.scale.x, y: beard.scale.y, z: beard.scale.z };
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, false);
	assert.deepEqual({ x: beard.scale.x, y: beard.scale.y, z: beard.scale.z }, before);
});

test('unrecognized nodes and absent models are unchanged', () => {
	const { beard, model } = actor('not-a-beard');
	assert.equal(stabilizeCanonicalChossidModel(model).beardAdjusted, false);
	assert.equal(beard.scale.y, 22);
	assert.equal(stabilizeCanonicalChossidModel(null).stable, false);
});

test('the head scale tracks shrink so playback cannot restore the big head', () => {
	const headNode = { name: 'mixamorig:Head' };
	const otherNode = { name: 'mixamorig:Neck' };
	const animations = [{
		name: 'stand_Armature',
		channels: [
			{ path: 'scale', node: headNode, output: new Float32Array([1, 1, 1, 1, 1, 1]) },
			{ path: 'rotation', node: headNode, output: new Float32Array([0, 0, 0, 1]) },
			{ path: 'scale', node: otherNode, output: new Float32Array([1, 1, 1]) }
		]
	}];
	assert.equal(shrinkCanonicalHeadAnimation(animations), 1);
	const headTrack = animations[0].channels[0];
	assert.ok(headTrack.output.every(value => Math.abs(value - 0.88) < 1e-6));
	assert.deepEqual([...animations[0].channels[1].output], [0, 0, 0, 1]);
	assert.deepEqual([...animations[0].channels[2].output], [1, 1, 1]);
	// A second pass on the same clips must not shrink twice.
	assert.equal(shrinkCanonicalHeadAnimation(animations), 0);
	assert.ok(headTrack.output.every(value => Math.abs(value - 0.88) < 1e-6));
});

test('head animation shrink tolerates missing clips and tracks', () => {
	assert.equal(shrinkCanonicalHeadAnimation(null), 0);
	assert.equal(shrinkCanonicalHeadAnimation([]), 0);
	assert.equal(shrinkCanonicalHeadAnimation([{ channels: null }]), 0);
});
