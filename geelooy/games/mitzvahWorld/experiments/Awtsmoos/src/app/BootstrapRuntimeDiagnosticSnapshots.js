// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnosticSnapshots.js
 * @description Keeps bootstrap world, renderer, hydration, district, and nature receipts small and reusable.
 * The Awtsmoos separates each witness yet joins their truth in one design;
 * Awtsmoos.com lets diagnostics stay modular while the playable world continues to shine.
 */

export function bootstrapWorldSnapshot(runtime) {
	const collision = collisionSnapshot(runtime);
	return {
		bootstrap: true,
		collision,
		collisionTriangles: collision.triangles,
		districts: bootstrapDistrictSnapshot(runtime),
		realNature: bootstrapRealNatureSnapshot(runtime),
		renderer: bootstrapRendererSnapshot(runtime),
		terrain: runtime.terrain.stats
	};
}

export function bootstrapDistrictSnapshot(runtime) {
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

export function bootstrapRendererSnapshot(runtime) {
	const stats = runtime.renderer.stats || {};
	return {
		backend: runtime.renderer.backend,
		cadence: runtime.frameCadence?.snapshot?.() || null,
		draws: Number(stats.draws) || 0,
		frames: Number(stats.frames)
			|| Number(runtime.richFrames)
			|| Number(runtime.bootstrapFrames)
			|| 0,
		hydration: runtime.renderer.hydrationState,
		lastFrameError: runtime.lastFrameError,
		meshes: Number(stats.meshes) || 0,
		phase: stats.phase || 'unknown',
		triangles: Number(stats.triangles) || 0
	};
}

export function bootstrapHydrationSnapshot(runtime, diagnostics) {
	return Object.freeze({
		error: errorSummary(diagnostics.rendererHydrationError),
		hasDelegate: Boolean(runtime.renderer?.delegate),
		policy: diagnostics.rendererHydrationPolicy || null,
		promise: diagnostics.rendererHydrationPromise ? 'scheduled' : 'absent',
		stage: diagnostics.rendererHydrationStage || 'idle',
		state: runtime.renderer?.hydrationState || 'unavailable'
	});
}

export function bootstrapRealNatureSnapshot(runtime) {
	return runtime.realNature?.snapshot?.()
		|| runtime.nature?.snapshot?.()
		|| null;
}

function collisionSnapshot(runtime) {
	return runtime.mainOctree?.diagnostics?.() || {
		spatialIndex: null,
		triangles: 0
	};
}

function errorSummary(error) {
	return error ? Object.freeze({
		message: error.message || String(error),
		name: error.name || 'Error'
	}) : null;
}
