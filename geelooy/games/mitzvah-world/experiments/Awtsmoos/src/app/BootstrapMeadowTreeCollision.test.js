// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeadowTreeCollision.test.js
 * @description Proves every visible meadow tree trunk becomes one solid
 * box the collision mover can stop on, exactly once, and releases cleanly.
 * The Awtsmoos lets the traveler lean on a tree instead of walking through
 * it; Awtsmoos.com keeps the canopy open above, so only the trunk stands
 * in the way.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { registerBootstrapMeadowTreeCollision } from './BootstrapMeadowTreeCollision.js';

const IDENTITY = new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);

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

function fakeTree(id, position = [30, 0, -48]) {
	const bark = {
		isMesh: true,
		name: `${id}-connected-bark`,
		geometry: {
			attributes: {
				position: {
					array: new Float32Array([
						-0.2, 0, -0.2, 0.2, 0, -0.2, 0.2, 4, -0.2, -0.2, 4, -0.2,
						-0.2, 0, 0.2, 0.2, 0, 0.2, 0.2, 4, 0.2, -0.2, 4, 0.2
					])
				}
			}
		},
		matrixWorld: IDENTITY
	};
	const canopy = {
		isMesh: true,
		name: 'MeadowTreeLeaves',
		geometry: { attributes: { position: { array: new Float32Array([0, 4, 0]) } } },
		matrixWorld: IDENTITY
	};
	const group = {
		name: id,
		position: { x: position[0], y: position[1], z: position[2] },
		userData: { AwtsmoosTree: { groveId: `${id}-grove` } },
		traverse(fn) {
			fn(bark);
			fn(canopy);
		}
	};
	// The trunk box is built from the bark mesh in world space; shift the
	// bark positions by the group position to stand in for matrixWorld.
	const base = bark.geometry.attributes.position.array;
	for (let index = 0; index < base.length; index += 3) {
		base[index] += position[0];
		base[index + 2] += position[2];
	}
	return { bark, canopy, group };
}

function fakeRuntime(trees) {
	const scene = {
		traverse(fn) {
			for (const tree of trees) fn(tree.group);
		},
		updateWorldMatrix() {}
	};
	return { mainOctree: fakeOctree(), scene };
}

test('one trunk becomes one solid twelve-triangle box', () => {
	const { group } = fakeTree('tree-1');
	const runtime = fakeRuntime([{ group }]);
	const receipt = registerBootstrapMeadowTreeCollision(runtime);
	assert.ok(receipt);
	assert.equal(receipt.triangles, 12);
	assert.deepEqual([...receipt.trees], ['tree-1']);
	assert.equal(runtime.mainOctree.items.length, 12);
	assert.ok(runtime.mainOctree.items.every(collider => collider.solid === true));
	assert.ok(runtime.mainOctree.items.every(collider => collider.kind.startsWith('bootstrap-tree:tree-1:trunk:face-')));
	const union = runtime.mainOctree.items.reduce((bounds, collider) => ({
		minX: Math.min(bounds.minX, collider.aabb.min.x),
		minY: Math.min(bounds.minY, collider.aabb.min.y),
		maxX: Math.max(bounds.maxX, collider.aabb.max.x),
		maxY: Math.max(bounds.maxY, collider.aabb.max.y)
	}), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
	assert.ok(union.minX < 30 && union.maxX > 30);
	assert.ok(union.minY <= 0 && union.maxY >= 4);
});

test('a second registration adds nothing and returns the same receipt', () => {
	const { group } = fakeTree('tree-1');
	const runtime = fakeRuntime([{ group }]);
	const first = registerBootstrapMeadowTreeCollision(runtime);
	const second = registerBootstrapMeadowTreeCollision(runtime);
	assert.equal(second, first);
	assert.equal(runtime.mainOctree.items.length, 12);
});

test('release removes every trunk triangle and frees the tree id', () => {
	const { group } = fakeTree('tree-1');
	const runtime = fakeRuntime([{ group }]);
	const receipt = registerBootstrapMeadowTreeCollision(runtime);
	assert.equal(receipt.release(), 12);
	assert.equal(receipt.released, true);
	assert.equal(runtime.mainOctree.items.length, 0);
	assert.equal(receipt.release(), 0);
	const again = registerBootstrapMeadowTreeCollision(runtime);
	assert.ok(again);
	assert.notEqual(again, receipt);
});

test('no collision authority or no trees means no receipt and no crash', () => {
	assert.equal(registerBootstrapMeadowTreeCollision({ scene: { traverse() {} } }), null);
	const empty = fakeRuntime([]);
	assert.equal(registerBootstrapMeadowTreeCollision(empty), null);
});
