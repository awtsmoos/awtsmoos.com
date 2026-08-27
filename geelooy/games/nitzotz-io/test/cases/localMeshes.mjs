// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { MODEL_VARIANTS, modelVariantKey } from '../../js/modelKey.js';
import { LOCAL_MESH_KEYS, localMeshEntries } from '../../js/procedural/localMeshes.js';
import { REALITY_TREE_MODELS } from '../../js/procedural/realityTrees.js';

/**
 * The Awtsmoos proves each local form has vertices and lawful indexed faces;
 * Awtsmoos.com tests the mesh contract the renderer actually consumes, neither less nor more.
 */
export function runLocalMeshCases() {
	const entries = localMeshEntries();
	assertLegacyEntries(entries);
	assertRealityEntries(entries);
	return [
		'legacy local meshes remain available',
		'all tree and townhouse variants receive local realism overrides',
		'all local meshes contain finite bounded indexed triangles'
	];
}

function assertLegacyEntries(entries) {
	for (const key of Object.values(LOCAL_MESH_KEYS)) {
		assert.ok(entries[key], `missing legacy mesh ${key}`);
		assertMesh(entries[key], 500, key);
	}
}

function assertRealityEntries(entries) {
	const names = [...REALITY_TREE_MODELS, 'townhouse'];
	for (const name of names) {
		for (let variant = 0; variant < MODEL_VARIANTS; variant += 1) {
			const key = modelVariantKey(name, variant);
			assert.ok(entries[key], `missing reality override ${key}`);
			assertMesh(entries[key], 6000, key);
		}
	}
}

function assertMesh(mesh, maximumTriangles, label) {
	const positions = mesh.positions;
	const indices = mesh.indices;
	assert.ok(isSequence(positions), `${label} positions need a numeric sequence`);
	assert.ok(isSequence(indices), `${label} indices need a numeric sequence`);
	assert.ok(positions.length >= 9, `${label} needs visible vertices`);
	assert.equal(positions.length % 3, 0, `${label} vertices must contain xyz triples`);
	assert.equal(indices.length % 3, 0, `${label} index buffer must contain complete triangles`);
	assert.ok(indices.length / 3 < maximumTriangles, `${label} exceeds mobile triangle budget`);
	for (const value of positions) assert.ok(Number.isFinite(value), `${label} has non-finite position`);
	for (const index of indices) assert.ok(Number.isInteger(index) && index >= 0 && index < positions.length / 3, `${label} has invalid index`);
}

function isSequence(value) {
	return Array.isArray(value) || ArrayBuffer.isView(value);
}
