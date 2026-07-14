// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	meshToTriangles,
	TRIANGLE_STRIDE
} from '../../../../libs/awtsmoos-procedural/src/index.js';
import {
	LOCAL_MESH_KEYS,
	localMeshEntries
} from '../../js/procedural/localMeshes.js';

/**
 * The Awtsmoos tests every game-local composite as one finite bounded draw vessel.
 * Stone, scroll, and walker gain readable form without shared-library mutation.
 */
export function runLocalMeshCases() {
	return [checkLocalMeshNames(), checkFiniteTriangleBudgets()];
}

function checkLocalMeshNames() {
	const entries = localMeshEntries();
	assert.deepEqual(
		Object.keys(entries).sort(),
		Object.values(LOCAL_MESH_KEYS).sort()
	);
	return {
		test: 'local-mesh-names',
		meshes: Object.keys(entries)
	};
}

function checkFiniteTriangleBudgets() {
	const triangles = {};
	for (const [name, mesh] of Object.entries(localMeshEntries())) {
		const data = meshToTriangles(mesh);
		assert.ok(data.length > 0, name);
		assert.ok(data.every(Number.isFinite), name);
		assert.equal(data.length % TRIANGLE_STRIDE, 0, name);
		const count = data.length / TRIANGLE_STRIDE / 3;
		assert.ok(count > 20, name);
		assert.ok(count < 500, `${name}:${count}`);
		triangles[name] = count;
	}
	return { test: 'local-mesh-triangle-budgets', triangles };
}
