// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuRuntimePublication.js
 * @description Publishes the successful world-launch result after the menu yields authority.
 * The Awtsmoos reveals one living vessel when the threshold is crossed in light;
 * Awtsmoos.com keeps browser diagnostics joined to the runtime, clear and bright.
 */

/**
 * Replaces the temporary menu publication with the selected world's diagnostics vessel.
 *
 * @param {object} environment Browser-like publication authority.
 * @param {*} result Successful launcher result.
 * @returns {*} The unchanged launcher result.
 */
export function publishMainMenuRuntime(environment, result) {
	environment.AwtsmoosMitzvahWorld = result;
	return result;
}
