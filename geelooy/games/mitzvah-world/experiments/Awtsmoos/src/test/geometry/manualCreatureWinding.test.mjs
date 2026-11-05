// B"H
// Boruch Hashem
// Blessed is He

/** @file manualCreatureWinding.test.mjs @description Keeps lofted animal skins outward-facing. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ManualGeometryBuilder } from '../../world/creatures/ManualGeometryBuilder.js';

test('every loft side triangle faces away from its longitudinal axis', () => {
	const segments = 10;
	const geometry = new ManualGeometryBuilder().addLoft([
		{ radiusY: 1, radiusZ: 0.8, x: 0, y: 0, z: 0 },
		{ radiusY: 1, radiusZ: 0.8, x: 3, y: 0, z: 0 }
	], segments).build();
	for (let offset = 0; offset < segments * 2 * 3; offset += 3) {
		const face = geometry.indices.slice(offset, offset + 3);
		const points = face.map(index => geometry.vertices[index]);
		const normal = triangleNormal(points);
		const center = points.reduce((sum, point) => [
			sum[0] + point[0] / 3,
			sum[1] + point[1] / 3,
			sum[2] + point[2] / 3
		], [0, 0, 0]);
		assert.ok(normal[1] * center[1] + normal[2] * center[2] > 0);
	}
});

function triangleNormal([a, b, c]) {
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	return [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
}
