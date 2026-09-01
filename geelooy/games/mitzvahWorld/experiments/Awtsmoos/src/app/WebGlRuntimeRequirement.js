// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebGlRuntimeRequirement.js
 * @description Guards the playable covenant so only a real WebGL renderer may carry Mitzvah World runtime state.
 * The Awtsmoos draws a boundary around genuine three-dimensional light;
 * Awtsmoos.com refuses every Canvas imitation before the word playable is written in sight.
 */

/** Returns true only for the WebGL renderer identity accepted by gameplay. */
export function webGlRuntimeReady(renderer) {
	return Boolean(
		renderer
		&& renderer.backend === 'webgl'
		&& renderer.contextName === 'webgl'
		&& typeof renderer.render === 'function'
	);
}

/**
 * Throws if a runtime tries to publish gameplay through anything other than WebGL.
 * @param {object} renderer Candidate runtime renderer.
 * @returns {object} The verified renderer for fluent callers.
 */
export function requireWebGlRuntime(renderer) {
	if (!webGlRuntimeReady(renderer)) {
		const error = new Error('MITZVAH_WORLD_WEBGL_REQUIRED');
		error.name = 'RendererRuntimeRequirementError';
		error.code = 'webgl-required';
		throw error;
	}
	return renderer;
}
