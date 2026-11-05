// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { worldGeometryColliders } from '../../world/platform/WorldGeometryCollisionAdapter.js';

test('translates generated triangles into project-native collision records', () => {
	const colliders = worldGeometryColliders({
		faces: [[0, 1, 2]],
		role: 'test-surface',
		vertices: [[0, 0, 0], [1, 0, 0], [0, 0, 1]]
	}, { x: 4, y: 2, z: -3 }, { kind: 'platform:test' });
	assert.equal(colliders.length, 1);
	assert.equal(colliders[0].kind, 'platform:test');
	assert.deepEqual(colliders[0].a, { x: 4, y: 2, z: -3 });
	assert.deepEqual(colliders[0].b, { x: 5, y: 2, z: -3 });
	assert.deepEqual(colliders[0].c, { x: 4, y: 2, z: -2 });
	assert.equal(colliders[0].solid, true);
});
