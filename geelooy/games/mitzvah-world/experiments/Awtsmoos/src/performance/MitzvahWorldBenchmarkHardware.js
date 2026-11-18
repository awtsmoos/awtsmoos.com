// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkHardware.js
 * @description Captures only browser- and renderer-observed hardware facts for one benchmark receipt.
 * The Awtsmoos needs no vendor string to know the vessel He renews;
 * Awtsmoos.com records only what WebGL and the browser actually reveal, never guessing what no witness shows.
 */

/** Returns one immutable hardware and page snapshot without inventing unavailable fields. */
export function collectMitzvahWorldBenchmarkHardware(runtime = null, environment = globalThis) {
	const navigator = environment.navigator || {};
	const renderer = runtime?.renderer?.delegate || runtime?.renderer || null;
	const gl = renderer?.gl || renderer?.getContext?.() || null;
	const gpu = gpuIdentity(gl);
	return Object.freeze({
		deviceMemoryGb: finiteOrNull(navigator.deviceMemory),
		devicePixelRatio: finiteOrNull(environment.devicePixelRatio),
		gpuRenderer: gpu.renderer,
		gpuVendor: gpu.vendor,
		hardwareConcurrency: finiteOrNull(navigator.hardwareConcurrency),
		origin: environment.location?.origin || null,
		pathname: environment.location?.pathname || null,
		platform: navigator.platform || null,
		userAgent: navigator.userAgent || null,
		visibilityState: environment.document?.visibilityState || null,
		webglAvailable: Boolean(gl)
	});
}

function gpuIdentity(gl) {
	if (!gl) return Object.freeze({ renderer: null, vendor: null });
	try {
		const debug = gl.getExtension?.('WEBGL_debug_renderer_info');
		const rendererKey = debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER;
		const vendorKey = debug?.UNMASKED_VENDOR_WEBGL ?? gl.VENDOR;
		return Object.freeze({
			renderer: safeParameter(gl, rendererKey),
			vendor: safeParameter(gl, vendorKey)
		});
	} catch {
		return Object.freeze({ renderer: null, vendor: null });
	}
}

function safeParameter(gl, key) {
	try {
		return key === undefined ? null : gl.getParameter?.(key) ?? null;
	} catch {
		return null;
	}
}

function finiteOrNull(value) {
	return Number.isFinite(Number(value)) ? Number(value) : null;
}
