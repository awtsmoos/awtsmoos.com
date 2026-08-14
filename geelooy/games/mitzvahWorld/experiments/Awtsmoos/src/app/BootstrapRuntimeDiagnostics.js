// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnostics.js
 * @description Exposes live control, rendering, nature, hydration, district, and collision truth during staged play.
 * The Awtsmoos renews witness with the world it measures; Awtsmoos.com reports the active renderer and living nature
 * without leaking mutable systems, so bootstrap, promotion, and every richer garment remain inspectable as they change.
 */

export function createBootstrapRuntimeDiagnostics(
	runtime,
	movement,
	qualityProfile,
	boot
) {
	const diagnostics = {
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
		realNature: () => realNatureSnapshot(runtime),
		rendererHydration: () => hydrationSnapshot(runtime, diagnostics),
		rendererState: () => rendererSnapshot(runtime),
		runtime,
		state: runtime.state,
		stateSnapshot: () => ({ ...runtime.state }),
		terrain: runtime.terrain,
		worldStats: () => worldSnapshot(runtime)
	};
	return diagnostics;
}

function worldSnapshot(runtime) {
	const collision = collisionSnapshot(runtime);
	return {
		bootstrap: true,
		collision,
		collisionTriangles: collision.triangles,
		districts: districtSnapshot(runtime),
		realNature: realNatureSnapshot(runtime),
		renderer: rendererSnapshot(runtime),
		terrain: runtime.terrain.stats
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
		draws: Number(stats.draws) || 0,
		frames: Number(stats.frames) || Number(runtime.richFrames) || Number(runtime.bootstrapFrames) || 0,
		hydration: runtime.renderer.hydrationState,
		lastFrameError: runtime.lastFrameError,
		meshes: Number(stats.meshes) || 0,
		phase: stats.phase || 'unknown',
		triangles: Number(stats.triangles) || 0
	};
}

function hydrationSnapshot(runtime, diagnostics) {
	return Object.freeze({
		error: errorSummary(diagnostics.rendererHydrationError),
		hasDelegate: Boolean(runtime.renderer?.delegate),
		policy: diagnostics.rendererHydrationPolicy || null,
		promise: diagnostics.rendererHydrationPromise ? 'scheduled' : 'absent',
		stage: diagnostics.rendererHydrationStage || 'idle',
		state: runtime.renderer?.hydrationState || 'unavailable'
	});
}

function realNatureSnapshot(runtime) {
	return runtime.realNature?.snapshot?.()
		|| runtime.nature?.snapshot?.()
		|| null;
}

function errorSummary(error) {
	return error ? Object.freeze({
		message: error.message || String(error),
		name: error.name || 'Error'
	}) : null;
}
