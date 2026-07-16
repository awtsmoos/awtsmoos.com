// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-math.js
 * @description Stable public gateway to focused mathematical vessels.
 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
 */

export {
	copyMat4,
	EPSILON,
	identity,
	inverse,
	mat4FromArray,
	multiply,
	scale,
	translate
} from './tiny-matrix-core.js';
export {
	composeTRS,
	quatMatrix,
	quatNormalize
} from './tiny-transform-math.js';
export {
	lookAt,
	perspective,
	transformPoint
} from './tiny-camera-math.js';
export {
	lerpArray,
	quatSlerp
} from './tiny-interpolation-math.js';
