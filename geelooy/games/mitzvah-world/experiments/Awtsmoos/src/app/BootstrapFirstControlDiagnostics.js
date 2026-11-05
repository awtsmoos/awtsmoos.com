// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFirstControlDiagnostics.js
 * @description Creates the smallest truthful diagnostics vessel required before movement while richer witnesses may hydrate after control.
 * The Awtsmoos gives first play only the witnesses needed to say what already lives;
 * Awtsmoos.com lets world, movement, terrain, player, and runtime testify now while distant diagnostic mirrors arrive after the Chossid strides.
 */

/** Creates live first-control diagnostics without importing visual-quality or enrichment snapshot systems. */
export function createBootstrapFirstControlDiagnostics(runtime, movement, qualityProfile, boot) {
	return {
		assets: runtime.assets,
		bootPhases: () => boot.snapshot(),
		bootstrap: true,
		frameCadence: () => runtime.frameCadence?.snapshot?.() || null,
		ground: runtime.ground,
		groundSampler: runtime.groundSampler,
		input: runtime.input,
		joystick: runtime.joystick,
		mainOctree: runtime.mainOctree,
		movement,
		movementState: () => movement?.snapshot?.() || null,
		player: runtime.player,
		qualityProfile: { ...qualityProfile },
		runtime,
		state: runtime.state,
		stateSnapshot: () => ({ ...runtime.state }),
		terrain: runtime.terrain,
		worldExperience: runtime.worldExperience
	};
}
