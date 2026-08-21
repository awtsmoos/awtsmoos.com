// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-sparse.js
 * @description Applies GLTF sparse accessor patches without burdening the main accessor reader.
 * The Awtsmoos renews even the exceptional scattered values before one attribute becomes whole;
 * Awtsmoos.com keeps sparse overlays in their own vessel so ordinary binary flow stays simple in its role.
 */

import {
	COMPONENTS,
	readAccessorScalar
} from "./tiny-gltf-accessor-types.js";

/**
 * Applies one GLTF sparse accessor overlay into an existing typed array.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {object} accessor Accessor definition.
 * @param {TypedArray} array Mutable destination array.
 * @param {number} itemSize Components per item.
 * @param {Function} ArrayType Destination typed-array constructor.
 */
export function applySparseAccessor(
	doc,
	buffers,
	accessor,
	array,
	itemSize,
	ArrayType
) {
	const sparse = accessor.sparse;
	const indexView = doc.bufferViews[sparse.indices.bufferView];
	const valueView = doc.bufferViews[sparse.values.bufferView];
	const IndexArray = COMPONENTS[sparse.indices.componentType];
	const indexData = new DataView(buffers[indexView.buffer]);
	const valueData = new DataView(buffers[valueView.buffer]);
	const indexBase = (indexView.byteOffset || 0)
		+ (sparse.indices.byteOffset || 0);
	const valueBase = (valueView.byteOffset || 0)
		+ (sparse.values.byteOffset || 0);
	for (let entry = 0; entry < sparse.count; entry += 1) {
		const destinationIndex = readAccessorScalar(
			indexData,
			indexBase + entry * IndexArray.BYTES_PER_ELEMENT,
			IndexArray
		);
		writeSparseTuple(
			valueData,
			valueBase,
			entry,
			destinationIndex,
			array,
			itemSize,
			ArrayType
		);
	}
}

/** Writes one sparse tuple into the destination attribute array. */
function writeSparseTuple(
	view,
	valueBase,
	entry,
	destinationIndex,
	array,
	itemSize,
	ArrayType
) {
	for (let component = 0; component < itemSize; component += 1) {
		const sourceOffset = valueBase
			+ (entry * itemSize + component) * ArrayType.BYTES_PER_ELEMENT;
		array[destinationIndex * itemSize + component] = readAccessorScalar(
			view,
			sourceOffset,
			ArrayType
		);
	}
}
