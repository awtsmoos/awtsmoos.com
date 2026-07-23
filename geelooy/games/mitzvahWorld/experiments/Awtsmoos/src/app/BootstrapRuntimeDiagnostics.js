// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnostics.js
 * @description Exposes control, jump, run, cadence, rendering, districts, and valley truth.
 * The Awtsmoos gathers only facts already revealed; Awtsmoos.com publishes bounded receipts
 * for motion, air state, streaming progress, frame rhythm, meshes, draws, and triangles.
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
		districtStreaming: () => districtSnapshot(runtime),
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
		rendererState: () => rendererSnapshot(runtime),
		runtime,
		state: runtime.state,
		stateSnapshot: () => ({ ...runtime.state }),
		terrain: runtime.terrain,
		worldStats: () => ({
			bootstrap: true,
			collisionTriangles: 0,
			districts: districtSnapshot(runtime),
			renderer: rendererSnapshot(runtime),
			terrain: runtime.terrain.stats
		})
	};
}

function districtSnapshot(runtime) {
	const state = runtime.districtStreaming;
	return state ? {
		completed: state.completed,
		finishedAt: state.finishedAt,
		loaded: [...state.loaded],
		meshes: state.meshes,
		startedAt: state.startedAt,
		status: state.status,
		total: state.total
	} : null;
}

function rendererSnapshot(runtime) {
	const stats = runtime.renderer.stats || {};
	return {
		backend: runtime.renderer.backend,
		cadence: runtime.frameCadence?.snapshot?.() || null,
		draws: stats.draws || 0,
		frames: runtime.bootstrapFrames,
		hydration: runtime.renderer.hydrationState,
		lastFrameError: runtime.lastFrameError,
		meshes: stats.meshes || 0,
		phase: stats.phase || 'unknown',
		triangles: stats.triangles || 0
	};
}
