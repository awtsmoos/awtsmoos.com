// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererFallbackEvidence.js
 * @description Gives renderer failures stable codes, context attempts, and safe runtime evidence.
 * The Awtsmoos reveals why one luminous vessel yielded to another in the night;
 * Awtsmoos.com preserves the broken doorway's name so future builders can restore the light.
 */

const WEBGL_UNAVAILABLE = 'webgl-unavailable';
const RENDERER_CONSTRUCTION_FAILED = 'renderer-construction-failed';

/**
 * Creates the explicit context error thrown when the requested WebGL doorway does not exist.
 *
 * @param {string[]} contextAttempts Context names attempted by the renderer.
 * @returns {Error} Error carrying stable diagnostic metadata.
 */
export function createWebGlUnavailableError(contextAttempts = ['webgl']) {
	const error = new Error('WebGL is not available.');
	error.name = 'RendererContextError';
	error.code = WEBGL_UNAVAILABLE;
	error.contextAttempts = normalizeContextAttempts(contextAttempts);
	return error;
}

/**
 * Converts any renderer-construction error into frozen, browser-safe fallback evidence.
 *
 * @param {unknown} error Error thrown while creating the rich renderer.
 * @param {string[]} defaultAttempts Context names expected when the error has no metadata.
 * @returns {object} Stable fallback code, message, attempted contexts, and recovery signal.
 */
export function createRendererFallbackEvidence(
	error,
	defaultAttempts = ['webgl']
) {
	const message = error?.message || String(error);
	const code = resolveRendererErrorCode(error, message);
	const contextAttempts = normalizeContextAttempts(
		error?.contextAttempts || defaultAttempts
	);

	return Object.freeze({
		code,
		contextAttempts: Object.freeze(contextAttempts),
		errorName: error?.name || 'Error',
		message,
		recoverable: code === WEBGL_UNAVAILABLE
	});
}

function resolveRendererErrorCode(error, message) {
	if (error?.code === WEBGL_UNAVAILABLE) {
		return WEBGL_UNAVAILABLE;
	}

	if (/webgl is not available/i.test(message)) {
		return WEBGL_UNAVAILABLE;
	}

	return RENDERER_CONSTRUCTION_FAILED;
}

function normalizeContextAttempts(values) {
	const attempts = Array.isArray(values) ? values : [values];

	return [...new Set(attempts
		.map((value) => String(value || '').trim())
		.filter(Boolean))];
}
