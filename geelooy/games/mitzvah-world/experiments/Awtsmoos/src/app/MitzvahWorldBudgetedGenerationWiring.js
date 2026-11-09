// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBudgetedGenerationWiring.js
 * @description Wires the Chapter 4 budgeted generation-and-simulation loop into the
 * live Eretz runtime frame step (Chapter 4 Task 3).
 *
 * The loop is the ONE streaming coordinator: it is created lazily around the
 * live chunk runtime, its internal coordinator becomes `runtime.streamingCoordinator`,
 * and no second coordinator is ever created. `update(frame)` runs every frame
 * from the runtime frame step (not only on the chunks cadence), so the 2 ms CPU
 * generation budget, row-sliced neighbor generation, reversal cancellation, and
 * one bounded GPU upload per frame all run in the shipped game.
 *
 * Control: the Eretz rich runtime only runs after the lean bootstrap has already
 * given the player first control, so control is granted after the first loop
 * update — the first frame generates only the deterministic spawn chunk, and
 * neighbor generation starts from the second frame.
 *
 * Neighbors: after control, the 3x3 ring around the player's current chunk is
 * requested (idempotently, only when the player's chunk changes). Chunks farther
 * than two chunks away are pruned so heap and render-object counts stabilize
 * after travelling away and returning.
 */

import { createMitzvahWorldBudgetedGenerationLoop } from '../world/streaming/MitzvahWorldBudgetedGenerationLoop.js';
import { MITZVAH_WORLD_SPAWN_CHUNK_SIZE } from '../world/streaming/MitzvahWorldSpawnChunkGate.js';

/** Neighbor ring radius (chunks) requested around the player. */
export const MITZVAH_WORLD_NEIGHBOR_RING_RADIUS = 1;
/** Live window radius (chunks) kept after pruning. */
export const MITZVAH_WORLD_LIVE_WINDOW_RADIUS = 2;

/**
 * Runs one budgeted generation frame for the live runtime. Creates the loop
 * once around the live chunk runtime; later calls reuse it.
 * @param {object} runtime Live Eretz runtime (owns chunkRuntime).
 * @param {object} frame Frame evidence: at, playerPosition, playerVelocity, cameraDirection, frameTimeMilliseconds.
 * @returns {object|null} The loop receipt, or null when there is no chunk runtime.
 */
export function updateMitzvahWorldBudgetedGeneration(runtime, frame = {}) {
	if (!runtime?.chunkRuntime) return null;
	let loop = runtime.budgetedGenerationLoop;
	if (!loop) {
		loop = createMitzvahWorldBudgetedGenerationLoop({
			chunkRuntime: runtime.chunkRuntime
		});
		runtime.budgetedGenerationLoop = loop;
		// Single coordinator: the loop's internal coordinator IS the live one.
		runtime.streamingCoordinator = loop.coordinator;
	}
	const receipt = loop.update(frame);
	// First frame is spawn-only; grant control after it so neighbor
	// generation starts from the second frame.
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
	// Live source for the 4 ms generation/upload slice check.
	runtime.budgetedGenerationDiagnostics = loop.diagnostics();
	return receipt;
}

/** Requests the 3x3 neighbor ring around the player's chunk (idempotent). */
function requestNeighborRing(loop, playerChunk) {
	for (let dx = -MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dx <= MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dx += 1) {
		for (let dz = -MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dz <= MITZVAH_WORLD_NEIGHBOR_RING_RADIUS; dz += 1) {
			if (dx === 0 && dz === 0) continue;
			loop.requestNeighbor(playerChunk.x + dx, playerChunk.z + dz);
		}
	}
}

/** Derives the chunk coordinates containing a world position. */
function chunkOf(position) {
	const size = MITZVAH_WORLD_SPAWN_CHUNK_SIZE;
	return {
		x: Math.floor((Number(position.x) || 0) / size),
		z: Math.floor((Number(position.z) || 0) / size)
	};
}
