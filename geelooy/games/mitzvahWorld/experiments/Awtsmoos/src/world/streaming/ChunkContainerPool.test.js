// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChunkContainerPool.test.js
 * @description Proves chunk containers and typed buffers are reused locally:
 * released vessels come back on the next acquisition and retained memory
 * stays under the configured cap.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createChunkContainerPool } from './ChunkContainerPool.js';

test('released Float32Array is reused on next acquire', () => {
	const pool = createChunkContainerPool();
	const first = pool.acquireFloat32(1024);
	pool.releaseFloat32(first);
	const second = pool.acquireFloat32(1024);
	assert.equal(second, first);
	const diagnostics = pool.diagnostics();
	assert.equal(diagnostics.float32Hits, 1);
	assert.equal(diagnostics.float32Misses, 1);
});

test('released Uint32Array is reused on next acquire', () => {
	const pool = createChunkContainerPool();
	const first = pool.acquireUint32(256);
	pool.releaseUint32(first);
	assert.equal(pool.acquireUint32(256), first);
});

test('different length classes do not collide', () => {
	const pool = createChunkContainerPool();
	const small = pool.acquireFloat32(128);
	const large = pool.acquireFloat32(2048);
	pool.releaseFloat32(small);
	pool.releaseFloat32(large);
	assert.equal(pool.acquireFloat32(128), small);
	assert.equal(pool.acquireFloat32(2048), large);
});

test('retained bytes stay under the cap; overflow is dropped', () => {
	const pool = createChunkContainerPool({ maxRetainedBytes: 1024 });
	const small = pool.acquireFloat32(128);
	assert.equal(pool.releaseFloat32(small), true);
	assert.equal(pool.diagnostics().retainedBytes, 512);
	const tooBig = pool.acquireFloat32(256);
	assert.equal(pool.releaseFloat32(tooBig), false);
	assert.ok(pool.diagnostics().retainedBytes <= 1024);
});

test('mesh containers round-trip with reuse accounting', () => {
	const pool = createChunkContainerPool();
	const first = pool.acquireContainer();
	pool.releaseContainer(first);
	const second = pool.acquireContainer();
	assert.equal(second, first);
	assert.equal(second.meta.reused, 1);
	assert.equal(second.positions, null);
});

test('released buffers are zeroed before reuse', () => {
	const pool = createChunkContainerPool();
	const array = pool.acquireFloat32(8);
	array.fill(7);
	pool.releaseFloat32(array);
	const reused = pool.acquireFloat32(8);
	assert.deepEqual([...reused], [0, 0, 0, 0, 0, 0, 0, 0]);
});
