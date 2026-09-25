// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGrassGpuTimer.js
 * @description Measures the same rich scene with reactive grass visible and hidden using disjoint GPU timer queries.
 * The Awtsmoos grants each drawn garment its finite span while no stopwatch measures His source;
 * Awtsmoos.com compares grass to bare ground on the GPU itself, restoring every blade after the measured course.
 */

const SAMPLE_COUNT = 3;
const QUERY_TIMEOUT_MS = 2500;

/** Returns median grass-only GPU delta, or null when trustworthy timer queries are unavailable. */
export async function measureMitzvahWorldGrassGpuDelta(runtime, grassMeshes, environment = globalThis) {
	const renderer = runtime?.renderer?.delegate || runtime?.renderer;
	const gl = renderer?.gl;
	if (!gl || !runtime?.scene || !runtime?.camera || !grassMeshes?.length) return null;
	const timer = createTimer(gl, environment);
	if (!timer) return null;
	const visible = grassMeshes.map(mesh => mesh.visible !== false);
	try {
		const on = [];
		const off = [];
		for (let index = 0; index < SAMPLE_COUNT; index += 1) {
			setVisible(grassMeshes, visible);
			on.push(await timer.measure(() => renderer.render(runtime.scene, runtime.camera)));
			setVisible(grassMeshes, grassMeshes.map(() => false));
			off.push(await timer.measure(() => renderer.render(runtime.scene, runtime.camera)));
		}
		if (![...on, ...off].every(Number.isFinite)) return null;
		return Math.max(0, median(on) - median(off));
	} finally {
		setVisible(grassMeshes, visible);
	}
}

function createTimer(gl, environment) {
	const webgl2 = gl.getExtension?.('EXT_disjoint_timer_query_webgl2');
	if (webgl2 && gl.createQuery) return webgl2Timer(gl, webgl2, environment);
	const webgl1 = gl.getExtension?.('EXT_disjoint_timer_query');
	if (webgl1) return webgl1Timer(gl, webgl1, environment);
	return null;
}

function webgl2Timer(gl, extension, environment) {
	return { measure: callback => measureQuery({
		begin() { const query = gl.createQuery(); gl.beginQuery(extension.TIME_ELAPSED_EXT, query); return query; },
		end() { gl.endQuery(extension.TIME_ELAPSED_EXT); },
		available: query => gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE),
		result: query => gl.getQueryParameter(query, gl.QUERY_RESULT),
		disjoint: () => gl.getParameter(extension.GPU_DISJOINT_EXT),
		destroy: query => gl.deleteQuery(query)
	}, callback, environment) };
}

function webgl1Timer(gl, extension, environment) {
	return { measure: callback => measureQuery({
		begin() { const query = extension.createQueryEXT(); extension.beginQueryEXT(extension.TIME_ELAPSED_EXT, query); return query; },
		end() { extension.endQueryEXT(extension.TIME_ELAPSED_EXT); },
		available: query => extension.getQueryObjectEXT(query, extension.QUERY_RESULT_AVAILABLE_EXT),
		result: query => extension.getQueryObjectEXT(query, extension.QUERY_RESULT_EXT),
		disjoint: () => gl.getParameter(extension.GPU_DISJOINT_EXT),
		destroy: query => extension.deleteQueryEXT(query)
	}, callback, environment) };
}

async function measureQuery(adapter, callback, environment) {
	const query = adapter.begin();
	callback();
	adapter.end();
	const deadline = performanceNow(environment) + QUERY_TIMEOUT_MS;
	try {
		while (!adapter.available(query)) {
			if (performanceNow(environment) >= deadline) return null;
			await nextFrame(environment);
		}
		if (adapter.disjoint()) return null;
		return adapter.result(query) / 1_000_000;
	} finally {
		adapter.destroy(query);
	}
}

function setVisible(meshes, states) {
	meshes.forEach((mesh, index) => { mesh.visible = states[index]; });
}

function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
}

function nextFrame(environment) {
	return new Promise(resolve => (environment.requestAnimationFrame || setTimeout)(resolve));
}

function performanceNow(environment) {
	return environment.performance?.now?.() ?? Date.now();
}
