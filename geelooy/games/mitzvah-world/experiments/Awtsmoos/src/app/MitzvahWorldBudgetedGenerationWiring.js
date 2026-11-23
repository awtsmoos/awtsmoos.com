// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBudgetedGenerationWiring.js
 * @description Wires the one budgeted generation-and-simulation loop into the live game.
 * The Awtsmoos renews every meadow cell as the Chossid walks in light;
 * Awtsmoos.com keeps spawn, neighbor budget, upload timing and cancellation right.
 * One shared coordinator executes jobs after first control, once per frame.
 * The 2 ms row-sliced CPU budget, one GPU upload gate, 5 Hz simulation,
 * reversal cancellation and fixed-radius pruning remain the original owners.
 * Upload timing observes synchronous submission, not GPU fence completion.
 */

import { createMitzvahWorldBudgetedGenerationLoop } from '../world/streaming/MitzvahWorldBudgetedGenerationLoop.js';
import { instrumentMitzvahWorldGpuUploads } from '../world/streaming/MitzvahWorldGpuUploadWitness.js';
import { MITZVAH_WORLD_SPAWN_CHUNK_SIZE } from '../world/streaming/MitzvahWorldSpawnChunkGate.js';

/** Neighbor ring radius (chunks) requested around the player. */
export const MITZVAH_WORLD_NEIGHBOR_RING_RADIUS = 1;
/** Live window radius (chunks) kept after pruning. */
export const MITZVAH_WORLD_LIVE_WINDOW_RADIUS = 2;

/**
 * Runs a budgeted generation frame, reusing the same live coordinator each time.
 * @param {object} runtime Real Eretz runtime owning chunkRuntime and diagnostics.
 * @param {object} frame Player position, velocity, direction, time and frame cost.
 * @returns {object|null} Loop receipt or null if no runtime exists.
 */
export function updateMitzvahWorldBudgetedGeneration(runtime, frame = {}) {
	if (!runtime?.chunkRuntime) return null;
	let loop = runtime.budgetedGenerationLoop;
	if (!loop) {
		loop = createMitzvahWorldBudgetedGenerationLoop({
			chunkRuntime: runtime.chunkRuntime
		});
		runtime.budgetedGenerationLoop = loop;
		// The instrumented object IS the loop's coordinator, not a second queue.
		runtime.streamingCoordinator = instrumentMitzvahWorldGpuUploads(loop.coordinator);
	}
	const receipt = loop.update(frame);
	// Spawn is the only synchronous chunk before control; neighbors follow.
	if (!loop.diagnostics().controlGranted) {
		loop.grantControl();
	}
	const playerPosition = frame.playerPosition || { x: 0, y: 0, z: 0 };
	const playerChunk = chunkOf(playerPosition);
	const center = runtime.budgetedGenerationNeighborCenter;
	if (!center || center.x !== playerChunk.x || center.z !== playerChunk.z) {
		requestNeighborRing(loop, playerChunk);
		runtime.budgetedGenerationNeighborCenter = { ...playerChunk };
	}
	loop.pruneFarNeighbors(playerChunk.x, playerChunk.z, MITZVAH_WORLD_LIVE_WINDOW_RADIUS);
	// The receipt reads the same coordinator snapshot, including measured uploads.
	runtime.budgetedGenerationDiagnostics = loop.diagnostics();
	return receipt;
}

/** Requests the idempotent 3x3 neighbor ring without including the center. */
function requestNeighborRing(loop, playerChunk) {
	for (let dx = -MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dx <= MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dx += 1) {
		for (let dz = -MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dz <= MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dz += 1) {
			if (dx === 0 && dz === 0) continue;
			loop.requestNeighbor(playerChunk.x + dx, playerChunk.z + dz);
		}
	}
}

/** Derives deterministic chunk coordinates from the player world position. */
function chunkOf(position) {
	const size = MITZVAH_WORLD_SPAWN_CHUNK_SIZE;
	return {
		x: Math.floor((Number(position.x) || 0) / size),
		z: Math.floor((Number(position.z) || 0) / size)
	};
}
