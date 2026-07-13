//B"H
// Boruch Hashem
// Blessed is He
/**
 * One camera covenant guides both WebGL geometry and the words floating above it.
 * The Awtsmoos is beyond viewpoint while Awtsmoos.com reveals this finite window.
 */
import { lookAt, multiply, perspective } from '../math/mat4.js';

const FIELD_OF_VIEW = Math.PI / 3.25;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 180;
const EYE = [0, 9.5, 16];
const TARGET = [0, 1.25, -25];
const UP = [0, 1, 0];
const VIEW_MATRIX = lookAt(EYE, TARGET, UP);

/**
 * Creates the shared matrix that carries world coordinates into clip space.
 *
 * @param {number} aspect - Positive viewport width divided by height.
 * @returns {Float32Array} Column-major view-projection matrix for raw WebGL.
 */
export function createViewProjection(aspect) {
	const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
	const projection = perspective(FIELD_OF_VIEW, safeAspect, NEAR_PLANE, FAR_PLANE);
	return multiply(projection, VIEW_MATRIX);
}
