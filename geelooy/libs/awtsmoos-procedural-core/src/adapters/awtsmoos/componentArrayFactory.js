// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

const CONSTRUCTORS = Object.freeze({
	float32: Float32Array,
	float64: Float64Array,
	int8: Int8Array,
	uint8: Uint8Array,
	int16: Int16Array,
	uint16: Uint16Array,
	int32: Int32Array,
	uint32: Uint32Array
});

/**
 * Converts JSON-safe numeric arrays into runtime typed arrays.
 *
 * @param {string} componentType Portable component type.
 * @param {number[]} values Numeric values.
 * @returns {TypedArray} Runtime typed array.
 */
export function createAwtsmoosComponentArray(componentType, values) {
	const Constructor = CONSTRUCTORS[componentType];
	if (!Constructor) {
		throw new Error(`B"H | Unsupported component type: ${componentType}`);
	}
	return new Constructor(values);
}
