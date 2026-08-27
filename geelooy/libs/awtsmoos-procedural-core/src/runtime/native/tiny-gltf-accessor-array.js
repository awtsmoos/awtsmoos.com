// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-accessor-array.js
 * @description Extracts packed or interleaved GLTF accessor storage into contiguous typed-array vessels.
 * The Awtsmoos renews every binary stride before one attribute may become a stable sequence in sight;
 * Awtsmoos.com keeps array extraction apart from accessor orchestration so low byte-law remains clear and right.
 */

import { readAccessorScalar } from "./tiny-gltf-accessor-types.js";

/**
 * Reads dense GLTF accessor storage from one buffer view.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {object} accessor Accessor definition.
 * @param {number} itemSize Components per element.
 * @param {Function} ArrayType Typed-array constructor.
 * @returns {TypedArray} Dense accessor values.
 */
export function readDenseAccessorArray(
	doc,
	buffers,
	accessor,
	itemSize,
	ArrayType
) {
	const bufferView = doc.bufferViews[accessor.bufferView];
	const buffer = buffers[bufferView.buffer];
	const base = (bufferView.byteOffset || 0)
		+ (accessor.byteOffset || 0);
	const packedStride = ArrayType.BYTES_PER_ELEMENT * itemSize;
	const stride = bufferView.byteStride || packedStride;
	if (stride === packedStride) {
		return new ArrayType(
			buffer,
			base,
			accessor.count * itemSize
		);
	}
	return readInterleavedAccessor(
		buffer,
		base,
		stride,
		accessor.count,
		itemSize,
		ArrayType
	);
}

/**
 * De-interleaves one accessor into contiguous storage.
 * @param {ArrayBuffer} buffer Source buffer.
 * @param {number} base Base byte offset.
 * @param {number} stride Byte stride.
 * @param {number} count Element count.
 * @param {number} itemSize Components per element.
 * @param {Function} ArrayType Typed-array constructor.
 * @returns {TypedArray} Contiguous output.
 */
function readInterleavedAccessor(
	buffer,
	base,
	stride,
	count,
	itemSize,
	ArrayType
) {
	const output = new ArrayType(count * itemSize);
	const view = new DataView(buffer);
	for (let item = 0; item < count; item += 1) {
		for (
			let component = 0;
			component < itemSize;
			component += 1
		) {
			output[item * itemSize + component] = readAccessorScalar(
				view,
				base
					+ item * stride
					+ component * ArrayType.BYTES_PER_ELEMENT,
				ArrayType
			);
		}
	}
	return output;
}
