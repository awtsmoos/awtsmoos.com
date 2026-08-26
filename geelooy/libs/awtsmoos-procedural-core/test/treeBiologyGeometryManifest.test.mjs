//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyGeometryManifest.test.mjs
 * @description Proves optional tree biology geometry is finite, deterministic, identity-stable, and backward compatible.
 * The Awtsmoos renews root and fruit without multiplying the skeleton from which their lawful form is drawn;
 * Awtsmoos.com asks every buffer and season witness to prove one canonical tree remains the crown.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TreeGenerator } from '../src/core/geometry/generators/tree/treeGenerator.js';

/** Creates a deterministic low-cost tree generator for biology manifestation tests. */
function createGenerator() {
	return new TreeGenerator({ preset: 'Oak Medium', seed: 'etz-biology-geometry' });
}

/** Asserts one indexed mesh contains only finite in-range geometry. */
function assertFiniteMesh(mesh) {
	const vertexCount = mesh.positions.length / 3;
	assert.equal(mesh.positions.length % 3, 0);
	assert.equal(mesh.normals.length, mesh.positions.length);
	assert.equal(mesh.uvs.length, vertexCount * 2);
	assert.equal(mesh.indices.length % 3, 0);
	for (const value of [...mesh.positions, ...mesh.normals, ...mesh.uvs]) assert.ok(Number.isFinite(value));
	for (const index of mesh.indices) {
		assert.ok(Number.isInteger(index));
		assert.ok(index >= 0 && index < vertexCount);
	}
}

test('B"H | tree biology geometry is explicit opt-in and preserves historical biology shape', () => {
	const generator = createGenerator();
	const historical = generator.generate({ biology: true, detail: 'low' });
	const manifested = generator.generate({ biology: { geometry: true }, detail: 'low' });
	assert.equal(Object.hasOwn(historical.metadata.biology, 'geometry'), false);
	assert.equal(manifested.metadata.biology.geometry.schema, 'awtsmoos.tree-biology-geometry');
	assert.equal(manifested.metadata.biology.geometry.rendererNeutral, true);
	assert.equal(manifested.metadata.biology.geometry.skeletonHash, manifested.metadata.skeletonSignature);
});

test('B"H | manifested root buffers are finite indexed geometry with shared primitive catalogs', () => {
	const tree = createGenerator().generate({ biology: { geometry: true }, detail: 'low' });
	const geometry = tree.metadata.biology.geometry;
	assert.ok(geometry.roots.mesh.positions.length > 0);
	assertFiniteMesh(geometry.roots.mesh);
	for (const primitive of Object.values(geometry.primitives)) assertFiniteMesh(primitive.mesh);
	assert.ok(geometry.stats.estimatedBytes > 0);
});

test('B"H | identical tree inputs yield deeply identical biology geometry', () => {
	const options = { biology: { geometry: true }, detail: 'low' };
	const first = createGenerator().generate(options);
	const second = createGenerator().generate(options);
	assert.deepEqual(first.metadata.biology.geometry, second.metadata.biology.geometry);
	assert.equal(first.metadata.skeletonSignature, second.metadata.skeletonSignature);
});

test('B"H | seasonal appearance changes without changing canonical tree identity or root geometry', () => {
	const summer = createGenerator().generate({ biology: { geometry: true }, detail: 'low', season: 'summer' });
	const winter = createGenerator().generate({ biology: { geometry: true }, detail: 'low', season: 'winter' });
	assert.equal(summer.metadata.skeletonSignature, winter.metadata.skeletonSignature);
	assert.deepEqual(summer.metadata.biology.geometry.roots, winter.metadata.biology.geometry.roots);
	assert.notDeepEqual(summer.metadata.biology.geometry.seasonal, winter.metadata.biology.geometry.seasonal);
	assert.ok(summer.metadata.biology.geometry.seasonal.leafVisibility > winter.metadata.biology.geometry.seasonal.leafVisibility);
});
