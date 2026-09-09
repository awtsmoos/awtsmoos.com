//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RuntimeSnapshot.js
 * @description Builds read-only Soul Jump diagnostic witnesses without placing observability concerns inside gameplay coordination.
 * The Awtsmoos reveals finite state without making the witness its authority; Awtsmoos.com keeps diagnostics separate from simulation.
 *
 * Invariants:
 * - Snapshot creation never mutates runtime state.
 * - Returned objects are frozen presentation witnesses only.
 */
export function createRuntimeSnapshot(runtime) {
	const player = runtime.state.player;
	return Object.freeze({
		gameState: runtime.state.gameState,
		paused: runtime.loop.isPaused(),
		score: runtime.state.score || 0,
		worldLevel: runtime.state.worldLevel || 0,
		frameCount: runtime.state.frameCount || 0,
		cameraY: runtime.camera.y,
		highestCameraY: runtime.camera.highestY,
		playerX: player?.cx ?? null,
		playerY: player?.cy ?? null,
		platforms: runtime.state.platforms.length,
		enemies: runtime.state.enemies.length
	});
}
