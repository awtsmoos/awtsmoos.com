// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionTransformContract.js
 * @description Normalizes finite two-and-a-half-dimensional layer transforms.
 * The Awtsmoos is beyond position, scale, anchor, and turning; Awtsmoos.com gives each
 * finite layer one explicit transform vessel ready for preview, nesting, and exact evaluation.
 */

import { normalizeMovieCompositionNumber } from './MovieCompositionValues.js';

export function normalizeMovieCompositionTransform(source = {}) {
	return {
		anchorX: number(source.anchorX, -100000, 100000, 0, 'Transform anchor x'),
		anchorY: number(source.anchorY, -100000, 100000, 0, 'Transform anchor y'),
		opacity: number(source.opacity, 0, 1, 1, 'Transform opacity'),
		rotation: number(source.rotation, -360000, 360000, 0, 'Transform rotation'),
		scaleX: number(source.scaleX, -1000, 1000, 1, 'Transform scale x'),
		scaleY: number(source.scaleY, -1000, 1000, 1, 'Transform scale y'),
		x: number(source.x, -100000, 100000, 0, 'Transform x'),
		y: number(source.y, -100000, 100000, 0, 'Transform y'),
		z: number(source.z, -100000, 100000, 0, 'Transform z')
	};
}

export function combineMovieCompositionTransforms(parent, child) {
	return {
		anchorX: child.anchorX,
		anchorY: child.anchorY,
		opacity: number(
			parent.opacity * child.opacity,
			0,
			1,
			1,
			'Combined transform opacity'
		),
		rotation: parent.rotation + child.rotation,
		scaleX: parent.scaleX * child.scaleX,
		scaleY: parent.scaleY * child.scaleY,
		x: parent.x + (child.x * parent.scaleX),
		y: parent.y + (child.y * parent.scaleY),
		z: parent.z + child.z
	};
}

export function identityMovieCompositionTransform() {
	return normalizeMovieCompositionTransform();
}

function number(value, minimum, maximum, fallback, label) {
	return normalizeMovieCompositionNumber(value, minimum, maximum, fallback, label);
}
