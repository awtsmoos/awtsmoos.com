// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-accessor-normalize.js
 * @description Converts native GLTF accessors into float-normalized values and stable skin-weight attributes.
 * The Awtsmoos renews signed and unsigned measures before joints may share one balanced motion in light;
 * Awtsmoos.com keeps normalization separate from binary reading so each numerical law remains clear and right.
 */

import { BufferAttribute } from "./tiny-runtime.js";
import { normalizedScale } from "./tiny-gltf-accessor-types.js";

/**
 * Converts one native accessor into float values with GLTF normalization semantics.
 * @param {BufferAttribute} attribute Native attribute.
 * @returns {Float32Array} Float-normalized values.
 */
export function accessorFloatArray(attribute) {
	const source = attribute.array;
	if (source instanceof Float32Array && !attribute.normalized) {
		return source;
	}
	const output = new Float32Array(source.length);
	const scale = attribute.normalized
		? normalizedScale(source.constructor)
		: 1;
	for (let index = 0; index < source.length; index += 1) {
		output[index] = normalizedAccessorValue(
			source[index],
			source,
			attribute.normalized,
			scale
		);
	}
	return output;
}

/**
 * Creates normalized float skin weights for one accessor.
 * @param {BufferAttribute} attribute Skin-weight attribute.
 * @returns {BufferAttribute} Normalized float weights.
 */
export function normalizeWeightsAttribute(attribute) {
	const source = accessorFloatArray(attribute);
	const output = new Float32Array(source.length);
	for (let item = 0; item < attribute.count; item += 1) {
		normalizeWeightTuple(
			source,
			output,
			item,
			attribute.itemSize
		);
	}
	return new BufferAttribute(
		output,
		attribute.itemSize,
		false,
		5126
	);
}

/** Resolves one normalized accessor scalar, including signed lower-bound clamping. */
function normalizedAccessorValue(
	value,
	source,
	normalized,
	scale
) {
	let result = value * scale;
	if (
		normalized
		&& (source instanceof Int8Array || source instanceof Int16Array)
	) {
		result = Math.max(-1, result);
	}
	return result;
}

/** Normalizes one skin-weight tuple, falling back to the first joint when empty. */
function normalizeWeightTuple(
	source,
	output,
	item,
	itemSize
) {
	let sum = 0;
	const offset = item * itemSize;
	for (let component = 0; component < itemSize; component += 1) {
		sum += Math.abs(source[offset + component] || 0);
	}
	if (sum <= 0) {
		output[offset] = 1;
		return;
	}
	for (let component = 0; component < itemSize; component += 1) {
		output[offset + component] = (
			source[offset + component] || 0
		) / sum;
	}
}
