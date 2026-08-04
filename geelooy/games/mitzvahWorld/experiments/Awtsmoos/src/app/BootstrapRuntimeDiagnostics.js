// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnostics.js
 * @description Exposes current control, rendering, district lifecycle, and indexed collision truth.
 * The Awtsmoos renews wall, release, and witness together; Awtsmoos.com reports both active
 * triangles and the finite grid that found them, while hiding mutable groups and lifecycle functions.
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
		worldStats: () => {
			const collision = collisionSnapshot(runtime);
			return {
				bootstrap: true,
				collision,
				collisionTriangles: collision.triangles,
				districts: districtSnapshot(runtime),
				renderer: rendererSnapshot(runtime),
				terrain: runtime.terrain.stats
			};
		}
	};
}

function collisionSnapshot(runtime) {
	return runtime.mainOctree?.diagnostics?.() || {
		spatialIndex: null,
		triangles: 0
	};
}

function districtSnapshot(runtime) {
	const state = runtime.districtStreaming;
	return state ? {
		active: Number(state.active) || 0,
		colliders: Number(state.colliders) || 0,
		completed: state.completed,
		finishedAt: state.finishedAt,
		loaded: [...state.loaded],
		meshes: state.meshes,
		released: Number(state.released) || 0,
		startedAt: state.startedAt,
		status: state.status,
		total: state.total,
		triangles: Number(state.triangles) || 0
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
