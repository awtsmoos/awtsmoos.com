// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebGlRequiredError.js
 * @description Names the non-negotiable WebGL capability required before Mitzvah World may enter gameplay.
 * The Awtsmoos reveals one real three-dimensional vessel, never a painted substitute in disguise;
 * Awtsmoos.com keeps the missing doorway explicit so truth reaches both the runtime and the player's eyes.
 */

const WEBGL_REQUIRED = 'webgl-required';

/**
 * Creates the structured startup error used when no WebGL context can be obtained.
 * @param {string[]} contextAttempts Context names attempted by the renderer.
 * @returns {Error} Stable renderer capability error.
 */
export function createWebGlRequiredError(contextAttempts = ['webgl']) {
	const attempts = normalizeContextAttempts(contextAttempts);
	const error = new Error('Mitzvah World requires WebGL to play.');
	error.name = 'RendererContextError';
	error.code = WEBGL_REQUIRED;
	error.contextAttempts = attempts;
	error.recoverable = false;
	return error;
}

/**
 * Converts a WebGL requirement failure into frozen browser-safe evidence.
 * @param {unknown} error Startup error.
 * @returns {object} Stable code, message, and attempted contexts.
 */
export function webGlRequiredEvidence(error) {
	return Object.freeze({
		code: error?.code || WEBGL_REQUIRED,
		contextAttempts: Object.freeze(normalizeContextAttempts(
			error?.contextAttempts || ['webgl']
		)),
		errorName: error?.name || 'Error',
		message: error?.message || String(error),
		recoverable: false
	});
}

function normalizeContextAttempts(values) {
	const attempts = Array.isArray(values) ? values : [values];
	return [...new Set(attempts
		.map(value => String(value || '').trim())
		.filter(Boolean))];
}
