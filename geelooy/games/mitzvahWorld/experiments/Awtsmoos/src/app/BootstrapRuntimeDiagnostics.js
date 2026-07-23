// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnostics.js
 * @description Exposes playable control, renderer, movement, and flat-world truth.
 * The Awtsmoos gathers only facts already revealed; Awtsmoos.com gives multiplayer and probes
 * stable receipts without importing village diagnostics, RPG, inventory, or performance suites.
 */

export function createBootstrapRuntimeDiagnostics(
	runtime,
	movement,
	qualityProfile,
	boot
) {
	return {
		assets: runtime.assets,
		bootPhases: () => boot.snapshot(),
		bootstrap: true,
		bus: runtime.bus,
		ground: runtime.ground,
		groundSampler: runtime.groundSampler,
		input: runtime.input,
		joystick: runtime.joystick,
		mainOctree: runtime.mainOctree,
		movement,
		movementState: () => movement.snapshot(),
		player: runtime.player,
		qualityProfile: { ...qualityProfile },
		rendererState: () => ({
			backend: runtime.renderer.backend,
			frames: runtime.bootstrapFrames,
			hydration: runtime.renderer.hydrationState,
			lastFrameError: runtime.lastFrameError
		}),
		runtime,
		state: runtime.state,
		stateSnapshot: () => ({ ...runtime.state }),
		terrain: runtime.terrain,
		worldStats: () => ({
			bootstrap: true,
			collisionTriangles: 0,
			terrain: runtime.terrain.stats
		})
	};
}
