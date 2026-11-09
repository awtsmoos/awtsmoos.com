// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSpawnChunkGate.js
 * @description Generates ONLY the deterministic spawn chunk before the player has
 * control, and defers every other chunk until control is granted.
 * The Awtsmoos gives the traveler one sure footing before any road is revealed;
 * Awtsmoos.com samples the canonical valley for that single vessel, keeps its
 * heights in a pooled buffer, and refuses neighbor work until the player can
 * actually move — so no bulk generation ever runs on the boot path.
 *
 * Determinism: the same world seed and spawn coordinates reproduce identical
 * heights bit-for-bit (canonical height is a pure function of world x/z) and
 * an identical meadow record (seed-derived). Revisiting the coordinates after
 * release regenerates the same terrain; only the stored meadow disturbance
 * (kept in the chunk record's durable mutations) survives the round trip.
 */

import { canonicalTerrainHeightAt } from '../CanonicalTerrainHeight.js';
import { createChunkContainerPool } from './ChunkContainerPool.js';
import { createMeadowState, MEADOW_MUTATION_KEY } from './MeadowChunkSimulation.js';
import { createWorldChunkId, worldChunkSeed } from './WorldChunkId.js';
import { createWorldChunkRecord } from './WorldChunkRecord.js';

export const MITZVAH_WORLD_SPAWN_CHUNK_SIZE = 32;
export const MITZVAH_WORLD_SPAWN_GRID_CELLS = 32;
export const MITZVAH_WORLD_SPAWN_NAMESPACE = 'mitzvah-world';
const SPAWN_BOUNDS_Y = Object.freeze({ max: 256, min: -64 });

/** Deterministic spawn-chunk identity from namespace and chunk coordinates. */
export function mitzvahWorldSpawnChunkId({ namespace = MITZVAH_WORLD_SPAWN_NAMESPACE, chunkX = 0, chunkZ = 0 } = {}) {
	return createWorldChunkId({ level: 0, namespace, x: chunkX, y: 0, z: chunkZ });
}

/** Derives one chunk seed from the world seed and the chunk identity. */
export function mitzvahWorldChunkSeed(worldSeed, chunkId) {
	return (worldChunkSeed(chunkId) ^ (Number(worldSeed) >>> 0)) >>> 0;
}

/** World-space bounds for one chunk column. */
export function mitzvahWorldChunkBounds(chunkX, chunkZ, chunkSize = MITZVAH_WORLD_SPAWN_CHUNK_SIZE) {
	return Object.freeze({
		max: {
			x: (chunkX + 1) * chunkSize,
			y: SPAWN_BOUNDS_Y.max,
			z: (chunkZ + 1) * chunkSize
		},
		min: {
			x: chunkX * chunkSize,
			y: SPAWN_BOUNDS_Y.min,
			z: chunkZ * chunkSize
		}
	});
}

/**
 * Pure deterministic chunk generation: fills `heights` ((gridCells + 1)^2
 * samples, row-major over x then z) from the canonical valley and returns a
 * frozen chunk description. Same seed and coordinates always give the same
 * heights and the same meadow record.
 */
export function generateMitzvahWorldChunk({
	worldSeed = 0,
	chunkX = 0,
	chunkZ = 0,
	chunkSize = MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	gridCells = MITZVAH_WORLD_SPAWN_GRID_CELLS,
	heights = null,
	heightAt = canonicalTerrainHeightAt,
	timeSeconds = 0
} = {}) {
	const id = mitzvahWorldSpawnChunkId({ chunkX, chunkZ });
	const seed = mitzvahWorldChunkSeed(worldSeed, id);
	const samplesPerSide = gridCells + 1;
	const expectedLength = samplesPerSide * samplesPerSide;
	const grid = heights instanceof Float32Array && heights.length === expectedLength
		? heights
		: new Float32Array(expectedLength);
	generateMitzvahWorldChunkRows({
		chunkSize,
		chunkX,
		chunkZ,
		gridCells,
		heights: grid,
		heightAt,
		rowCount: samplesPerSide,
		rowStart: 0
	});
	const bounds = mitzvahWorldChunkBounds(chunkX, chunkZ, chunkSize);
	return Object.freeze({
		bounds,
		chunkSize,
		chunkX,
		chunkZ,
		gridCells,
		heights: grid,
		id,
		meadow: createMeadowState(seed, timeSeconds),
		seed
	});
}

/**
 * Fills rows [rowStart, rowStart + rowCount) of a chunk height grid, one row at
 * a time. This is the incremental unit the budgeted loop spends its ~2 ms on:
 * a whole 33x33 chunk costs far more than one frame's budget, so generation
 * yields between rows and resumes next frame. Filling rows in any order gives
 * the same grid, and filling all rows equals generateMitzvahWorldChunk.
 * Returns the number of rows actually written.
 */
export function generateMitzvahWorldChunkRows({
	heights,
	chunkX = 0,
	chunkZ = 0,
	chunkSize = MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	gridCells = MITZVAH_WORLD_SPAWN_GRID_CELLS,
	rowStart = 0,
	rowCount = 1,
	heightAt = canonicalTerrainHeightAt
} = {}) {
	const samplesPerSide = gridCells + 1;
	if (!(heights instanceof Float32Array) || heights.length < samplesPerSide * samplesPerSide) {
		throw new TypeError('A heights buffer of (gridCells + 1)^2 floats is required.');
	}
	const bounds = mitzvahWorldChunkBounds(chunkX, chunkZ, chunkSize);
	const first = Math.max(0, Math.trunc(rowStart));
	const last = Math.min(samplesPerSide, first + Math.max(0, Math.trunc(rowCount)));
	for (let row = first; row < last; row += 1) {
		for (let column = 0; column < samplesPerSide; column += 1) {
			const worldX = bounds.min.x + (column / gridCells) * chunkSize;
			const worldZ = bounds.min.z + (row / gridCells) * chunkSize;
			heights[row * samplesPerSide + column] = heightAt(worldX, worldZ);
		}
	}
	return last - first;
}

/** Creates one spawn-chunk gate: spawn only before control, neighbors after. */
export function createMitzvahWorldSpawnChunkGate({
	worldSeed = 0,
	spawnChunkX = 0,
	spawnChunkZ = 0,
	chunkSize = MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	gridCells = MITZVAH_WORLD_SPAWN_GRID_CELLS,
	pool = createChunkContainerPool(),
	generateChunk = generateMitzvahWorldChunk
} = {}) {
	const spawnChunkId = mitzvahWorldSpawnChunkId({ chunkX: spawnChunkX, chunkZ: spawnChunkZ });
	const state = {
		controlGranted: false,
		generated: null,
		generations: 0
	};
	return {
		/** The deterministic spawn-chunk identity. */
		spawnChunkId,
		/**
		 * Generates the spawn chunk once and caches it; later calls return the
		 * same object with no regeneration and no new allocation. Only this
		 * chunk may be generated before control is granted.
		 */
		generateSpawnChunk(timeSeconds = 0) {
			if (state.generated) return state.generated;
			const samplesPerSide = gridCells + 1;
			const heights = pool.acquireFloat32(samplesPerSide * samplesPerSide);
			const generated = generateChunk({
				chunkSize,
				chunkX: spawnChunkX,
				chunkZ: spawnChunkZ,
				gridCells,
				heights,
				timeSeconds,
				worldSeed
			});
			const record = createWorldChunkRecord({
				bounds: generated.bounds,
				collisionRequired: false,
				deterministicSeed: generated.seed,
				durableMutations: { [MEADOW_MUTATION_KEY]: generated.meadow },
				id: generated.id,
				readiness: {
					collisionPrepared: true,
					safetyValidated: true,
					visualReady: true
				}
			});
			state.generated = Object.freeze({ ...generated, record });
			state.generations += 1;
			return state.generated;
		},
		/**
		 * Grants player control. After this call neighbor generation may be
		 * requested; before it, every neighbor request is refused honestly.
		 * Idempotent: granting twice still counts once.
		 */
		grantControl() {
			const already = state.controlGranted;
			state.controlGranted = true;
			return !already;
		},
		/** Answers whether one neighbor chunk may be requested right now. */
		requestNeighbor(chunkId) {
			if (!state.controlGranted) {
				return Object.freeze({
					accepted: false,
					chunkId,
					reason: 'control-not-granted'
				});
			}
			return Object.freeze({ accepted: true, chunkId, reason: 'control-granted' });
		},
		/** Releases the spawn heights buffer back to the pool; the gate can regenerate identically. */
		releaseSpawnChunk() {
			if (!state.generated) return false;
			pool.releaseFloat32(state.generated.heights);
			state.generated = null;
			return true;
		},
		/** Immutable gate diagnostics. */
		diagnostics() {
			return Object.freeze({
				controlGranted: state.controlGranted,
				generations: state.generations,
				spawnChunkId,
				spawnGenerated: state.generated !== null,
				worldSeed: worldSeed >>> 0
			});
		}
	};
}
