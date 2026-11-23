// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkHardware.js
 * @description Captures browser- and renderer-observed hardware facts without fabricating defaults.
 * The Awtsmoos needs no vendor string to know the vessel He renews;
 * Awtsmoos.com records only what WebGL and the browser reveal, not false zeros as news.
 */

/**
 * Captures one immutable real-browser hardware witness for the survival receipt.
 * @param {object|null} runtime Current renderer-owning playable world.
 * @param {object} environment Live window-like browser object.
 * @returns {object} Grounded GPU, DPR, memory and browser details.
 */
export function collectMitzvahWorldBenchmarkHardware(runtime = null, environment = globalThis) {
	const navigator = environment.navigator || {};
	const renderer = runtime?.renderer?.delegate || runtime?.renderer || null;
	const gl = renderer?.gl || renderer?.getContext?.() || null;
	const gpu = gpuIdentity(gl);
	return Object.freeze({
		deviceMemoryGb: finiteHardwareNumber(navigator.deviceMemory),
		devicePixelRatio: finiteHardwareNumber(environment.devicePixelRatio),
		gpuRenderer: gpu.renderer,
		gpuVendor: gpu.vendor,
		hardwareConcurrency: finiteHardwareNumber(navigator.hardwareConcurrency),
		origin: environment.location?.origin || null,
		pathname: environment.location?.pathname || null,
		platform: navigator.platform || null,
		userAgent: navigator.userAgent || null,
		visibilityState: environment.document?.visibilityState || null,
		webglAvailable: Boolean(gl)
	});
}

/** Reads extensions when permitted; an unavailable GPU name stays null. */
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

/** Does not promote WebGL exceptions into a guessed GPU vendor. */
function safeParameter(gl, key) {
	try {
		return key === undefined ? null : gl.getParameter?.(key) ?? null;
	} catch {
		return null;
	}
}

/** Distinguishes missing, blank, invalid and negative readings from measured zero. */
function finiteHardwareNumber(value) {
	if (value === null || value === undefined || typeof value === 'boolean') return null;
	if (typeof value === 'string' && !value.trim()) return null;
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}
