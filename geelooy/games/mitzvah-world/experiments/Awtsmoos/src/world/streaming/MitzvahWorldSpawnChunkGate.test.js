// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSpawnChunkGate.test.js
 * @description Proves the spawn gate: only the spawn chunk generates before
 * control, neighbors are refused until control is granted, the same seed and
 * coordinates reproduce identical terrain, and a released spawn chunk
 * regenerates identically from its pooled buffer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	MITZVAH_WORLD_SPAWN_GRID_CELLS,
	createMitzvahWorldSpawnChunkGate,
	generateMitzvahWorldChunk,
	mitzvahWorldChunkSeed,
	mitzvahWorldSpawnChunkId
} from './MitzvahWorldSpawnChunkGate.js';
import { createChunkContainerPool } from './ChunkContainerPool.js';

const WORLD_SEED = 0x12345678;

test('spawn chunk id and seed are deterministic from seed and coordinates', () => {
	const first = mitzvahWorldSpawnChunkId({ chunkX: 3, chunkZ: -2 });
	const second = mitzvahWorldSpawnChunkId({ chunkX: 3, chunkZ: -2 });
	assert.equal(first, second);
	assert.notEqual(
		mitzvahWorldSpawnChunkId({ chunkX: 4, chunkZ: -2 }),
		first
	);
	assert.equal(
		mitzvahWorldChunkSeed(WORLD_SEED, first),
		mitzvahWorldChunkSeed(WORLD_SEED, first)
	);
	assert.notEqual(
		mitzvahWorldChunkSeed(WORLD_SEED + 1, first),
		mitzvahWorldChunkSeed(WORLD_SEED, first)
	);
});

test('same seed and coordinates reproduce identical terrain and meadow', () => {
	const first = generateMitzvahWorldChunk({
		chunkX: 0,
		chunkZ: 0,
		timeSeconds: 12,
		worldSeed: WORLD_SEED
	});
	const second = generateMitzvahWorldChunk({
		chunkX: 0,
		chunkZ: 0,
		timeSeconds: 12,
		worldSeed: WORLD_SEED
	});
	assert.equal(first.id, second.id);
	assert.equal(first.seed, second.seed);
	assert.deepEqual([...first.heights], [...second.heights]);
	assert.deepEqual(first.meadow, second.meadow);
	assert.equal(
		first.heights.length,
		(MITZVAH_WORLD_SPAWN_GRID_CELLS + 1) ** 2
	);
});

test('different coordinates give different terrain from the same seed', () => {
	const origin = generateMitzvahWorldChunk({ chunkX: 0, chunkZ: 0, worldSeed: WORLD_SEED });
	const east = generateMitzvahWorldChunk({ chunkX: 1, chunkZ: 0, worldSeed: WORLD_SEED });
	assert.notEqual(origin.id, east.id);
	assert.notEqual(origin.seed, east.seed);
	assert.ok(
		[...origin.heights].some((height, index) => height !== east.heights[index]),
		'neighboring chunks should differ somewhere'
	);
});

test('neighbor requests are refused before control and accepted after', () => {
	const gate = createMitzvahWorldSpawnChunkGate({ worldSeed: WORLD_SEED });
	const neighbor = mitzvahWorldSpawnChunkId({ chunkX: 1, chunkZ: 0 });
	const refused = gate.requestNeighbor(neighbor);
	assert.equal(refused.accepted, false);
	assert.equal(refused.reason, 'control-not-granted');
	assert.equal(gate.grantControl(), true);
	assert.equal(gate.grantControl(), false);
	const accepted = gate.requestNeighbor(neighbor);
	assert.equal(accepted.accepted, true);
	assert.equal(accepted.reason, 'control-granted');
	assert.equal(gate.diagnostics().controlGranted, true);
});

test('spawn generation is idempotent: one generation, one pooled buffer', () => {
	const pool = createChunkContainerPool();
	const gate = createMitzvahWorldSpawnChunkGate({ pool, worldSeed: WORLD_SEED });
	const first = gate.generateSpawnChunk(5);
	const second = gate.generateSpawnChunk(9);
	assert.equal(second, first);
	assert.equal(gate.diagnostics().generations, 1);
	assert.equal(gate.diagnostics().spawnGenerated, true);
	assert.equal(pool.diagnostics().float32Misses, 1);
	assert.equal(pool.diagnostics().float32Hits, 0);
	assert.equal(first.record.id, gate.spawnChunkId);
	assert.equal(first.record.deterministicSeed, first.seed);
	assert.deepEqual(first.record.durableMutations.meadow, first.meadow);
});

test('released spawn chunk regenerates identically and reuses its buffer', () => {
	const pool = createChunkContainerPool();
	const gate = createMitzvahWorldSpawnChunkGate({ pool, worldSeed: WORLD_SEED });
	const first = gate.generateSpawnChunk(5);
	const firstHeights = [...first.heights];
	assert.equal(gate.releaseSpawnChunk(), true);
	assert.equal(gate.diagnostics().spawnGenerated, false);
	const second = gate.generateSpawnChunk(5);
	assert.deepEqual([...second.heights], firstHeights);
	assert.deepEqual(second.meadow, first.meadow);
	assert.equal(second.heights, first.heights, 'pooled buffer should be reused');
	assert.equal(pool.diagnostics().float32Hits, 1);
	assert.equal(gate.diagnostics().generations, 2);
});

test('spawn chunk spans exactly one 32-metre column at the origin', () => {
	const generated = generateMitzvahWorldChunk({ chunkX: 0, chunkZ: 0, worldSeed: WORLD_SEED });
	assert.equal(generated.chunkSize, MITZVAH_WORLD_SPAWN_CHUNK_SIZE);
	assert.deepEqual(generated.bounds.min, { x: 0, y: -64, z: 0 });
	assert.deepEqual(generated.bounds.max, { x: 32, y: 256, z: 32 });
	assert.ok([...generated.heights].every(height => Number.isFinite(height)));
});
