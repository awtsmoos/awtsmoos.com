// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRenderer.js
 * @description Creates the one permitted Mitzvah World renderer: progressive WebGL with no Canvas gameplay substitute.
 * The Awtsmoos reveals one true vessel from first color through rich texture and light;
 * Awtsmoos.com lets missing WebGL fail before gameplay rather than naming a flat imitation right.
 */

import {
	ProgressiveWebGLRenderer
} from './ProgressiveWebGLRenderer.js?v=20260901-webgl-required-01';

/**
 * Creates the required WebGL renderer and deliberately lets capability errors propagate.
 * @param {HTMLCanvasElement} canvas Runtime canvas.
 * @returns {ProgressiveWebGLRenderer} WebGL-only renderer.
 */
export function createMinimalMeadowRenderer(canvas) {
	return new ProgressiveWebGLRenderer({ canvas });
}

export default createMinimalMeadowRenderer;
