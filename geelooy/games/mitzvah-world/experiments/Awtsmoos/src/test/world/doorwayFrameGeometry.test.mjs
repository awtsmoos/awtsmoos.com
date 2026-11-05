// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file doorwayFrameGeometry.test.mjs
 * @description Proves rectangular doorway geometry is exact, transformed, and free of CSG.
 * The Awtsmoos opens a passage through ordered vessels; Awtsmoos.com verifies two piers and
 * one lintel preserve the inhabited village while first movement no longer waits for booleans.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createPrimitiveGeometryData,
	isProceduralShape
} from '../../world/primitives/PrimitiveGeometryFactory.js';

test('doorway factory creates three exact boxes without invoking CSG', () => {
	const originalLog = console.log;
	const logged = [];
	console.log = (...values) => logged.push(values.map(String).join(' '));
	let geometry;
	try {
		geometry = createPrimitiveGeometryData({
			shape: 'doorway',
			size: { x: 10, y: 10, z: 1 },
			door: { x: 4, y: 6, z: 3 },
			position: { x: 10, y: 2, z: -3 }
		});
	} finally {
		console.log = originalLog;
	}
	assert.equal(isProceduralShape('doorway'), true, 'public classification remains compatible');
	assert.equal(geometry.vertices.length, 72, 'three boxes should contribute 24 vertices each');
	assert.equal(geometry.indices.length, 108, 'three boxes should contribute 36 indices each');
	assert.equal(geometry.uvs.length, 144, 'three boxes should preserve face UVs');
	assert.deepEqual(bounds(geometry.vertices.slice(0, 24)), {
		minimum: { x: 5, y: -3, z: -3.5 },
		maximum: { x: 8, y: 7, z: -2.5 }
	});
	assert.deepEqual(bounds(geometry.vertices.slice(24, 48)), {
		minimum: { x: 12, y: -3, z: -3.5 },
		maximum: { x: 15, y: 7, z: -2.5 }
	});
	assert.deepEqual(bounds(geometry.vertices.slice(48)), {
		minimum: { x: 8, y: 3, z: -3.5 },
		maximum: { x: 12, y: 7, z: -2.5 }
	});
	assert.equal(logged.some(message => /CSG|Subtract/i.test(message)), false);
});

function bounds(vertices) {
	const minimum = { x: Infinity, y: Infinity, z: Infinity };
	const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
	for (const vertex of vertices) {
		minimum.x = Math.min(minimum.x, vertex.x);
		minimum.y = Math.min(minimum.y, vertex.y);
		minimum.z = Math.min(minimum.z, vertex.z);
		maximum.x = Math.max(maximum.x, vertex.x);
		maximum.y = Math.max(maximum.y, vertex.y);
		maximum.z = Math.max(maximum.z, vertex.z);
	}
	return { minimum, maximum };
}
