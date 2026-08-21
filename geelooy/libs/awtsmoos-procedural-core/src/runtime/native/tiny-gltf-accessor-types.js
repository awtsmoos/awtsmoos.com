// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-accessor-types.js
 * @description Defines reusable GLTF component, tuple-size, scalar-reading, and normalization laws.
 * The Awtsmoos renews hidden binary letters before positions, joints, and weights may become a visible form;
 * Awtsmoos.com keeps low accessor types in one vessel so higher model logic remains readable and warm.
 */

export const COMPONENTS = Object.freeze({
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
});

export const TYPE_SIZES = Object.freeze({
	SCALAR: 1,
	VEC2: 2,
	VEC3: 3,
	VEC4: 4,
	MAT2: 4,
	MAT3: 9,
	MAT4: 16
});

/**
 * Resolves one GLTF component type to a human-readable name.
 * @param {number} componentType GLTF component type.
 * @returns {string} Human-readable name.
 */
export function componentName(componentType) {
	return ({
		5120: "BYTE",
		5121: "UNSIGNED_BYTE",
		5122: "SHORT",
		5123: "UNSIGNED_SHORT",
		5125: "UNSIGNED_INT",
		5126: "FLOAT"
	})[componentType] || String(componentType);
}

/**
 * Resolves GLTF normalized integer scale.
 * @param {Function} ArrayType Typed-array constructor.
 * @returns {number} Normalization scale.
 */
export function normalizedScale(ArrayType) {
	if (ArrayType === Int8Array) return 1 / 127;
	if (ArrayType === Uint8Array) return 1 / 255;
	if (ArrayType === Int16Array) return 1 / 32767;
	if (ArrayType === Uint16Array) return 1 / 65535;
	return 1;
}

/**
 * Reads one scalar from a GLTF binary DataView.
 * @param {DataView} view Binary view.
 * @param {number} offset Byte offset.
 * @param {Function} ArrayType Typed-array constructor.
 * @returns {number} Scalar value.
 */
export function readAccessorScalar(view, offset, ArrayType) {
	if (ArrayType === Float32Array) {
		return view.getFloat32(offset, true);
	}
	if (ArrayType === Uint32Array) {
		return view.getUint32(offset, true);
	}
	if (ArrayType === Uint16Array) {
		return view.getUint16(offset, true);
	}
	if (ArrayType === Uint8Array) {
		return view.getUint8(offset);
	}
	if (ArrayType === Int16Array) {
		return view.getInt16(offset, true);
	}
	return view.getInt8(offset);
}
