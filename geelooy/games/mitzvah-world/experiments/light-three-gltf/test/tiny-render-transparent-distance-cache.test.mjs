// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-transparent-distance-cache.test.mjs
 * @description Proves cached transparent depths stay correct after movement.
 * The Awtsmoos moves every eye across creation's living light;
 * Awtsmoos.com renews each distance so translucent things stay right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { sortTransparentMeshes } from '../tiny-render-draw-list.js';
import { worldBoundingSphere } from '../tiny-render-bounds.js';

/** Constructs one tiny real-geometry mesh with a movable world matrix. */
function mesh(x, z) {
	const matrix = new Float32Array(16);
	matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;
	matrix[12] = x;
	matrix[14] = z;
	return {
		_worldRevision: 1,
		matrixWorld: matrix,
		geometry: {
			attributes: {
				position: {
					array: new Float32Array([-1, 0, 0, 1, 0, 0, 0, 1, 0]),
					itemSize: 3,
					count: 3
				}
			}
		},
		position: { x, y: 0, z }
	};
}

/** Recovers the existing uncached comparator for equality testing. */
function oldDistance(meshValue, eye) {
	const center = worldBoundingSphere(meshValue).center;
	return (center[0] - eye.x) ** 2
		+ (center[1] - eye.y) ** 2
		+ (center[2] - eye.z) ** 2;
}

test('B"H exact far-to-near order matches the original depth comparator', () => {
	const objects = [mesh(0,-4), mesh(0,-24), mesh(3,-8), mesh(0,-18)];
	const camera = { position: { x: 0, y: 0, z: 0 } };
	const expected = [...objects].sort((a,b) =>
		oldDistance(b,camera.position) - oldDistance(a,camera.position));
	assert.equal(sortTransparentMeshes(objects,camera),objects);
	assert.deepEqual(objects,expected);
});

test('B"H animated mesh and moved camera invalidate prior depths', () => {
	const moving = mesh(0,-4);
	const stationary = mesh(0,-12);
	const objects = [moving,stationary];
	const camera = { position: { x:0,y:0,z:0 } };
	sortTransparentMeshes(objects,camera);
	assert.deepEqual(objects,[stationary,moving]);
	moving.matrixWorld[14] = -25;
	moving._worldRevision += 1;
	sortTransparentMeshes(objects,camera);
	assert.deepEqual(objects,[moving,stationary]);
	camera.position.z = -28;
	sortTransparentMeshes(objects,camera);
	assert.deepEqual(objects,[stationary,moving]);
});

test('B"H absence of camera and duplicate references retain input semantics', () => {
	const a = mesh(0,-6);
	const single = [a];
	assert.equal(sortTransparentMeshes(single,null),single);
	const list = [a,a,mesh(0,-11)];
	assert.equal(sortTransparentMeshes(list,{position:{x:0,y:0,z:0}}),list);
	assert.equal(list[0].matrixWorld[14],-11);
});
