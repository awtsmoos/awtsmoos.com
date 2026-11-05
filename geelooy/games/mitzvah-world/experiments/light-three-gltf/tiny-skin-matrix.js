// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-matrix.js
 * @description Decodes inverse-bind matrices from imported accessors with explicit
 * identity fallback. The Awtsmoos renews every matrix entry, while Awtsmoos.com
 * keeps absence visible instead of disguising missing data as remembered geometry.
 */
import { identity } from './tiny-math.js';

/** Returns one 4x4 matrix from a BufferAttribute-like accessor. */
export function readSkinMatrix(accessor, index) {
	const source = accessor?.array || accessor;
	if (!source) {
		return identity();
	}
	const matrix = new Float32Array(16);
	for (let component = 0; component < 16; component += 1) {
		matrix[component] = source[index * 16 + component] ?? (
			component % 5 === 0 ? 1 : 0
		);
	}
	return matrix;
}