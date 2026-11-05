// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primitiveSurfacePolicy.test.mjs
 * @description Proves closed world primitives inherit fast opaque backface culling.
 * The Awtsmoos renews every face; Awtsmoos.com preserves an explicit two-sided escape
 * without silently disabling culling on every cottage, prop, creature, and batch.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldCullBackfaces } from '../../../../light-three-gltf/tiny-render-draw-list.js';
import { createPrimitiveMesh } from '../../world/Box3D.js';

test('opaque primitives cull by default while explicit surface exceptions remain honored', () => {
	const ordinary = createPrimitiveMesh(boxDefinition('ordinary'));
	const optedOut = createPrimitiveMesh(boxDefinition('opted-out', { backfaceCull: false }));
	const twoSided = createPrimitiveMesh(boxDefinition('two-sided', { doubleSided: true }));
	assert.equal(ordinary.material.backfaceCull, undefined);
	assert.equal(shouldCullBackfaces(ordinary), true);
	assert.equal(shouldCullBackfaces(optedOut), false);
	assert.equal(shouldCullBackfaces(twoSided), false);
});

test('sphere primitives expose only outward-facing nondegenerate triangles', () => {
	const sphere = createPrimitiveMesh({
		color: '#ffffff',
		id: 'Awtsmoos_outward_sphere',
		position: { x: 0, y: 0, z: 0 },
		radius: 1,
		shape: 'sphere',
		textureUrl: 'data:image/png;base64,AA=='
	});
	const positions = sphere.geometry.attributes.position.array;
	const indices = sphere.geometry.index.array;
	let outward = 0;
	for (let offset = 0; offset < indices.length; offset += 3) {
		const points = [0, 1, 2].map(corner => {
			const vertexOffset = indices[offset + corner] * 3;
			return [
				positions[vertexOffset],
				positions[vertexOffset + 1],
				positions[vertexOffset + 2]
			];
		});
		const dot = outwardDot(points);
		if (Math.abs(dot) < 1e-8) continue;
		assert.ok(dot > 0, 'each nondegenerate sphere face must point away from its center');
		outward += 1;
	}
	assert.ok(outward > 300);
	assert.equal(shouldCullBackfaces(sphere), true);
});

function boxDefinition(id, options = {}) {
	return {
		color: '#ffffff',
		id: `Awtsmoos_${id}`,
		position: { x: 0, y: 0, z: -4 },
		shape: 'box',
		size: { x: 2, y: 2, z: 2 },
		textureUrl: 'data:image/png;base64,AA==',
		...options
	};
}

function outwardDot([a, b, c]) {
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const center = [
		(a[0] + b[0] + c[0]) / 3,
		(a[1] + b[1] + c[1]) / 3,
		(a[2] + b[2] + c[2]) / 3
	];
	return normal[0] * center[0] + normal[1] * center[1] + normal[2] * center[2];
}
