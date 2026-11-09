// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChunkPoolReuse.test.js
 * @description Proves the Chapter 4 pool reuses every game-owned vessel: shared
 * materials are one object per key with reference counts, vegetation batches
 * return cleared and reused by capacity class, and a full load/unload round
 * trip leaves retained memory stable instead of growing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createChunkContainerPool } from './ChunkContainerPool.js';

test('same material key returns one shared object; factory runs once per key', () => {
	const pool = createChunkContainerPool();
	let builds = 0;
	const create = (key) => {
		builds += 1;
		return { key, roughness: 0.9 };
	};
	const first = pool.acquireMaterial('terrain:grass', create);
	const second = pool.acquireMaterial('terrain:grass', create);
	assert.equal(second, first);
	assert.equal(builds, 1);
	assert.equal(pool.diagnostics().materialHits, 1);
	assert.equal(pool.diagnostics().materialMisses, 1);
	assert.equal(pool.diagnostics().materialCount, 1);
	assert.equal(pool.diagnostics().materialRefs, 2);
	assert.equal(pool.peekMaterial('terrain:grass'), first);
});

test('different material keys get different records', () => {
	const pool = createChunkContainerPool();
	const grass = pool.acquireMaterial('terrain:grass', (key) => ({ key }));
	const rock = pool.acquireMaterial('terrain:rock', (key) => ({ key }));
	assert.notEqual(rock, grass);
	assert.equal(pool.diagnostics().materialCount, 2);
});

test('material release counts refs down; drop at zero removes the record', () => {
	const pool = createChunkContainerPool();
	pool.acquireMaterial('terrain:grass', (key) => ({ key }));
	pool.acquireMaterial('terrain:grass', (key) => ({ key }));
	assert.equal(pool.releaseMaterial('terrain:grass'), 1);
	assert.equal(pool.diagnostics().materialRefs, 1);
	assert.equal(pool.peekMaterial('terrain:grass') !== null, true);
	assert.equal(pool.releaseMaterial('terrain:grass'), 0);
	assert.equal(pool.diagnostics().materialRefs, 0);
	assert.equal(pool.peekMaterial('terrain:grass') !== null, true);
	assert.equal(pool.releaseMaterial('terrain:grass', { drop: true }), 0);
	assert.equal(pool.peekMaterial('terrain:grass'), null);
	assert.equal(pool.diagnostics().materialCount, 0);
	assert.equal(pool.releaseMaterial('terrain:missing'), -1);
});

test('material acquire without a factory for a new key throws', () => {
	const pool = createChunkContainerPool();
	assert.throws(() => pool.acquireMaterial('terrain:grass'), TypeError);
	assert.throws(() => pool.acquireMaterial(''), TypeError);
});

test('vegetation batches are cleared and reused by capacity class', () => {
	const pool = createChunkContainerPool();
	const first = pool.acquireVegetationBatch(96);
	first.push({ blade: 1 }, { blade: 2 });
	assert.equal(first.capacity, 96);
	pool.releaseVegetationBatch(first);
	const second = pool.acquireVegetationBatch(96);
	assert.equal(second, first);
	assert.equal(second.length, 0);
	assert.equal(pool.diagnostics().vegetationBatchHits, 1);
	const other = pool.acquireVegetationBatch(48);
	assert.notEqual(other, first);
	assert.equal(other.capacity, 48);
});

test('invalid vegetation batch releases are refused', () => {
	const pool = createChunkContainerPool();
	assert.equal(pool.releaseVegetationBatch(null), false);
	assert.equal(pool.releaseVegetationBatch([1, 2]), false);
	assert.equal(pool.releaseVegetationBatch({ capacity: 8 }), false);
});

test('a full load/unload round trip reuses every vessel and holds memory stable', () => {
	const pool = createChunkContainerPool();
	const load = () => {
		const container = pool.acquireContainer();
		container.positions = pool.acquireFloat32(1089);
		container.uvs = pool.acquireFloat32(2178);
		container.indices = pool.acquireUint32(6144);
		const material = pool.acquireMaterial('terrain:grass', (key) => ({ key }));
		const vegetation = pool.acquireVegetationBatch(96);
		vegetation.push({ blade: 1 });
		return { container, material, vegetation };
	};
	const unload = (loaded) => {
		pool.releaseFloat32(loaded.container.positions);
		pool.releaseFloat32(loaded.container.uvs);
		pool.releaseUint32(loaded.container.indices);
		pool.releaseContainer(loaded.container);
		pool.releaseMaterial('terrain:grass');
		pool.releaseVegetationBatch(loaded.vegetation);
	};
	const first = load();
	const firstPositions = first.container.positions;
	const firstVegetation = first.vegetation;
	unload(first);
	const afterFirst = pool.diagnostics();
	const second = load();
	assert.equal(second.container, first.container);
	assert.equal(second.container.positions, firstPositions);
	assert.equal(second.material, first.material);
	assert.equal(second.vegetation, firstVegetation);
	unload(second);
	const afterSecond = pool.diagnostics();
	assert.equal(afterSecond.retainedBytes, afterFirst.retainedBytes);
	assert.equal(afterSecond.vegetationBatchesRetained, afterFirst.vegetationBatchesRetained);
	assert.equal(afterSecond.materialRefs, 0);
	assert.ok(afterSecond.float32Hits > 0);
	assert.ok(afterSecond.vegetationBatchHits > 0);
	assert.ok(afterSecond.materialHits > 0);
});
